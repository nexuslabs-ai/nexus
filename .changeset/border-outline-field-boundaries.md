---
'@nexus_ds/core': minor
---

Paint field boundaries and focus rings with real `border` and `outline` instead
of generated `box-shadow`.

- Removed `tokens/semantic/focus.json` and the `--focus-offset` root dimension
  it emitted. `outline-offset`'s initial value is already `0`, so the token was
  a no-op everywhere except `Button`, which now writes the `2px` literal.
- Added `--outline-width-{thin,default,thick}` to the `@theme` block, mirroring
  the existing `--border-*` keys off the same borderwidth primitives. A field's
  focus ring is a `border-default` inner edge plus an `outline-default` outer
  edge, so both halves follow a `[data-borderwidth]` mode swap together.
- `generateFocusRingCSS` is now `generateInputOtpSlotCSS`: the only generated
  rules left are the InputOTP slot's shared-hairline shadows, which a real
  border cannot express (#727).
