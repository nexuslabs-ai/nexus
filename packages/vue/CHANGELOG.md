# @nxds/vue

## 0.2.0

### Minor Changes

- 575bf96: Add 14 form and display components that match their React counterparts.

  | Component    | Parts                                                        | Notes                                                               |
  | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------- |
  | Label        | `Label`                                                      | Set `for` to the control's `id`                                     |
  | Input        | `Input`                                                      | Binds with `v-model`, or starts from `default-value`                |
  | Textarea     | `Textarea`                                                   | Binds with `v-model`, or starts from `default-value`                |
  | NativeSelect | `NativeSelect`, `NativeSelectOption`, `NativeSelectOptGroup` | Binds with `v-model`, or starts from `default-value`                |
  | Checkbox     | `Checkbox`                                                   | Set `model-value="indeterminate"` for a partly selected set         |
  | RadioGroup   | `RadioGroup`, `RadioGroupItem`                               | Binds with `v-model`                                                |
  | Toggle       | `Toggle`                                                     | Binds the pressed state with `v-model`                              |
  | Separator    | `Separator`                                                  | Decorative unless `:decorative="false"`                             |
  | Kbd          | `Kbd`, `KbdGroup`                                            |                                                                     |
  | Skeleton     | `Skeleton`                                                   |                                                                     |
  | Progress     | `Progress`                                                   | Leave out `model-value` for an indeterminate bar                    |
  | AspectRatio  | `AspectRatio`                                                |                                                                     |
  | Show / Hide  | `Show`, `Hide`                                               | Set one of `above`, `below`, `container-above` or `container-below` |

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
