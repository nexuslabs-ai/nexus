---
'@nexus_ds/core': minor
---

Add a `muted-hover` semantic surface token. `muted` previously had no hover step
of its own, so a hoverable `muted` surface had to borrow `container-active` —
which resolves to the same value as `muted` in dark mode, making the hover a
no-op. `muted-hover` sits one rung above `muted` in both regimes (light shade
100, dark step 3.2).
