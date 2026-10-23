# @nxds/vue

## 0.1.0

### Minor Changes

- 8c047f2: Vue components now match their React counterparts, and parity tests keep them matched.

  | Component  | Change                                                                                                       |
  | ---------- | ------------------------------------------------------------------------------------------------------------ |
  | Dialog     | Exports `DialogOverlay` and `DialogPortal`. `DialogContent` takes `#title`, `#description` and `#body` slots |
  | Appearance | `createNxdsAppearance` takes `state` and `onStateChange` to control the appearance yourself                  |
  | Button     | `loading` defaults to `false`. With `as-child`, a child that is not one element keeps the native button      |
  | TabsList   | `variant` and `size` list their options, and the vertical layout follows `data-orientation`                  |

## 0.0.1

### Patch Changes

- Updated dependencies [afc7bd7]
  - @nxds/core@0.9.0
