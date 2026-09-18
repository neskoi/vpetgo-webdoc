export type VpgoEraseRegion = {
  name: string;
  offset: number;
  size: number;
};

export type VpgoFileDescriptor = {
  file: string;
  offset: number;
  size: number;
  sha256: string;
};

export type VpgoLittleFsSegment = {
  file: string;
  relative_offset: number;
  flash_offset: number;
  size: number;
  sha256: string;
};

export type VpgoManifest = {
  format: string;
  product: string;
  generation: string;
  version: string;
  package_type: string;
  chip: string;
  flash_size: number;
  install_strategy: string;
  requires_existing_bootloader: boolean;
  erase_regions: VpgoEraseRegion[];
  components: {
    bootloader: VpgoFileDescriptor;
    partition_table: VpgoFileDescriptor;
    boot_app0: VpgoFileDescriptor;
    firmware: VpgoFileDescriptor;
    littlefs: {
      offset: number;
      size: number;
      erase_first: boolean;
      erase_offset: number;
      erase_size: number;
      sparse: boolean;
      block_size: number;
      page_size: number;
      source_image_size: number;
      stored_bytes: number;
      segments: VpgoLittleFsSegment[];
    };
  };
};

export type VpgoFlashFile = {
  name: string;
  address: number;
  data: Uint8Array;
};

export type ParsedVpgoPackage = {
  manifest: VpgoManifest;
  eraseRegions: VpgoEraseRegion[];
  files: VpgoFlashFile[];
};

export class FirmwareValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirmwareValidationError";
  }
}

const EXPECTED_FLASH_SIZE = 16 * 1024 * 1024;
const EXPECTED_OFFSETS = {
  bootloader: 0x1000,
  partitionTable: 0x8000,
  nvs: 0x9000,
  bootApp0: 0xe000,
  firmware: 0x10000,
  littlefs: 0x310000
} as const;
const EXPECTED_NVS_SIZE = 0x5000;
const EXPECTED_LITTLEFS_SIZE = 0xcf0000;
const ESP32_APP_SLOT_SIZE = 0x300000;

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

export async function parseVpgoPackage(archive: Uint8Array): Promise<ParsedVpgoPackage> {
  const entries = parseZipDirectory(archive);
  const manifestBytes = await readZipEntry(archive, requireZipEntry(entries, "manifest.json"));
  const manifest = parseManifest(manifestBytes);

  validateManifestLayout(manifest);

  const componentDescriptors: Array<[string, VpgoFileDescriptor]> = [
    ["bootloader", manifest.components.bootloader],
    ["partition_table", manifest.components.partition_table],
    ["boot_app0", manifest.components.boot_app0],
    ["firmware", manifest.components.firmware]
  ];

  const files: VpgoFlashFile[] = [];

  for (const [name, descriptor] of componentDescriptors) {
    const data = await readAndVerifyFile(archive, entries, descriptor.file, descriptor.size, descriptor.sha256);
    files.push({
      name,
      address: descriptor.offset,
      data
    });
  }

  for (const segment of manifest.components.littlefs.segments) {
    const data = await readAndVerifyFile(archive, entries, segment.file, segment.size, segment.sha256);
    files.push({
      name: segment.file,
      address: segment.flash_offset,
      data
    });
  }

  return {
    manifest,
    eraseRegions: manifest.erase_regions,
    files
  };
}

export async function verifySha256(data: Uint8Array, expectedHash: string): Promise<void> {
  const actualHash = await sha256Hex(data);

  if (actualHash !== expectedHash.toLowerCase()) {
    throw new FirmwareValidationError("Firmware SHA-256 does not match its manifest.");
  }
}

function parseManifest(data: Uint8Array): VpgoManifest {
  try {
    return JSON.parse(new TextDecoder().decode(data)) as VpgoManifest;
  } catch {
    throw new FirmwareValidationError("VPGo package manifest is not valid JSON.");
  }
}

function validateManifestLayout(manifest: VpgoManifest): void {
  if (
    manifest.format !== "VPGO1" ||
    manifest.product !== "V-Pet GO" ||
    manifest.package_type !== "full" ||
    manifest.chip !== "esp32" ||
    manifest.flash_size !== EXPECTED_FLASH_SIZE ||
    manifest.install_strategy !== "factory_selective" ||
    manifest.requires_existing_bootloader !== false
  ) {
    throw new FirmwareValidationError("VPGo package metadata is not compatible with this updater.");
  }

  const { bootloader, partition_table, boot_app0, firmware, littlefs } = manifest.components;

  if (
    bootloader.offset !== EXPECTED_OFFSETS.bootloader ||
    partition_table.offset !== EXPECTED_OFFSETS.partitionTable ||
    boot_app0.offset !== EXPECTED_OFFSETS.bootApp0 ||
    firmware.offset !== EXPECTED_OFFSETS.firmware ||
    littlefs.offset !== EXPECTED_OFFSETS.littlefs ||
    littlefs.erase_offset !== EXPECTED_OFFSETS.littlefs ||
    littlefs.size !== EXPECTED_LITTLEFS_SIZE ||
    littlefs.erase_size !== EXPECTED_LITTLEFS_SIZE ||
    !littlefs.erase_first ||
    !littlefs.sparse
  ) {
    throw new FirmwareValidationError("VPGo package partition layout is not the expected VPET GO layout.");
  }

  if (firmware.size <= 0 || firmware.size > ESP32_APP_SLOT_SIZE) {
    throw new FirmwareValidationError("VPGo firmware does not fit in the VPET GO app partition.");
  }

  const nvsRegion = manifest.erase_regions.find((region) => region.name === "nvs");
  const littleFsRegion = manifest.erase_regions.find((region) => region.name === "littlefs");

  if (
    manifest.erase_regions.length !== 2 ||
    !nvsRegion ||
    nvsRegion.offset !== EXPECTED_OFFSETS.nvs ||
    nvsRegion.size !== EXPECTED_NVS_SIZE ||
    !littleFsRegion ||
    littleFsRegion.offset !== EXPECTED_OFFSETS.littlefs ||
    littleFsRegion.size !== EXPECTED_LITTLEFS_SIZE
  ) {
    throw new FirmwareValidationError("VPGo erase regions are not the expected factory-selective regions.");
  }

  let storedBytes = 0;

  for (const segment of littlefs.segments) {
    const expectedFlashOffset = littlefs.offset + segment.relative_offset;
    const segmentEnd = segment.flash_offset + segment.size;
    const littleFsEnd = littlefs.offset + littlefs.size;

    if (
      segment.flash_offset !== expectedFlashOffset ||
      segment.flash_offset < littlefs.offset ||
      segmentEnd > littleFsEnd ||
      segment.size <= 0
    ) {
      throw new FirmwareValidationError("VPGo LittleFS segment is outside the expected partition.");
    }

    storedBytes += segment.size;
  }

  if (storedBytes !== littlefs.stored_bytes) {
    throw new FirmwareValidationError("VPGo LittleFS stored byte count does not match its segment list.");
  }
}

async function readAndVerifyFile(
  archive: Uint8Array,
  entries: Map<string, ZipEntry>,
  fileName: string,
  expectedSize: number,
  expectedHash: string
): Promise<Uint8Array> {
  const data = await readZipEntry(archive, requireZipEntry(entries, fileName));

  if (data.byteLength !== expectedSize) {
    throw new FirmwareValidationError("VPGo package file size does not match its manifest: " + fileName);
  }

  await verifySha256(data, expectedHash);
  return data;
}

function parseZipDirectory(archive: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);

  if (eocdOffset < 0) {
    throw new FirmwareValidationError("VPGo package is not a valid ZIP archive.");
  }

  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const entries = new Map<string, ZipEntry>();
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      throw new FirmwareValidationError("VPGo ZIP central directory is invalid.");
    }

    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const fileNameBytes = archive.slice(offset + 46, offset + 46 + fileNameLength);
    const name = normalizeZipPath(new TextDecoder().decode(fileNameBytes));

    entries.set(name, {
      name,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset
    });

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

async function readZipEntry(archive: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const offset = entry.localHeaderOffset;

  if (view.getUint32(offset, true) !== 0x04034b50) {
    throw new FirmwareValidationError("VPGo ZIP local file header is invalid: " + entry.name);
  }

  const fileNameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const dataOffset = offset + 30 + fileNameLength + extraLength;
  const compressed = archive.slice(dataOffset, dataOffset + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return compressed;
  }

  if (entry.compressionMethod !== 8) {
    throw new FirmwareValidationError("VPGo ZIP uses an unsupported compression method.");
  }

  const RawDecompressionStream = DecompressionStream as unknown as new (format: string) => TransformStream;
  const decompressedStream = new Blob([compressed])
    .stream()
    .pipeThrough(new RawDecompressionStream("deflate-raw"));
  const data = new Uint8Array(await new Response(decompressedStream).arrayBuffer());

  if (data.byteLength !== entry.uncompressedSize) {
    throw new FirmwareValidationError("VPGo ZIP entry did not decompress to the expected size: " + entry.name);
  }

  return data;
}

function requireZipEntry(entries: Map<string, ZipEntry>, path: string): ZipEntry {
  const normalizedPath = normalizeZipPath(path);
  const entry = entries.get(normalizedPath);

  if (!entry) {
    throw new FirmwareValidationError("VPGo package is missing required file: " + normalizedPath);
  }

  return entry;
}

function normalizeZipPath(path: string): string {
  return path.replaceAll("\\", "/");
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimumOffset = Math.max(0, view.byteLength - 0xffff - 22);

  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      return offset;
    }
  }

  return -1;
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const bytes = new Uint8Array(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
