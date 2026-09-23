---
'@nexus_ds/core': minor
---

Change `NexusAppearancePrefs.reduceMotion` from `'system' | 'on' | 'off'` to a
`boolean` that defaults to `false`. The removed `'system'` value followed the OS
`prefers-reduced-motion` setting, which Nexus no longer reads. Any stored string
value now sanitizes to `false`.
