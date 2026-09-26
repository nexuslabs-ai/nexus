---
'@nexus_ds/core': minor
'@nexus_ds/eslint-plugin': minor
'@nexus_ds/react': patch
---

Add the `shadow-md` tier to the emitted Tailwind theme; its primitives already
existed in every shadow mode, so `nx:shadow-md` now renders instead of emitting
nothing. Emit `--default-transition-duration` and
`--default-transition-timing-function` from `--nx-motion-duration-default` and
`--nx-motion-ease-enter`, and point `transition-control` / `transition-field` at
them: every `nx:transition-*` utility now shares one default (200ms, enter
easing) instead of Tailwind's 150ms, and the two ring-safe transitions are no
longer instant without an explicit `duration-*` class.

`@nexus_ds/eslint-plugin`: `nx-class-conventions` drops its `deadTypography`
check. Its replacement is the new `nexusTailwindClassesConfig({ files,
entryPoint })` helper in the new `@nexus_ds/eslint-plugin/tailwind` subpath, which wires
`eslint-plugin-better-tailwindcss`'s `no-unknown-classes` (an optional peer
dependency, needed only for that subpath) against your stylesheet: it reports any class that emits no CSS,
including a missing `nx:` prefix.

`@nexus_ds/react`: NavigationMenu content now slides 1.5rem on enter and exit;
it previously computed its offset from an undefined `--spacing` and did not
slide. Its transform origin is now `top` (was the invalid `top-center`).
