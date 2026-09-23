---
'@nexus_ds/core': minor
---

Add logical border-width utilities: `border-{s,e}-{thin,default,thick}` and
their `border-width-{s,e}-*` aliases, which set `border-inline-start-width` /
`border-inline-end-width` from the borderwidth tokens so RTL-correct components
no longer need an arbitrary width.
