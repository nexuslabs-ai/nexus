---
'@nexus_ds/react': minor
---

Add `EventCalendar` — month, week, day, N-day, agenda and resource views with pointer drag/resize, recurrence expansion, timezone-aware layout, and i18n. Adapted from the ReUI event-calendar (`radix-nova` style) onto Nexus components and semantic tokens.

`date-fns` and `@date-fns/tz` are promoted to direct dependencies of `@nexus_ds/react`; both were already resolved transitively through `react-day-picker`, so the installed dependency tree is unchanged.

The component's optional render-prop surface (18 `render*` props, the `components` view override, and `dayClassName`) is intentionally not part of the Nexus API — styling is via `className`, the `classNames` slot map, and the 50 `data-slot` hooks.
