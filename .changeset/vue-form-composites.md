---
'@nxds/vue': minor
---

Add form composites that match their React counterparts.

| Component   | Parts                                                                                                                                                                      | Notes                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| ButtonGroup | `ButtonGroup`, `ButtonGroupText`, `ButtonGroupSeparator`                                                                                                                   | `size` reaches every Button and ButtonGroupText in the group        |
| Field       | `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldSeparator`, `FieldError`, `FieldRequiredIndicator` | Pass `errors` to FieldError, or put the message in its slot         |
| ChoiceRow   | `ChoiceRow`, `ChoiceRowContent`, `ChoiceRowTitle`, `ChoiceRowDescription`                                                                                                  | Set `for` to the nested control's `id`                              |
| ChoiceCard  | `ChoiceCard`, `ChoiceCardContent`, `ChoiceCardTitle`, `ChoiceCardDescription`                                                                                              | Set `for` to the nested control's `id`                              |
| InputGroup  | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`                                                             | InputGroupInput and InputGroupTextarea bind with `v-model`          |
| ToggleGroup | `ToggleGroup`, `ToggleGroupItem`                                                                                                                                           | Binds with `v-model`; a `type="single"` group's items are radios    |
| Slider      | `Slider`                                                                                                                                                                   | Binds the values with `v-model`; one thumb per value                |
| InputOTP    | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`                                                                                                           | Built on Reka PinInput; binds one character per slot with `v-model` |

A `Button` without its own `size` now takes the size of the `ButtonGroup` around it, even when another element wraps it.
