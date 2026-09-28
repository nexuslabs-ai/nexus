---
'@nexus_ds/core': minor
'@nexus_ds/react': minor
---

Breaking: rename border-active to border-focus, four normal status borders to
`{status}-border`, and border-primary / border-primary-active to primary-border /
primary-border-active, preserving their light/dark values and contrast
relationships. Update runtime variables and consumer utilities together; there
are no old-name aliases.

| Before                  | After                   |
| ----------------------- | ----------------------- |
| `border-active`         | `border-focus`          |
| `border-error`          | `error-border`          |
| `border-information`    | `information-border`    |
| `border-success`        | `success-border`        |
| `border-warning`        | `warning-border`        |
| `border-primary`        | `primary-border`        |
| `border-primary-active` | `primary-border-active` |

The map applies to `--nx-color-*` variables, `--color-*` theme aliases and
utilities (`nx:border-border-error` → `nx:border-error-border`).
`nx:border-color-active` becomes `nx:border-color-focus`; the other
`nx:border-color-*` aliases keep their names.

CSS snapshots advance to version 7 to invalidate obsolete names. State-only
cookies remain version 6 and retain preferences; server-rendered consumers should
pass the cookie-derived snapshot to the bootstrap for the saved first paint.
