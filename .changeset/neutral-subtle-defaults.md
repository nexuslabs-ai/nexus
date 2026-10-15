---
'@nexus_ds/core': minor
---

The default appearance changes: `surfaceTone` is now `'neutral'` and `corners`
is now `'subtle'`.

| Field         | Before     | After       |
| ------------- | ---------- | ----------- |
| `surfaceTone` | `'stone'`  | `'neutral'` |
| `corners`     | `'square'` | `'subtle'`  |

To keep the old look, set `surfaceTone: 'stone'` and `corners: 'square'` in your
appearance. Copy the regenerated `nexus.css` and `variables.css` so first paint
matches the new defaults.
