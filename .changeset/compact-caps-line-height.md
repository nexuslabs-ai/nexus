---
'@nexus_ds/core': minor
---

Map the `label.caps` typography composite to the 12px `line-height-xxs`
primitive, retaining its existing font size, weight, and letter spacing. This
changes the computed line box for every `typography-label-caps` consumer, not
only Badge.
