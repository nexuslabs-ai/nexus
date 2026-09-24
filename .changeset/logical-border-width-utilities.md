---
'@nexus_ds/core': minor
---

Border widths now come from Tailwind's own `--border-width-*` theme namespace,
emitted inline next to `--outline-width-*`. Every Tailwind border side —
including the logical `border-{s,e,bs,be}-{thin,default,thick}` and
`divide-{x,y}-*` — reads the borderwidth tokens, so the generated
`border-{side}-*` utilities are gone. The `border-width-*` aliases gain the
`s`, `e`, `bs`, and `be` sides.
