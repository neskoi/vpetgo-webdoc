import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const localesSource = await readFile(new URL("../src/shared/i18n/locales.ts", import.meta.url), "utf8");
const shellSource = await readFile(new URL("../src/features/shell/content.ts", import.meta.url), "utf8");
const enBlocks = JSON.parse(await readFile(new URL("../content/docs/en/blocks.json", import.meta.url), "utf8"));
const ptBrBlocks = JSON.parse(await readFile(new URL("../content/docs/pt-BR/blocks.json", import.meta.url), "utf8"));

test("locale configuration includes en and pt-BR with pt-BR fallback", () => {
  assert.match(localesSource, /supportedLocales = \["en", "pt-BR"\]/);
  assert.match(localesSource, /defaultLocale: Locale = "pt-BR"/);
});

test("public shell exposes only docs and about top-level navigation", () => {
  assert.match(shellSource, /docs: "Docs"/);
  assert.match(shellSource, /about: "About"/);
  assert.doesNotMatch(shellSource, /store|profile|login|admin/i);
});

test("localized documentation blocks preserve stable ids", () => {
  assert.deepEqual(
    enBlocks.map((block) => block.id),
    ptBrBlocks.map((block) => block.id)
  );
});
