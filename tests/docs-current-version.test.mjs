import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const typesSource = await readFile(
  new URL("../src/features/docs/types.ts", import.meta.url),
  "utf8"
);
const contentRendererSource = await readFile(
  new URL(
    "../src/features/docs/components/DocContentRenderer/DocContentRenderer.tsx",
    import.meta.url
  ),
  "utf8"
);
const docsPageSource = await readFile(
  new URL("../src/features/docs/DocsPage/DocsPage.tsx", import.meta.url),
  "utf8"
);
const docsRouteSource = await readFile(
  new URL("../src/app/[locale]/docs/page.tsx", import.meta.url),
  "utf8"
);
const versionConfigSource = await readFile(
  new URL(
    "../src/features/docs/server/currentDeviceVersion.ts",
    import.meta.url
  ),
  "utf8"
);
const siteContentSource = await readFile(
  new URL("../src/shared/content/siteContent.ts", import.meta.url),
  "utf8"
);
const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const adr001 = await readFile(
  new URL("../docs/adr/001-doc-structure.md", import.meta.url),
  "utf8"
);
const enSections = JSON.parse(
  await readFile(new URL("../content/docs/en/sections.json", import.meta.url), "utf8")
);
const ptBrSections = JSON.parse(
  await readFile(
    new URL("../content/docs/pt-BR/sections.json", import.meta.url),
    "utf8"
  )
);

function getContentBlocks(nodes) {
  return nodes.flatMap((node) => [
    ...(node.content ?? []),
    ...getContentBlocks(node.children ?? [])
  ]);
}

test("documentation content uses the single current-content schema", () => {
  for (const sections of [enSections, ptBrSections]) {
    const blocks = getContentBlocks(sections);

    assert.ok(blocks.length > 0);

    for (const block of blocks) {
      assert.equal(Object.hasOwn(block, "vpetVersions"), false);
      assert.equal(Object.hasOwn(block, "changes"), false);

      if (block.type === "text") {
        assert.equal(typeof block.content, "string");
        assert.ok(block.content.length > 0);
      }
    }
  }
});

test("documentation rendering has no version resolution or filtering", () => {
  assert.doesNotMatch(typesSource, /VersionedText|VersionedContent|vpetVersions|changes/);
  assert.doesNotMatch(siteContentSource, /resolveVersionedText|currentVersion/);
  assert.doesNotMatch(
    contentRendererSource,
    /resolveVersionedText|shouldRenderBlock|currentVersion|vpetVersions/
  );
  assert.match(contentRendererSource, /blocks\.map\(/);
  assert.match(contentRendererSource, /block\.content/);
});

test("current device version is required server-side and passed for presentation", () => {
  assert.match(
    versionConfigSource,
    /process\.env\.VPETGO_CURRENT_DEVICE_VERSION\?\.trim\(\)/
  );
  assert.match(
    versionConfigSource,
    /VPETGO_CURRENT_DEVICE_VERSION environment variable is required/
  );
  assert.doesNotMatch(versionConfigSource, /\|\||1\.7\.0/);
  assert.match(docsRouteSource, /getCurrentDeviceVersion\(\)/);
  assert.match(docsRouteSource, /currentDeviceVersion=/);
  assert.match(docsPageSource, /currentDeviceVersion: string/);
  assert.match(docsPageSource, /\{currentDeviceVersion\}/);
  assert.doesNotMatch(docsPageSource, /currentVersion|1\.7\.0/);
  assert.match(envExample, /^VPETGO_CURRENT_DEVICE_VERSION=.+$/m);
});

test("ADR 001 is superseded by ADR 002", () => {
  assert.match(adr001, /Superseded by \[ADR 002:/);
});
