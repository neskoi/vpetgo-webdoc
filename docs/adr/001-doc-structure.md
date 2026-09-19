# ADR 001: Modular Versioned Documentation Structure

## Status

Superseded by [ADR 002: Single Current Device Documentation](./002-single-current-device-documentation.md)

## Context

VPET GO documentation must describe game systems that can change between releases, such as care rules, evolution paths, items, battles, screens, and balance values.

Duplicating full pages for every version would make the documentation hard to maintain. Most releases are expected to change only part of a topic, while the rest should continue to use the previous content.

The documentation also needs localization. Locale content must stay easy to translate and review without mixing multiple languages in the same content object.

## Decision

Use modular documentation blocks with version deltas and progressive fallback.

Each documentation topic is represented by a `DocBlock`. A block declares the versions where it exists and stores only the content or media that changed for a specific version. When a selected version does not define its own value, the application resolves the nearest previous version value, then falls back to `default`.

Locale files must be separate. Each locale owns its own translated blocks while preserving stable block ids and version keys.

Suggested structure:

```text
content/
  docs/
    en/
      blocks.json
    pt-BR/
      blocks.json
```

## Core Model

```ts
type Section =
  | "CORE_MECHANICS"
  | "FEEDING"
  | "EVOLUTION"
  | "MINIGAMES"
  | "CLEANING_HEALTH"
  | "UI_INTERFACE"
  | "HARDWARE_CONTROLS";

type MediaType = "image" | "gif" | "webp" | "svg_sprite";

interface MediaItem {
  type: MediaType;
  url: string;
  alt: string;
  caption?: string;
  badge?: string;
}

interface VersionedText {
  default: string;
  [version: string]: string;
}

interface VersionedMedia {
  default?: MediaItem;
  [version: string]: MediaItem | undefined;
}

interface DocBlock {
  id: string;
  section: Section;
  title: string;
  vpetVersions: string[];
  content: VersionedText;
  media?: VersionedMedia;
  changes?: Record<string, string>;
}
```

Each locale file should contain the same block ids when the same topic exists in that locale. Translated text lives inside that locale file only.

Example:

```json
[
  {
    "id": "feeding-system",
    "section": "FEEDING",
    "title": "Feeding",
    "vpetVersions": ["1.0", "1.1", "1.2"],
    "content": {
      "default": "Feeding restores one hunger point.",
      "1.1": "Feeding restores one hunger point and grants one happiness point."
    },
    "changes": {
      "1.1": "Added happiness gain when feeding."
    }
  }
]
```

## Resolution Rules

When rendering a block for `currentVersion`:

1. Use the exact value for `currentVersion` when it exists.
2. Otherwise, search previous versions in order and use the closest defined value.
3. Otherwise, use `default`.

This applies independently to text and media.

The UI may use `changes[currentVersion]` and first appearance in `vpetVersions` to show status indicators such as new, modified, or inherited. These indicators are optional for the initial implementation and can be added when real multi-version content exists.

## Localization Rules

- Locale files are distinct, for example `content/docs/en/blocks.json` and `content/docs/pt-BR/blocks.json`.
- Each locale file contains translated user-facing text for that locale.
- Stable fields such as `id`, `section`, version keys, and asset references should stay aligned across locales when they describe the same documentation topic.
- Fallback between versions happens inside the selected locale file.
- The system should not fall back from one locale to another for block text unless a future ADR explicitly defines that behavior.

## Consequences

Benefits:

- Reduces repeated documentation across versions.
- Keeps version changes explicit and reviewable.
- Keeps translations easier to manage because locales are isolated.
- Supports future UI features such as version selectors, diff badges, inherited media labels, and before/after comparisons.

Trade-offs:

- Rendering requires a resolver instead of reading a single static string.
- Editors must understand that missing version keys mean inheritance, not missing content.
- Locale files must keep block ids and version keys aligned to avoid inconsistent navigation.

## Implementation Notes

- Keep the first implementation compatible with this model, but do not build every advanced UI feature immediately.
- Start with simple block loading and fallback resolution.
- Add visual diff and media comparison features only when real multi-version content exists.
- Pixel-art media should render with crisp image rules such as `image-rendering: pixelated`.
