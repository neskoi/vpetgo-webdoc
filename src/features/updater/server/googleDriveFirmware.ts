export type FirmwareMode = "light" | "full";

type LatestReleaseManifest = {
  format: string;
  product: string;
  generation: string;
  version: string;
  light: {
    firmware_file_id: string;
    manifest_file_id: string;
  };
  full: {
    vpgo_file_id: string;
  };
};

type LightFirmwareManifest = {
  format: string;
  product: string;
  version: string;
  package_type: string;
  chip: string;
  flash_size: number;
  app_offset: number;
  app_size: number;
  file: string;
  size: number;
  sha256: string;
  preserves_littlefs: boolean;
};

export type FirmwareDelivery = {
  response: Response;
  metadataHeaders: Record<string, string>;
};

const DEFAULT_LATEST_FILE_ID = "1P3Nallzwe7fPpBp1M-BZ-NH-3lgPLgDO";

export function isFirmwareMode(value: string): value is FirmwareMode {
  return value === "light" || value === "full";
}

export async function fetchFirmwareFromDrive(mode: FirmwareMode): Promise<FirmwareDelivery> {
  const latest = await fetchLatestRelease();

  if (mode === "full") {
    return {
      response: await fetchPublicDriveFile(latest.full.vpgo_file_id),
      metadataHeaders: {
        "X-VPet-Package-Type": "full-vpgo",
        "X-VPet-Version": latest.version
      }
    };
  }

  const manifest = await fetchLightManifest(latest.light.manifest_file_id);
  const response = await fetchPublicDriveFile(latest.light.firmware_file_id);

  if (manifest.version !== latest.version) {
    throw new Error("latest.json and Light firmware manifest versions do not match.");
  }

  return {
    response,
    metadataHeaders: {
      "X-VPet-Package-Type": "light-bin",
      "X-VPet-Version": manifest.version,
      "X-VPet-App-Offset": String(manifest.app_offset),
      "X-VPet-App-Size": String(manifest.app_size),
      "X-VPet-SHA256": manifest.sha256,
      "X-VPet-Preserves-LittleFS": String(manifest.preserves_littlefs)
    }
  };
}

async function fetchLatestRelease(): Promise<LatestReleaseManifest> {
  const response = await fetchPublicDriveFile(
    process.env.GOOGLE_DRIVE_FIRMWARE_LATEST_FILE_ID || DEFAULT_LATEST_FILE_ID
  );
  const latest = (await response.json()) as LatestReleaseManifest;

  if (
    latest.format !== "VPGO_LATEST_1" ||
    latest.product !== "V-Pet GO" ||
    latest.generation !== "Nova" ||
    !latest.version ||
    !latest.light?.firmware_file_id ||
    !latest.light?.manifest_file_id ||
    !latest.full?.vpgo_file_id
  ) {
    throw new Error("Public latest.json is not compatible with VPET GO.");
  }

  return latest;
}

async function fetchLightManifest(fileId: string): Promise<LightFirmwareManifest> {
  const manifestResponse = await fetchPublicDriveFile(fileId);
  const manifest = (await manifestResponse.json()) as LightFirmwareManifest;

  if (
    manifest.format !== "VPGO1" ||
    manifest.product !== "V-Pet GO" ||
    manifest.package_type !== "firmware" ||
    manifest.chip !== "esp32" ||
    manifest.flash_size !== 16 * 1024 * 1024 ||
    manifest.app_offset !== 0x10000 ||
    manifest.app_size !== 0x300000 ||
    manifest.preserves_littlefs !== true ||
    !manifest.sha256
  ) {
    throw new Error("Public Light firmware manifest is not compatible with VPET GO.");
  }

  return manifest;
}

async function fetchPublicDriveFile(fileId: string): Promise<Response> {
  // VPET GO release files are intentionally public. The same-origin proxy
  // avoids browser CORS and Google Drive redirect differences.
  const url = new URL("https://drive.usercontent.google.com/download");
  url.searchParams.set("id", fileId);
  url.searchParams.set("export", "download");
  url.searchParams.set("confirm", "t");

  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow"
  });

  if (!response.ok) {
    return response;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  // Public Drive quota/interstitial responses can be HTML. Never forward one
  // of those pages to the browser as firmware or metadata.
  if (contentType.includes("text/html")) {
    throw new Error("Google Drive returned an HTML page instead of a release file.");
  }

  return response;
}
