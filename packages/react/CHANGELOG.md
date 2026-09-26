# @nexus_ds/react

## 0.2.0

### Minor Changes

- e54ef4b: Add `BRAND_COLOR_PRESETS` and `findBrandColorPreset` to `@nexus_ds/core`, seeded from the authored palettes, and a reusable preset/custom color field in Appearance settings. Preserve saved brand colors and the existing theme derivation. Keep controls usable in narrow layouts and make native color-picker keyboard focus visible.
- ea9a2e5: Add the `Marker` primitive for inline annotations and labelled dividers.

  `Marker` renders a low-emphasis annotation row — an optional `MarkerIcon` plus
  `MarkerContent` — for lists, feeds, and message streams. `variant="separator"`
  centres the label between two rules; `variant="border"` rests the row above a
  bottom rule. The label stays real text in reading order, so it is announced
  where it appears; use `Separator` for a purely decorative rule with no label.

  `asChild` composes the row onto different semantics — a heading for a labelled
  section, or a link / button for an actionable row.

### Patch Changes

- 3ed37ed: Add the `shadow-md` tier to the emitted Tailwind theme; its primitives already
  existed in every shadow mode, so `nx:shadow-md` now renders instead of emitting
  nothing. Emit `--default-transition-duration` and
  `--default-transition-timing-function` from `--nx-motion-duration-default` and
  `--nx-motion-ease-enter`, and point `transition-control` / `transition-field` at
  them: every `nx:transition-*` utility now shares one default (200ms, enter
  easing) instead of Tailwind's 150ms, and the two ring-safe transitions are no
  longer instant without an explicit `duration-*` class.

  `@nexus_ds/eslint-plugin`: `nx-class-conventions` drops its `deadTypography`
  check. Its replacement is the new `nexusTailwindClassesConfig({ files,
entryPoint })` helper in the new `@nexus_ds/eslint-plugin/tailwind` subpath, which wires
  `eslint-plugin-better-tailwindcss`'s `no-unknown-classes` (an optional peer
  dependency, needed only for that subpath) against your stylesheet: it reports any class that emits no CSS,
  including a missing `nx:` prefix.

  `@nexus_ds/react`: NavigationMenu content now slides 1.5rem on enter and exit;
  it previously computed its offset from an undefined `--spacing` and did not
  slide. Its transform origin is now `top` (was the invalid `top-center`).

- Updated dependencies [7aa577c]
- Updated dependencies [15c901b]
- Updated dependencies [e54ef4b]
- Updated dependencies [416a7a0]
- Updated dependencies [5a3ea89]
- Updated dependencies [716c029]
- Updated dependencies [3ed37ed]
- Updated dependencies [48f0bc6]
- Updated dependencies [a4fde03]
- Updated dependencies [8f9cbfa]
- Updated dependencies [2b3f20c]
- Updated dependencies [48cec83]
  - @nexus_ds/core@0.5.0

## 0.1.1

### Patch Changes

- Updated dependencies [1d27496]
  - @nexus_ds/core@0.4.0

## 0.1.0

### Minor Changes

- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 958c764: Split the appearance `contrast` control into independent `lightContrast` and `darkContrast` scalars. Theme derivation applies each mode's contrast to that mode's tokens only, so the dark theme can be tuned without moving the light theme. Snapshot version bumped to 4; stale snapshots reset to `60/60` defaults (pre-production, no migration).

### Patch Changes

- Updated dependencies [249ef8e]
- Updated dependencies [a4d4a57]
- Updated dependencies [958c764]
- Updated dependencies [410076a]
- Updated dependencies [1d55de3]
- Updated dependencies [748e08c]
  - @nexus_ds/core@0.3.0
  - @nexus_ds/tailwind@0.1.0

## 0.0.3

### Patch Changes

- Updated dependencies [58c79bc]
  - @nexus_ds/core@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies [c455b16]
  - @nexus_ds/core@0.1.0
