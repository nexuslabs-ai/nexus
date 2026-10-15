---
'@nexus_ds/core': minor
---

The default appearance changes: `surfaceTone` is now `'zinc'` and `corners`
is now `'subtle'`.

| Field         | Before     | After      |
| ------------- | ---------- | ---------- |
| `surfaceTone` | `'stone'`  | `'zinc'`   |
| `corners`     | `'square'` | `'subtle'` |

To keep the old look, set `surfaceTone: 'stone'` and `corners: 'square'` in your
appearance. Copy the regenerated `nexus.css` and `variables.css` so first paint
matches the new defaults.

`zinc` is retuned to a cool space gray: hue 286, with more chroma in dark mode
and a darker `#09090b` dark page.
