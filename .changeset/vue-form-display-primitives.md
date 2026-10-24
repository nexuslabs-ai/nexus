---
'@nxds/vue': minor
---

Add 14 form and display components that match their React counterparts.

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
