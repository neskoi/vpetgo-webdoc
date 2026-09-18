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

function getDocumentationNodes(nodes) {
  return nodes.flatMap((node) => [node, ...getDocumentationNodes(node.children ?? [])]);
}

test("automatic documentation uses ordered paragraph arrays without type discriminators", () => {
  for (const sections of [enSections, ptBrSections]) {
    const contentNodes = getDocumentationNodes(sections).filter((node) => node.content);

    assert.ok(contentNodes.length > 0);

    for (const node of contentNodes) {
      assert.ok(Array.isArray(node.content));
      for (const paragraph of node.content) {
        assert.equal(typeof paragraph, "string");
        assert.ok(paragraph.length > 0);
      }
    }

    assert.doesNotMatch(JSON.stringify(sections), /"type"|vpetVersions|"changes"/);
  }
});

test("automatic documentation renders paragraphs in array order without type dispatch", () => {
  assert.doesNotMatch(
    typesSource,
    /DocContentBlock|DocTextBlock|DocImageBlock|DocVideoBlock|DocCustomBlock|type:/
  );
  assert.match(typesSource, /content\?: string\[\]/);
  assert.doesNotMatch(siteContentSource, /resolveVersionedText|currentVersion/);
  assert.doesNotMatch(
    contentRendererSource,
    /next\/image|iframe|CustomComponent|block\.type|\.sort\(|\.reverse\(/
  );
  assert.match(contentRendererSource, /paragraphs\.map\(\(paragraph, index\)/);
  assert.match(contentRendererSource, /<p key=\{index\}>\{paragraph\}<\/p>/);
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
