---
'@nexus_ds/core': minor
---

Breaking: rename six family-subtle-foreground tokens to family-text,
border-active to border-focus, four normal status borders to status-border, and
border-primary / border-primary-active to primary-border / primary-border-active,
preserving their light/dark values and contrast relationships. Update runtime
variables and consumer utilities together; there are no old-name aliases.
Filled-background foreground roles retain their existing names and values. See
the [migration guide](https://github.com/nexuslabs-ai/nexus/blob/main/docs/migrations/approved-token-names.md)
for the full rename map.

CSS snapshots advance to version 7 to invalidate obsolete names. State-only
cookies remain version 6 and retain preferences; server-rendered consumers should
pass the cookie-derived snapshot to the bootstrap for the saved first paint.
