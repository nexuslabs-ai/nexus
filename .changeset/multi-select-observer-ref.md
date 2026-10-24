---
'@nxds/react': patch
---

Fix `MultiSelectValue` overflow when you pass a `ref`. Your `ref` replaced the one that watches chip overflow, so chips stopped collapsing into the `+N` badge. Both refs now attach.
