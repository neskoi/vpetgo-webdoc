# Single Current Device Documentation Specification

## Context

The documentation now publishes a single current device version, but its automatic renderer still models text, images, videos, and custom entries as heterogeneous typed blocks. In practice, every localized automatic block is text, while images, videos, specialized layouts, and behavior are responsibilities of custom documentation components. Keeping media types in the generic content schema adds flexibility the product does not use.

[ADR 002: Single Current Device Documentation](../adr/002-single-current-device-documentation.md) establishes that the public site describes only the current supported VPET GO device release. This specification defines the migration from version-aware content to direct current content and makes the displayed device version an explicit deployment configuration.

## Goals

- Publish a single living documentation version for the current supported VPET GO release.
- Represent automatically rendered documentation as ordered localized paragraphs.
- Keep media, specialized layouts, behavior, and component-specific data out of the automatic content schema.
- Remove version fallback, comparison, and block visibility logic.
- Display the current device version from required server-side configuration.
- Keep localized documentation aligned with the same current device behavior.
- Preserve historical documentation through Git rather than the runtime application.

## Non-Goals

- Do not provide a documentation version selector.
- Do not preserve historical documentation variants in content files.
- Do not add version comparison, diff, inheritance, or change badges.
- Do not parse or validate the configured value as semantic versioning.
- Do not derive the documentation version from firmware delivery artifacts.
- Do not introduce release notes or a changelog in this slice.
- Do not change documentation navigation, visual design, or locale routing beyond what the migration requires.
- Do not make the automatic documentation renderer support images, videos, or custom component dispatch.

## Functional Requirements

### Current Device Version

The deployment must define:

```text
VPETGO_CURRENT_DEVICE_VERSION
```

The localized docs route must read the variable on the server, trim surrounding whitespace, and reject a missing or empty value with an explicit configuration error. There must be no hardcoded fallback.

The route must pass the validated value to `DocsPage` as `currentDeviceVersion`. `DocsPage` may display it in the documentation heading, but it must not use it to select, filter, order, or resolve content.

### Documentation Content Model

Each documentation node must store its automatically rendered content as an ordered array of localized paragraphs:

```json
{
  "id": "status",
  "title": "Status",
  "content": [
    "First current documentation paragraph.",
    "Second current documentation paragraph."
  ]
}
```

The automatic content model must not contain:

- a `type` discriminator
- image, video, or custom block variants
- `vpetVersions`
- `changes`
- version-keyed text values

Documentation hierarchy, navigation ids, and locale separation remain unchanged. Custom documentation components are selected outside the automatic renderer and own their media, layouts, behavior, accessibility metadata, and component-specific data contracts.

### Rendering

The automatic documentation renderer must render every paragraph provided by the active documentation node, in array order. It must not perform type dispatch, compare content with the current device version, or suppress paragraphs based on version metadata.

The documentation component chain must accept `string[]` instead of `DocContentBlock[]`. The generic block union and automatic image, video, and custom-block branches must be removed.

Custom article selection may remain keyed by the documentation node id. Once selected, a custom component is responsible for its own images, videos, specialized markup, behavior, accessibility metadata, and scoped data.

The version resolver and all `currentVersion` properties used only for content resolution must remain absent from the documentation component chain.

### Localization

English and Brazilian Portuguese documentation files must use the same paragraph-array schema. Each locale owns its translated current content. No locale may retain typed automatic blocks or version-only fields after migration.

This change does not introduce cross-locale content fallback.

### Historical Content

Old documentation content must not remain in production content files solely for historical access. Repository history is the source for previous documentation states. Future release notes or changelogs must remain separate from the documentation node model.

## Error Handling

- A missing `VPETGO_CURRENT_DEVICE_VERSION` must fail explicitly when rendering the documentation route.
- An empty or whitespace-only value must be handled as missing.
- The application must not silently substitute a source-code version.
- Invalid documentation content must continue to fail through the project's existing type-checking and build validation.

## Migration Scope

The migration includes:

- The documentation node content type.
- The shared content resolver.
- The documentation renderer.
- Documentation article component properties.
- The boundary between automatic rendering and custom article components.
- The docs page and localized docs route.
- English and Brazilian Portuguese documentation JSON.
- Environment examples and relevant setup documentation.
- Tests that assert the content schema and version configuration behavior.

The migration must remove both the superseded version-aware implementation and the unused heterogeneous automatic block model rather than maintain compatibility layers.

## BDD

### Scenario: Visitor reads the current documentation

Given the deployment defines `VPETGO_CURRENT_DEVICE_VERSION`
And the localized documentation describes the current supported device release
When the visitor opens the documentation page
Then the page displays the configured device version
And the page renders the current documentation content
And no documentation version selector is shown.

### Scenario: Automatic documentation renders ordered paragraphs

Given the active documentation node contains an ordered array of localized paragraphs
When the automatic documentation renderer receives that content
Then it renders every paragraph in array order
And it performs no content-type dispatch
And it performs no device-version comparison
And it performs no fallback to content from another version.

### Scenario: Custom documentation presents media

Given a documentation topic requires an image, video, specialized layout, or behavior
When that topic is rendered
Then a custom documentation component presents it
And the component owns its media and accessibility metadata
And the generic documentation content schema is not expanded with a media block type.

### Scenario: Current device version configuration is missing

Given `VPETGO_CURRENT_DEVICE_VERSION` is missing, empty, or whitespace-only
When the documentation route is rendered
Then the application fails with an explicit configuration error
And it does not display a hardcoded fallback version.

### Scenario: Documentation is updated for a new device release

Given a new VPET GO release becomes the current supported device version
When maintainers update both localized documentation files and deployment configuration
Then the published site describes only the new current release
And the displayed device version identifies that release
And previous documentation remains available only through repository history.

### Scenario: Visitor changes locale

Given English and Brazilian Portuguese documentation use the paragraph-array schema
When the visitor changes locale
Then the selected locale displays its translation of the current documentation
And both locales identify the same configured device version
And no historical version fallback occurs.

### Scenario: Historical release information is needed

Given maintainers need to communicate changes from a previous release
When they publish historical release information
Then they use a release note or changelog outside the documentation node model
And they do not add version branches to documentation content.

## Implementation Checklist

### Completed: Single-Version Migration

- [x] Mark ADR 001 as superseded by ADR 002.
- [x] Add `VPETGO_CURRENT_DEVICE_VERSION` to `.env.example`.
- [x] Add a server-side reader for `VPETGO_CURRENT_DEVICE_VERSION`.
- [x] Reject a missing `VPETGO_CURRENT_DEVICE_VERSION`.
- [x] Reject an empty `VPETGO_CURRENT_DEVICE_VERSION`.
- [x] Reject a whitespace-only `VPETGO_CURRENT_DEVICE_VERSION`.
- [x] Pass `currentDeviceVersion` from the localized docs route to `DocsPage`.
- [x] Remove the hardcoded device version from `DocsPage`.
- [x] Display `currentDeviceVersion` as documentation metadata.
- [x] Remove `VersionedText` from documentation types.
- [x] Remove version-specific shared fields from documentation block types.
- [x] Change text block content to a direct string.
- [x] Remove the versioned text resolver.
- [x] Remove version-based block visibility logic.
- [x] Remove `currentVersion` from `DocContentRenderer`.
- [x] Remove `currentVersion` from documentation article components.
- [x] Render text block strings directly.
- [x] Migrate English documentation text blocks to direct strings.
- [x] Migrate Brazilian Portuguese documentation text blocks to direct strings.
- [x] Remove `vpetVersions` from all documentation content files.
- [x] Remove `changes` from all documentation content files.
- [x] Update obsolete ADR 001 references in project specifications.
- [x] Add a test for configured device version presentation.
- [x] Add a test for missing device version configuration.
- [x] Add a test for empty device version configuration.
- [x] Add a test proving blocks render without version filtering.
- [x] Add a test proving documentation content has no version-specific fields.
- [x] Run the test suite.
- [x] Run the production build.

### Completed: Paragraph-Only Automatic Rendering

- [x] Change `DocNode.content` to `string[]`.
- [x] Remove `DocContentBlock` and its text, image, video, and custom variants.
- [x] Change documentation article content properties to `string[]`.
- [x] Simplify the automatic content renderer to render paragraphs only.
- [x] Remove content-type dispatch from the automatic renderer.
- [x] Remove `type` from English automatic documentation content.
- [x] Remove `type` from Brazilian Portuguese automatic documentation content.
- [x] Convert English content strings to paragraph arrays.
- [x] Convert Brazilian Portuguese content strings to paragraph arrays.
- [x] Keep media and accessibility metadata scoped to custom documentation components.
- [x] Update content schema tests for paragraph arrays without type discriminators.
- [x] Add a test proving automatic paragraphs preserve array order.
- [x] Run the test suite and production build after the paragraph migration.

## Acceptance Criteria

- The public documentation represents only the current supported VPET GO release.
- `VPETGO_CURRENT_DEVICE_VERSION` is the only documentation device-version value.
- The device version is supplied by deployment configuration with no source-code fallback.
- Documentation content contains no historical version branches or fallback metadata.
- Automatically rendered documentation uses ordered paragraph arrays without type discriminators.
- The automatic renderer contains no image, video, or custom-block branches.
- Media and specialized behavior are owned by custom documentation components.
- English and Brazilian Portuguese content conform to the paragraph-array schema.
- No documentation version selector or historical documentation UI exists.
- Tests and the production build pass.
