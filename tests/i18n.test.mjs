import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const localesSource = await readFile(new URL("../src/shared/i18n/locales.ts", import.meta.url), "utf8");
const enContent = JSON.parse(await readFile(new URL("../content/en.json", import.meta.url), "utf8"));
const enSections = JSON.parse(await readFile(new URL("../content/docs/en/sections.json", import.meta.url), "utf8"));
const ptBrSections = JSON.parse(await readFile(new URL("../content/docs/pt-BR/sections.json", import.meta.url), "utf8"));

function getNavigationIds(items) {
  return items.flatMap((item) => {
    if (item.type === "group") {
      return [item.id, ...item.sections.map((section) => section.id)];
    }

    return [item.id];
  });
}

test("locale configuration includes en and pt-BR with pt-BR fallback", () => {
  assert.match(localesSource, /supportedLocales = \["en", "pt-BR"\]/);
  assert.match(localesSource, /defaultLocale: Locale = "pt-BR"/);
});

test("public shell exposes the expected top-level navigation", () => {
  assert.deepEqual(Object.keys(enContent.shell.navigation), ["docs", "download", "about"]);
});

test("localized documentation navigation preserves stable ids", () => {
  assert.deepEqual(getNavigationIds(enSections), getNavigationIds(ptBrSections));
});

test("documentation navigation groups are localized dividers", () => {
  assert.deepEqual(enSections.map((item) => item.id), ["getting-started", "on-vpet-go"]);
  assert.deepEqual(enSections.map((item) => item.title), ["Getting Started", "On Vpet GO"]);
  assert.deepEqual(ptBrSections.map((item) => item.title), ["Primeiros Passos", "No Vpet GO"]);
});
