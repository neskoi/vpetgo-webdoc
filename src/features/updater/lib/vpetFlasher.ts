import {
  ESPLoader,
  Transport,
  type FlashFreqValues,
  type FlashModeValues,
  type FlashOptions,
  type FlashSizeValues,
  type IEspLoaderTerminal
} from "esptool-js";
import {
  FirmwareValidationError,
  parseVpgoPackage,
  verifySha256,
  type VpgoFlashFile
} from "./vpgoPackage";

export type UpdateMode = "light" | "full";
export type UpdatePhase = "validating" | "erasing" | "flashing";

export type VPetSession = {
  chipName: string;
  flashSize: string;
  loader: ESPLoader;
  transport: Transport;
};

export type LightFirmwareMetadata = {
  appOffset: number;
  sha256: string;
  version: string;
  preservesLittleFs: boolean;
};

export type DeviceValidationErrorCode =
  | "unsupported-browser"
  | "wrong-chip"
  | "wrong-flash-size";

export class DeviceValidationError extends Error {
  code: DeviceValidationErrorCode;

  constructor(code: DeviceValidationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "DeviceValidationError";
  }
}

type EsptoolSerialPort = ConstructorParameters<typeof Transport>[0];
type NavigatorWithSerial = Navigator & {
  serial: {
    requestPort(): Promise<EsptoolSerialPort>;
  };
};

const VPET_GO_APP_ADDRESS = 0x10000;
const VPET_GO_FLASH_SIZE = "16MB" as FlashSizeValues;
const VPET_GO_FLASH_MODE = "dio" as FlashModeValues;
const VPET_GO_FLASH_FREQUENCY = "40m" as FlashFreqValues;
const VPET_GO_BAUD_RATE = 921600;

const silentTerminal: IEspLoaderTerminal = {
  clean() {},
  write() {},
  writeLine() {}
};

export function supportsWebSerial(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

export async function connectToVPetGo(): Promise<VPetSession> {
  if (!supportsWebSerial()) {
    throw new DeviceValidationError("unsupported-browser", "Web Serial is not available.");
  }

  const serialNavigator = navigator as NavigatorWithSerial;
  const port = await serialNavigator.serial.requestPort();
  const transport = new Transport(port, false);
  const loader = new ESPLoader({
    transport,
    baudrate: VPET_GO_BAUD_RATE,
    terminal: silentTerminal,
    debugLogging: false
  });

  try {
    const chipName = await loader.main();

    // loader.main() returns the detailed package description (for example,
    // "ESP32-D0WDQ6 (revision 1)"), while CHIP_NAME is the canonical family.
    // Validate against the family so classic ESP32 variants are accepted
    // without accidentally allowing ESP32-S2/S3/C3/etc.
    if (loader.chip.CHIP_NAME !== "ESP32") {
      throw new DeviceValidationError(
        "wrong-chip",
        `The selected device is not a classic ESP32 (detected: ${chipName}).`
      );
    }

    const detectedFlashSize = await loader.detectFlashSize();

    if (detectedFlashSize !== "16MB") {
      throw new DeviceValidationError(
        "wrong-flash-size",
        "The selected ESP32 does not have the 16 MB flash expected by VPET GO."
      );
    }

    return {
      chipName,
      flashSize: detectedFlashSize,
      loader,
      transport
    };
  } catch (error) {
    await safeDisconnect(transport);
    throw error;
  }
}

export async function flashLightFirmware(
  session: VPetSession,
  firmware: Uint8Array,
  metadata: LightFirmwareMetadata,
  reportProgress: (percent: number) => void,
  reportPhase: (phase: UpdatePhase) => void
): Promise<void> {
  reportPhase("validating");

  if (
    metadata.appOffset !== VPET_GO_APP_ADDRESS ||
    !metadata.sha256 ||
    metadata.preservesLittleFs !== true
  ) {
    throw new FirmwareValidationError("Light firmware metadata is not compatible with VPET GO.");
  }

  await verifySha256(firmware, metadata.sha256);

  reportPhase("flashing");
  await writeFlashFiles(
    session.loader,
    [
      {
        name: "firmware",
        address: metadata.appOffset,
        data: firmware
      }
    ],
    reportProgress
  );

  await resetAndDisconnect(session);
}

export async function flashFullVpgo(
  session: VPetSession,
  vpgoArchive: Uint8Array,
  reportProgress: (percent: number) => void,
  reportPhase: (phase: UpdatePhase) => void
): Promise<void> {
  reportPhase("validating");
  const vpgo = await parseVpgoPackage(vpgoArchive);

  reportPhase("erasing");

  for (const region of vpgo.eraseRegions) {
    await eraseFlashRegion(session.loader, region.offset, region.size);
  }

  reportPhase("flashing");
  await writeFlashFiles(session.loader, vpgo.files, reportProgress);

  await resetAndDisconnect(session);
}

export async function disconnectVPetSession(session: VPetSession | null): Promise<void> {
  if (session) {
    await safeDisconnect(session.transport);
  }
}

async function writeFlashFiles(
  loader: ESPLoader,
  files: VpgoFlashFile[],
  reportProgress: (percent: number) => void
): Promise<void> {
  const sortedFiles = [...files].sort((left, right) => left.address - right.address);
  const totalBytes = sortedFiles.reduce((total, file) => total + file.data.byteLength, 0);
  const bytesBeforeFile = sortedFiles.map((_, fileIndex) =>
    sortedFiles
      .slice(0, fileIndex)
      .reduce((total, file) => total + file.data.byteLength, 0)
  );

  const flashOptions: FlashOptions = {
    fileArray: sortedFiles.map((file) => ({
      data: file.data,
      address: file.address
    })),
    flashMode: VPET_GO_FLASH_MODE,
    flashFreq: VPET_GO_FLASH_FREQUENCY,
    flashSize: VPET_GO_FLASH_SIZE,
    eraseAll: false,
    compress: true,
    reportProgress: (fileIndex, written, transferTotal) => {
      const fileSize = sortedFiles[fileIndex]?.data.byteLength ?? 0;
      const currentFileEquivalent =
        transferTotal > 0 ? fileSize * (written / transferTotal) : 0;
      const completedBytes = (bytesBeforeFile[fileIndex] ?? 0) + currentFileEquivalent;

      reportProgress(
        totalBytes > 0
          ? Math.min(100, Math.round((completedBytes / totalBytes) * 100))
          : 0
      );
    }
  };

  await loader.writeFlash(flashOptions);
  reportProgress(100);
}

async function eraseFlashRegion(loader: ESPLoader, offset: number, size: number): Promise<void> {
  const sectorSize = 0x1000;

  if (!loader.IS_STUB) {
    throw new FirmwareValidationError("Selective Full Update erase requires the ESP32 stub loader.");
  }

  if (offset % sectorSize !== 0 || size % sectorSize !== 0 || size <= 0) {
    throw new FirmwareValidationError("VPGo erase region is not flash-sector aligned.");
  }

  const packet = concatBytes(uint32Le(offset), uint32Le(size));
  const timeout = Math.min(
    loader.timeoutPerMb(loader.ERASE_REGION_TIMEOUT_PER_MB, size),
    loader.MAX_TIMEOUT
  );

  await loader.checkCommand(
    "erase flash region",
    loader.ESP_ERASE_REGION,
    packet,
    0,
    0,
    timeout
  );
}

async function resetAndDisconnect(session: VPetSession): Promise<void> {
  // VPET GO uses the classic ESP32 USB-UART auto-reset circuit. esptool-js
  // 0.6.1's generic hard_reset only releases RTS, which may not create a new
  // EN pulse if RTS is already released after flashing. Drive an explicit
  // reset pulse while keeping GPIO0 out of download mode so the new firmware
  // starts immediately.
  await session.transport.setDTR(false);
  await session.transport.setRTS(true);
  await sleep(100);
  await session.transport.setRTS(false);
  await sleep(150);
  await session.transport.setDTR(false);

  await safeDisconnect(session.transport);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function uint32Le(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  ]);
}

function concatBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  const result = new Uint8Array(left.byteLength + right.byteLength);
  result.set(left, 0);
  result.set(right, left.byteLength);
  return result;
}

async function safeDisconnect(transport: Transport): Promise<void> {
  try {
    await transport.disconnect();
  } catch {
    // The device can disappear during reset; disconnect is best-effort.
  }
}
