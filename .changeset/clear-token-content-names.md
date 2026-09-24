---
'@nexus_ds/core': major
---

Rename six family-subtle-foreground tokens to family-text, border-active to
border-focus, and four normal status borders to status-border, preserving their
light/dark values and contrast relationships. Update runtime variables and
consumer utilities together; there are no old-name aliases. Filled-background
foreground roles retain their existing names and values.

CSS snapshots advance to version 7 to invalidate obsolete names. State-only
cookies remain version 6 and retain preferences; server-rendered consumers should
pass the cookie-derived snapshot to the bootstrap for the saved first paint.
