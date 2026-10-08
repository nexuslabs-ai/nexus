---
'@nexus_ds/react': minor
'@nexus_ds/core': minor
---

Alert gains a `fill` axis and a `textTone` prop, and its close control moves out of the action area.

- `fill="light"` (default) tints the surface with the status colour, `fill="none"` keeps the neutral container surface with a status border and text, and `fill="solid"` uses the status background with its paired foreground.
- `textTone="neutral"` keeps title and description in the normal foreground on light and none fills. Solid alerts take no `textTone`.
- `AlertActions` gives the Buttons inside it size `sm` and, on solid alerts, the `outline` variant. An explicit `size` or `variant` on a Button wins.
- Breaking: render `AlertClose` as a direct child of `Alert`, after `AlertActions`, not inside `AlertActions`. It sits at the top end in both the stack and inline layouts.
- An inline Alert reflows by its own width, so give it a definite width inside a shrink-to-fit parent.

Core: `APCA_PAIRS` now checks `foreground` on each status subtle surface and each status subtle foreground on `container`, so the contrast solver and `measureThemeContrast` cover these Alert pairings.
