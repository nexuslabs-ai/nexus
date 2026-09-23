---
'@nexus_ds/core': minor
---

Add the browser-safe `@nexus_ds/core/catalogue` entry. `createTokenCatalogue()` describes the colour and typography tokens: each has its `--nx-*` name, aliases, per-mode values as the generated CSS declares them, and the authored source leaf. Runtime colours are derived from `DEFAULT_NEXUS_APPEARANCE` in explicit light and dark modes. `SemanticTokenMeta` no longer has a `description` field; those descriptions are now part of the catalogue.
