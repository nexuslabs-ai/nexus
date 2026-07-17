# @nexus_ds/react

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
