# Initial Structure Specification

## Context

VPET GO needs a Next.js documentation website for a fan-made V-Pet/Tamagotchi-inspired project. The site must introduce the project, document its systems, and be ready to grow into the modular, version-aware documentation model described in [ADR 001 - Doc Structure](../adr/001-doc-structure.md).

The first release should focus on the public documentation shell, the design system foundation, internationalization, and the initial navigation surface. It does not need to include the full documentation dataset yet.

## Goals

- Create a Next.js application for the VPET GO documentation website.
- Support multiple languages from the beginning through an i18n-ready routing and content structure.
- Implement the initial public navigation with only the `Docs` and `About` tabs.
- Follow the modular documentation structure defined by ADR 001, so future doc blocks can support version-specific content, inherited content, media, and change metadata.
- Establish a design system with theme support.
- Create a default theme inspired by the reference images in `local-docs`.
- Provide a reusable `ImagePlaceholder` component for areas where decorative or gameplay images will be supplied later.
- Detect the visitor locale from browser preferences and fall back to `pt-BR` when no supported locale can be resolved.

## Non-Goals

- Do not implement the complete VPET GO documentation content in this slice.
- Do not implement the full version selector, diff badges, or before/after media comparison from ADR 001 unless needed as a lightweight placeholder.
- Do not require final decorative assets; placeholders are acceptable for this initial slice.
- Do not add private/authenticated areas.
- Do not expose theme switching to users in this slice.
- Do not use the reference images from `local-docs` as production assets; they are visual inspiration only.

## Product Scope

### Docs Tab

The `Docs` tab is the main documentation entry point. For the initial slice, it should show a structured documentation layout that can later be populated with ADR 001 doc blocks.

It should include:

- A page title and short introduction for VPET GO documentation.
- A sidebar for navigating documentation sections.
- Placeholder documentation sections using temporary content until real documentation is available.
- A content structure that can evolve into modular documentation blocks without redesigning the page.

The ADR defines the documentation structure, but this first slice does not need real VPET GO documentation content. Temporary sample content or lorem ipsum is acceptable as long as the layout and navigation behavior are clear. The UI does not need to explicitly label this content as placeholder content.

### About Tab

The `About` tab explains what VPET GO is and sets the tone for the project.

It should include:

- A concise description of VPET GO as a fan-made V-Pet/Tamagotchi-inspired experience.
- A note that the project is inspired by classic virtual pet devices while being its own fan-made work.
- A visible fan-made/non-affiliation disclaimer.
- A visual area using the generic image placeholder until final assets are available.

The initial disclaimer text can be simple and must be localized through the same content system as the rest of the UI:

- English: `Non-profit fan project.`
- Portuguese: `Projeto de fÃ£ sem fins lucrativos.`

## Information Architecture

The first navigation level must expose only:

- `Docs`
- `About`

Suggested routes:

- `/[locale]/docs`
- `/[locale]/about`

When a visitor opens `/`, the application must try to resolve the preferred locale from the browser configuration. If no supported locale is found, it must use `pt-BR`.

## Internationalization

The application must be i18n-ready from the first implementation.

Requirements:

- All user-facing strings must come from translation files or an equivalent localized content layer.
- Routes must support locale prefixes.
- The first supported locales are `en` and `pt-BR`.
- The default fallback locale is `pt-BR`.
- Browser locale detection should prefer the closest supported locale.
- Documentation block content must be stored in separate locale files, aligned with ADR 001.
- The content structure must allow future documentation blocks to be localized independently from layout components.

Suggested future documentation content structure:

```text
content/
  docs/
    en/
      blocks.json
    pt-BR/
      blocks.json
```

Examples:

- A browser configured for Brazilian Portuguese should resolve to `pt-BR`.
- A browser configured for English should resolve to `en`.
- A browser configured for an unsupported locale should resolve to `pt-BR`.

## Design System

The application must include a design system foundation with:

- Theme tokens for color, spacing, typography, radius, borders, shadows, and focus states.
- Internal support for multiple themes, even if only the default theme is implemented initially.
- Shared UI components for layout, navigation, buttons/links, headings, content panels, badges, and image placeholders.
- Accessible contrast, keyboard navigation, and visible focus states.

Theme switching must not be user-facing in this slice. The implementation should only keep the system ready for future themes.

### Default Theme Direction

The default theme should be inspired by the reference images in `local-docs`. These files must not be used as site assets in this slice.

Visual qualities to capture:

- Bright handbook/manual energy.
- Pixel-art accents and crisp iconography.
- Strong section headers with saturated color bands.
- Playful but readable typography.
- White or light content surfaces with vivid borders and labels.
- Blue sky/adventure feeling, with supporting pink, yellow, green, purple, and cyan accents.
- Compact documentation cards and panels that feel like a game guide rather than a marketing landing page.

The theme should not depend on final decorative images. Until those assets exist, use `ImagePlaceholder` and simple pixel-style decorative treatments.

## Image Placeholder Component

Create a generic `ImagePlaceholder` component for temporary visual slots.

Requirements:

- Accept an accessible label or `alt` text.
- Support optional caption text.
- Support predictable aspect ratios.
- Fit inside documentation panels without layout shift.
- Visually match the default theme.
- Make it obvious to maintainers that the placeholder should later be replaced by a real asset, without exposing implementation notes as public-facing instructional text.

## Architecture Requirements

- Use vertical slice architecture for new application features.
- Keep documentation pages, localized content, and components organized so each feature can evolve independently.
- Align future documentation data with the modular doc block model in ADR 001.
- Keep all code, identifiers, comments, and new documentation in English.

## Browser and Device Support

The initial slice must be verified in Chrome on desktop and smartphone-sized viewports. Responsive behavior is mandatory.

## BDD

### Scenario: Visitor opens the documentation site

Given a visitor opens the default site URL  
When the application resolves the visitor locale from browser preferences or falls back to `pt-BR`  
Then the visitor can access the `Docs` and `About` tabs  
And no other top-level tabs are shown in the initial release.

### Scenario: Visitor reads the Docs page

Given a visitor is on the `Docs` tab  
When the page loads  
Then the visitor sees a localized introduction to the VPET GO documentation  
And the page presents a sidebar for navigating documentation sections  
And temporary sample content is represented by polished placeholder states.

### Scenario: Visitor reads the About page

Given a visitor is on the `About` tab  
When the page loads  
Then the visitor sees a localized explanation of VPET GO  
And the page communicates that VPET GO is fan-made and inspired by classic V-Pet/Tamagotchi devices  
And the page includes a localized visible fan-made/non-affiliation disclaimer  
And temporary image areas use the shared `ImagePlaceholder` component.

### Scenario: User switches locale

Given the application supports more than one locale  
When a visitor changes the locale  
Then navigation labels and page content are displayed in the selected language  
And the current section remains equivalent whenever possible.

### Scenario: Browser locale falls back safely

Given a visitor has an unsupported browser locale  
When the visitor opens the default site URL  
Then the application resolves the experience to `pt-BR`.

### Scenario: Temporary docs content is allowed

Given real VPET GO documentation content is not available yet  
When the visitor opens the `Docs` tab  
Then the page may show temporary sample content  
And the UI does not need to mark that content as placeholder content.

### Scenario: Theme foundation is available

Given the default VPET GO theme is active  
When a page renders shared UI components  
Then the components use design tokens instead of one-off styling  
And the visual style follows the reference guide images  
And no user-facing theme switcher is shown.

### Scenario: Footer communicates project status

Given a visitor is on any public page  
When the footer is visible  
Then it includes the localized fan-made/non-affiliation disclaimer.

## Implementation Checklist

- [ ] Create the Next.js application foundation.
- [ ] Configure i18n routing and localized content loading.
- [ ] Configure `en` and `pt-BR` as the initial supported locales.
- [ ] Implement browser locale detection with `pt-BR` fallback.
- [ ] Create the shared application layout.
- [ ] Implement top-level navigation with only `Docs` and `About`.
- [ ] Implement the public footer with the fan-made/non-affiliation disclaimer.
- [ ] Create the design token structure for the design system.
- [ ] Implement the default VPET GO theme.
- [ ] Keep theme switching internal and hidden from users.
- [ ] Create shared UI primitives needed by this slice.
- [ ] Create the `ImagePlaceholder` component.
- [ ] Implement the localized `Docs` page with sidebar navigation.
- [ ] Add temporary sample documentation content for the initial Docs layout without requiring a visible placeholder label.
- [ ] Implement the localized `About` page with the fan-made/non-affiliation disclaimer.
- [ ] Prepare documentation content organization to align with ADR 001, using separate locale files for documentation blocks.
- [ ] Ensure reference images are used only as visual inspiration.
- [ ] Add tests or specs that verify routing, navigation visibility, localization, and placeholder rendering.
- [ ] Verify responsive behavior in Chrome on desktop and smartphone-sized viewports.
- [ ] Verify accessibility basics: semantic landmarks, keyboard navigation, focus states, and image alt text.

## Acceptance Criteria

- The app runs as a Next.js documentation website.
- The initial navigation shows only `Docs` and `About`.
- `/` resolves to a supported locale using browser preferences, with `pt-BR` as fallback.
- All visible strings in the initial pages are localized.
- The first supported locales are `en` and `pt-BR`.
- The `Docs` page includes sidebar navigation and temporary sample content.
- The `About` page and footer include the localized fan-made/non-affiliation disclaimer.
- The selected architecture can later support ADR 001 modular documentation blocks.
- Future documentation blocks can be stored in separate locale files while preserving stable block ids.
- The default theme visibly reflects the provided VPET GO guide references.
- Temporary visual areas use a reusable image placeholder component.
- Reference images are not used as production site assets.
- Theme switching is not visible to users, but the design system remains theme-ready.
- The site behaves responsively in Chrome on desktop and smartphone-sized viewports.
- The implementation follows vertical slice architecture.
- New specs and implementation notes are written in English.


