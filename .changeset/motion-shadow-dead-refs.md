---
'@nexus_ds/core': minor
---

Add the `shadow-md` tier to the emitted Tailwind theme; its primitives already
existed in every shadow mode, so `nx:shadow-md` now renders instead of emitting
nothing. Default `transition-control` and `transition-field` to
`--nx-motion-duration-default` and `--nx-motion-ease-enter`: they previously read
unprefixed `--default-transition-*` variables that never exist under
`prefix(nx)`, so without an explicit `duration-*` class the colour change was
instant.
