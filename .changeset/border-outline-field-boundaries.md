---
'@nexus_ds/core': minor
'@nexus_ds/eslint-plugin': minor
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
- Added the `transition-control` / `transition-field` utilities to
  `motion-utilities.css`. Tailwind's `transition-colors` carries
  `outline-color`, so an element painting a real ring would fade it in instead
  of landing it with the keypress; these name the properties a surface actually
  wants. The split follows the focus recipe: a control's border is its own
  decoration and may fade, while a field's border is the ring's inner half.
- `@nexus_ds/nx-class-conventions` gained a `ringFadingTransition` check that
  fails `nx:transition-colors` sharing a class-string scope with a
  `focus-visible:outline-*` class. A `cva([...])` array counts as one scope,
  because a field surface writes its transition and its ring in different
  elements.
