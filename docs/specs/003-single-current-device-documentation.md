# Single Current Device Documentation Specification

## Context

The documentation currently models content as version-aware blocks and hardcodes a current device version in the client page. This follows ADR 001 but introduces runtime and editorial complexity that the product does not need.

[ADR 002: Single Current Device Documentation](../adr/002-single-current-device-documentation.md) establishes that the public site describes only the current supported VPET GO device release. This specification defines the migration from version-aware content to direct current content and makes the displayed device version an explicit deployment configuration.

## Goals

- Publish a single living documentation version for the current supported VPET GO release.
- Simplify documentation blocks so they contain current content directly.
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

## Functional Requirements

### Current Device Version

The deployment must define:

```text
VPETGO_CURRENT_DEVICE_VERSION
```

The localized docs route must read the variable on the server, trim surrounding whitespace, and reject a missing or empty value with an explicit configuration error. There must be no hardcoded fallback.

The route must pass the validated value to `DocsPage` as `currentDeviceVersion`. `DocsPage` may display it in the documentation heading, but it must not use it to select, filter, order, or resolve content.

### Documentation Content Model

Text blocks must store their current text directly:

```json
{
  "type": "text",
  "content": "Current documentation text."
}
```

All documentation block types must remove the following version-specific fields:

- `vpetVersions`
- `changes`
- version-keyed text values

Image, video, and custom blocks retain their existing current-content fields. Documentation nodes, hierarchy, navigation ids, and locale separation remain unchanged.

### Rendering

The documentation renderer must render every block provided by the active documentation node. It must not compare a block with the current device version or suppress blocks based on version metadata.

Text blocks must render their string content directly. The version resolver and all `currentVersion` properties used only for content resolution must be removed from the documentation component chain.

### Localization

English and Brazilian Portuguese documentation files must use the same simplified schema. Each locale owns its translated current content. No locale may retain version-only fields after migration.

This change does not introduce cross-locale content fallback.

### Historical Content

Old documentation content must not remain in production content files solely for historical access. Repository history is the source for previous documentation states. Future release notes or changelogs must remain separate from the documentation block model.

## Error Handling

- A missing `VPETGO_CURRENT_DEVICE_VERSION` must fail explicitly when rendering the documentation route.
- An empty or whitespace-only value must be handled as missing.
- The application must not silently substitute a source-code version.
- Invalid documentation content must continue to fail through the project's existing type-checking and build validation.

## Migration Scope

The migration includes:

- The documentation block types.
- The shared content resolver.
- The documentation renderer.
- Documentation article component properties.
- The docs page and localized docs route.
- English and Brazilian Portuguese documentation JSON.
- Environment examples and relevant setup documentation.
- Tests that assert the content schema and version configuration behavior.

The migration must remove the superseded version-aware implementation rather than maintain two content schemas.

## BDD

### Scenario: Visitor reads the current documentation

Given the deployment defines `VPETGO_CURRENT_DEVICE_VERSION`
And the localized documentation describes the current supported device release
When the visitor opens the documentation page
Then the page displays the configured device version
And the page renders the current documentation content
And no documentation version selector is shown.

### Scenario: Documentation blocks render without version resolution

Given the active documentation node contains text, image, video, or custom blocks
When the documentation renderer receives those blocks
Then it renders every block directly
And it performs no device-version comparison
And it performs no fallback to content from another version.

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

Given English and Brazilian Portuguese documentation use the current-content schema
When the visitor changes locale
Then the selected locale displays its translation of the current documentation
And both locales identify the same configured device version
And no historical version fallback occurs.

### Scenario: Historical release information is needed

Given maintainers need to communicate changes from a previous release
When they publish historical release information
Then they use a release note or changelog outside the documentation content model
And they do not add version branches to documentation blocks.

## Implementation Checklist

- [ ] Mark ADR 001 as superseded by ADR 002.
- [ ] Add `VPETGO_CURRENT_DEVICE_VERSION` to `.env.example`.
- [ ] Add a server-side reader for `VPETGO_CURRENT_DEVICE_VERSION`.
- [ ] Reject a missing `VPETGO_CURRENT_DEVICE_VERSION`.
- [ ] Reject an empty `VPETGO_CURRENT_DEVICE_VERSION`.
- [ ] Reject a whitespace-only `VPETGO_CURRENT_DEVICE_VERSION`.
- [ ] Pass `currentDeviceVersion` from the localized docs route to `DocsPage`.
- [ ] Remove the hardcoded device version from `DocsPage`.
- [ ] Display `currentDeviceVersion` as documentation metadata.
- [ ] Remove `VersionedText` from documentation types.
- [ ] Remove version-specific shared fields from documentation block types.
- [ ] Change text block content to a direct string.
- [ ] Remove the versioned text resolver.
- [ ] Remove version-based block visibility logic.
- [ ] Remove `currentVersion` from `DocContentRenderer`.
- [ ] Remove `currentVersion` from documentation article components.
- [ ] Render text block strings directly.
- [ ] Migrate English documentation text blocks to direct strings.
- [ ] Migrate Brazilian Portuguese documentation text blocks to direct strings.
- [ ] Remove `vpetVersions` from all documentation content files.
- [ ] Remove `changes` from all documentation content files.
- [ ] Update obsolete ADR 001 references in project specifications.
- [ ] Add a test for configured device version presentation.
- [ ] Add a test for missing device version configuration.
- [ ] Add a test for empty device version configuration.
- [ ] Add a test proving blocks render without version filtering.
- [ ] Add a test proving documentation content has no version-specific fields.
- [ ] Run the test suite.
- [ ] Run the production build.

## Acceptance Criteria

- The public documentation represents only the current supported VPET GO release.
- `VPETGO_CURRENT_DEVICE_VERSION` is the only documentation device-version value.
- The device version is supplied by deployment configuration with no source-code fallback.
- Documentation content contains no historical version branches or fallback metadata.
- Every current documentation block renders without version filtering.
- English and Brazilian Portuguese content conform to the simplified schema.
- No documentation version selector or historical documentation UI exists.
- Tests and the production build pass.
