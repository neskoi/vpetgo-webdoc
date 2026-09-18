# VPET GO Web Updater Specification

## Context

VPET GO users should be able to update the device directly from the documentation website without installing Arduino IDE, Arduino CLI, Python, or VPET GO Studio.

The firmware files are intentionally public in the VPET GO Google Drive because users can also download them and install them with VPET GO Studio. The web updater must reuse those exact release artifacts rather than introduce a second firmware packaging system.

## Goals

- Add a localized top-level Update page.
- Let the user select a serial port through Web Serial.
- Accept only the classic ESP32 with 16 MB flash used by VPET GO.
- Offer exactly two actions: Light Update and Full Update.
- Reuse the public Google Drive release artifacts.
- Validate release metadata and hashes before flashing.
- Preserve LittleFS during Light Update.
- Reproduce Studio's factory-selective VPGo install strategy during Full Update.
- Show connection, download, validation, erase, flashing, completion, and error states.

## Release Artifacts

### Light

Light Update consumes the public firmware binary plus its public `firmware_manifest.json`.

The manifest must declare:

- Format: `VPGO1`.
- Product: `V-Pet GO`.
- Package type: `firmware`.
- Chip: `esp32`.
- Flash size: 16 MB.
- App offset: `0x10000`.
- App partition size: `0x300000`.
- `preserves_littlefs: true`.
- SHA-256 for the firmware binary.

The browser verifies the SHA-256 before flashing.

### Full

Full Update consumes the same public `.vpgo` archive used by VPET GO Studio.

The archive must contain:

- `manifest.json`.
- `bootloader.bin`.
- `partitions.bin`.
- `boot_app0.bin`.
- `firmware.bin`.
- Sparse LittleFS segment files listed by the manifest.

The package must declare `install_strategy: factory_selective`.

The updater validates the package metadata, partition layout, erase regions, file sizes, and SHA-256 hashes before any erase operation.

## Flash Strategy

### Light Update

1. Download the public firmware binary through the same-origin firmware proxy.
2. Read release metadata supplied by the server from `firmware_manifest.json`.
3. Verify SHA-256.
4. Write the application at `0x10000`.
5. Do not erase the whole flash.
6. Reset the VPET GO.

### Full Update

1. Download the public `.vpgo` archive.
2. Parse `manifest.json`.
3. Verify `VPGO1`, classic ESP32, 16 MB flash, and the expected VPET GO partition layout.
4. Verify SHA-256 for bootloader, partition table, boot_app0, firmware, and every LittleFS sparse segment.
5. Selectively erase only the manifest-approved regions:
   - NVS: `0x9000`, size `0x5000`.
   - LittleFS: `0x310000`, size `0xCF0000`.
6. Flash:
   - Bootloader at `0x1000`.
   - Partition table at `0x8000`.
   - Boot App0 at `0xE000`.
   - Firmware at `0x10000`.
   - LittleFS sparse segments at their manifest offsets.
7. Reset the VPET GO.

Full Update must not use a whole-chip erase and must not require a merged 16 MB image.

## Delivery

The site uses a Next.js same-origin proxy for the public Google Drive files. The proxy exists to avoid browser CORS and Google redirect/interstitial differences.

The updater first downloads a stable public `latest.json` release pointer. That file supplies the current Light firmware ID, Light manifest ID, Full VPGo package ID, and release version. Normal firmware releases therefore require only replacing the contents of the existing `latest.json` file while preserving its Drive file ID.

The public `latest.json` ID is configuration, not a secret. An optional deployment environment variable can override it if the release-pointer file itself ever needs to move.

## Browser Support

The initial implementation targets desktop Chrome and Edge with native Web Serial support.

## BDD

### Scenario: User selects a VPET GO

Given the visitor uses a browser with Web Serial support
When the visitor selects the VPET GO serial port
Then the updater connects with esptool-js
And verifies the chip is classic ESP32
And verifies the flash size is 16 MB
And enables Light and Full Update.

### Scenario: Light Update preserves persistent storage

Given a validated VPET GO is connected
When the visitor starts Light Update
Then the updater downloads the current public firmware
And verifies it against the Light manifest SHA-256
And writes the app at `0x10000`
And does not erase LittleFS
And resets the device.

### Scenario: Full Update reproduces Studio installation

Given a validated VPET GO is connected
When the visitor confirms Full Update
Then the updater downloads the current public VPGo Full package
And validates the VPGo manifest and all component hashes
And selectively erases NVS and LittleFS
And writes the bootloader, partition table, boot_app0, firmware, and sparse LittleFS segments at their manifest-defined addresses
And resets the device.

### Scenario: Invalid package is rejected safely

Given a Full package has an unexpected chip, flash size, partition layout, erase region, file size, or SHA-256
When the updater validates it
Then no erase or flash begins
And the visitor receives an invalid firmware message.

### Scenario: Wrong device is selected

Given the visitor selects a serial device
When the connected chip is not classic ESP32 or does not have 16 MB flash
Then the updater refuses to flash it
And the visitor receives a localized error.

## Implementation Checklist

- [x] Add localized Update navigation entry.
- [x] Add localized Update page.
- [x] Add Web Serial connection flow.
- [x] Add ESP32 and 16 MB flash validation.
- [x] Add public Google Drive proxy.
- [x] Add stable public `latest.json` release pointer.
- [x] Add Light manifest metadata delivery.
- [x] Add Light SHA-256 verification.
- [x] Add VPGo ZIP parser without an additional ZIP dependency.
- [x] Add Full manifest safety validation.
- [x] Add Full component SHA-256 validation.
- [x] Add factory-selective NVS/LittleFS erase flow.
- [x] Add sparse LittleFS segment flashing.
- [x] Add progress and phase UI.
- [x] Add automated structural tests.
- [ ] Run production Next.js build in a network-enabled checkout.
- [x] Physically validate Light Update on VPET GO Original hardware.
- [x] Physically validate Full Update on VPET GO Original hardware.
