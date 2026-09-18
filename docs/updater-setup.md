# VPET GO Web Updater Setup

## Overview

The web updater intentionally reuses the same public Google Drive release artifacts used by VPET GO Studio.

No Google account, OAuth token, service account, or private key is required.

The website proxies the public Drive files through same-origin Next.js endpoints to avoid browser CORS and Google redirect/interstitial differences.

## Current Public Release

The current reference release is VPET GO Nova 1.8.0 beta.

The updater resolves the active release through one stable public Drive file configured at deployment:

```text
latest.json
GOOGLE_DRIVE_FIRMWARE_LATEST_FILE_ID
```

`latest.json` contains the current Light firmware file ID, Light manifest file ID, Full VPGo package file ID, and release version.

The deployment must provide the `latest.json` file ID:

```text
GOOGLE_DRIVE_FIRMWARE_LATEST_FILE_ID
```

Because the file is public, this ID is configuration rather than a secret.

The firmware endpoint returns an unavailable response when this variable is missing or empty.

## Light Update

Light uses the normal firmware binary and `firmware_manifest.json`.

The current manifest declares:

- ESP32.
- 16 MB flash.
- Application offset `0x10000`.
- Application partition size `0x300000`.
- LittleFS preservation.
- SHA-256 for the firmware binary.

The updater verifies the SHA-256 in the browser before writing the application.

## Full Update

Full uses the existing `.vpgo` package generated for VPET GO Studio.

The updater opens the ZIP in the browser and reads its internal `manifest.json`. No merged `full.bin` is needed.

For the current factory-selective layout, Full Update:

1. Validates the VPGo package metadata and every file SHA-256.
2. Selectively erases NVS at `0x9000` for `0x5000` bytes.
3. Selectively erases LittleFS at `0x310000` for `0xCF0000` bytes.
4. Writes bootloader at `0x1000`.
5. Writes the partition table at `0x8000`.
6. Writes boot_app0 at `0xE000`.
7. Writes firmware at `0x10000`.
8. Writes the sparse LittleFS segments at the offsets listed in the package manifest.
9. Hard-resets the device.

The browser refuses packages that try to change the expected VPET GO partition/erase layout.

## Release Updates

For a new release:

1. Upload the new public Light firmware, Light manifest, and Full VPGo package to the Firmware folder in Google Drive.
2. Copy the three new Drive file IDs.
3. Update the existing `latest.json` content with the new release version and IDs.
4. Replace the bytes of the existing `latest.json` file in place so its Drive ID remains unchanged.

No source-code change or site deployment is required for normal firmware releases.

## Deployment

The updater requires:

- A Next.js host with Node.js Route Handler support.
- HTTPS in production.
- Desktop Chrome or Edge for native Web Serial.

## Physical Validation Order

1. Open the updater in Chrome or Edge over HTTPS.
2. Select a VPET GO and confirm it is detected as ESP32 with 16 MB flash.
3. Run Light Update.
4. Confirm the installed firmware changed and LittleFS/saves/content remained intact.
5. Use a device whose stored data can be erased.
6. Run Full Update.
7. Confirm NVS was reset, the new LittleFS content was installed, and the device boots normally.
8. Light Update and Full Update were physically validated on VPET GO Original hardware on 2026-09-17.
9. After a production build passes, merge the feature into production.
