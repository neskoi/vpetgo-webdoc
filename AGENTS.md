# Project Agent Instructions

## Language

- Write all code, identifiers, comments, and project documentation in English.

## Specifications

- Every new specification must include a BDD section that describes the expected behavior.
- Every new specification must include an implementation checklist.
- Checklist items must be atomic enough to track progress clearly during implementation.

## Architecture

- Use vertical slice architecture when developing features in this codebase.
- Keep feature-specific pages, components, data, tests, and supporting code close to the slice they belong to whenever practical.

## Components

- Each component must live in its own folder. Keep the component implementation, styles, tests, and local support files inside that folder whenever practical.
- Prefer an `index.ts` file per component folder for exports, so imports target the component folder instead of a specific implementation file.

## Tooling

- Follow the shared RTK command instructions from `C:\Users\Koi\.codex\RTK.md`.
