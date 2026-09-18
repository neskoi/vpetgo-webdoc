import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const en = JSON.parse(await readFile(new URL("../content/en.json", import.meta.url), "utf8"));
const ptBr = JSON.parse(await readFile(new URL("../content/pt-BR.json", import.meta.url), "utf8"));
const driveSource = await readFile(
  new URL("../src/features/updater/server/googleDriveFirmware.ts", import.meta.url),
  "utf8"
);
const flasherSource = await readFile(
  new URL("../src/features/updater/lib/vpetFlasher.ts", import.meta.url),
  "utf8"
);
const vpgoSource = await readFile(
  new URL("../src/features/updater/lib/vpgoPackage.ts", import.meta.url),
  "utf8"
);

test("web updater uses the supported esptool-js release", () => {
  assert.equal(packageJson.dependencies["esptool-js"], "^0.6.1");
});

test("updater navigation is localized", () => {
  assert.equal(typeof en.shell.navigation.update, "string");
  assert.equal(typeof ptBr.shell.navigation.update, "string");
  assert.ok(en.shell.navigation.update.length > 0);
  assert.ok(ptBr.shell.navigation.update.length > 0);
});

test("updater content exposes Light, Full, validation and erase states", () => {
  for (const localeContent of [en, ptBr]) {
    assert.equal(typeof localeContent.updater.panel.lightAction, "string");
    assert.equal(typeof localeContent.updater.panel.fullAction, "string");
    assert.equal(typeof localeContent.updater.panel.status.validating, "string");
    assert.equal(typeof localeContent.updater.panel.status.erasing, "string");
    assert.equal(typeof localeContent.updater.panel.errors.invalidFirmware, "string");
  }
});

test("updater requires the public latest manifest file ID from the environment", () => {
  assert.match(driveSource, /process\.env\.GOOGLE_DRIVE_FIRMWARE_LATEST_FILE_ID/);
  assert.match(driveSource, /GOOGLE_DRIVE_FIRMWARE_LATEST_FILE_ID environment variable is required/);
  assert.doesNotMatch(driveSource, /DEFAULT_LATEST_FILE_ID/);
  assert.doesNotMatch(driveSource, /1P3Nallzwe7fPpBp1M-BZ-NH-3lgPLgDO/);
  assert.match(driveSource, /VPGO_LATEST_1/);
  assert.match(driveSource, /firmware_file_id/);
  assert.match(driveSource, /manifest_file_id/);
  assert.match(driveSource, /vpgo_file_id/);
});

test("classic ESP32 validation uses the canonical chip family", () => {
  assert.match(flasherSource, /loader\.chip\.CHIP_NAME\s*!==\s*"ESP32"/);
  assert.doesNotMatch(flasherSource, /chipName\s*!==\s*"ESP32"/);
});

test("Full Update is selective and VPGo package driven", () => {
  assert.match(flasherSource, /ESP_ERASE_REGION/);
  assert.doesNotMatch(flasherSource, /eraseAll:\s*true/);
  assert.match(vpgoSource, /factory_selective/);
  assert.match(vpgoSource, /0x310000/);
  assert.match(vpgoSource, /0xcf0000/);
});
