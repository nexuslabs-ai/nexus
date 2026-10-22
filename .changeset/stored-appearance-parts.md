---
'@nxds/core': minor
---

Read the saved appearance in two steps, for a provider that watches the raw
value:

| Export                      | What it does                                                   |
| --------------------------- | -------------------------------------------------------------- |
| `readNxdsAppearanceStorage` | Returns the raw string saved under a storage key, or `null`    |
| `parseStoredNxdsAppearance` | Turns a saved string into an appearance, or returns a fallback |

`readStoredNxdsAppearance` is the two together.
