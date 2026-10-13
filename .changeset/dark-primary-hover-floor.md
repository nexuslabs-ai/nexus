---
'@nexus_ds/core': minor
---

Derived primary hover is now visibly lighter for dark brand colours. A primary fill darker than mid-grey steps up on hover and never lands below neutral-800 lightness, so near-black brands no longer get a hover that is almost identical to the base fill. The default light theme's `primary-background-hover` moves from `oklch(0.207 0 0)` to `oklch(0.297 0 0)`. Checkbox, Switch and every other primary fill pick up the new hover; their labels still clear the APCA contrast gate.
