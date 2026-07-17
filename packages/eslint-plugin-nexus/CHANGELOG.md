# @nexus_ds/eslint-plugin

## 0.2.0

### Minor Changes

- 1d27496: Add design tokens and typography tiers, and recalibrate the `fine` stroke mode.

  **Tokens**
  - New `thin` border-width rung (0.5px hairline; 1px in the `strong` mode), emitted across every stroke mode and as the full `border-thin` / `border-{side}-thin` utility set.
  - New `xxs` (11px) typography size step.
  - New `font-heading` family primitive, defaulting to the same stack as `font-sans` so headings can be branded at runtime without changing the fallback.
  - New `muted-extralight` surface token — a perceptual surface-ladder rung sitting 40% of the way from `background` toward `muted`, derived by the engine across every tone and light/dark mode.

  **Typography composites**
  - Headings now use `font-heading`, `bold`, and tighter tracking; a new `heading-xxsmall` tier is added and `label-caps` moves to the `xxs` size with `wide` tracking.

  **Stroke recalibration**
  - The `fine` stroke mode's `default` is lowered from 1px to 0.5px so its common borders read as hairline.

  **ESLint plugin**
  - `heading-xxsmall` is added to the `nx-class-conventions` live-typography allowlist.

## 0.1.0

### Minor Changes

- c455b16: First public release under the `@nexus_ds` scope. Publishes the framework-agnostic runtime engine (`@nexus_ds/core`: appearance model, runtime theme derivation, OKLCH/APCA utilities) and the lint guardrails (`@nexus_ds/eslint-plugin`) to public npm. Copied component code binds to core's runtime contract, so this begins core's semver-stable surface.
