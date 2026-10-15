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
appearance. Copy the regenerated `nexus.css`, `variables.css` and
`border-color-aliases.css` so first paint matches the new defaults.

`zinc` is retuned to a cool, slightly violet gray at hue 286:

- Light-mode text darkens from `#18181b` to `#09090b`.
- Light-mode chroma doubles, from `0.001` to `0.002`.
- Dark-mode chroma triples, from `0.002` to `0.006`.
- The dark page darkens to `#09090b`.
