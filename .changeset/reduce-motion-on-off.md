---
'@nexus_ds/core': minor
---

Narrow `NexusAppearancePrefs.reduceMotion` to `'on' | 'off'` and default it to
`'off'`. The removed `'system'` value followed the OS `prefers-reduced-motion`
setting, which Nexus no longer reads; a stored `'system'` value now sanitizes
to `'off'`.
