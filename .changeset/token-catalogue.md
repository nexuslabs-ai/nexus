---
'@nexus_ds/core': minor
---

Add the browser-safe `@nexus_ds/core/catalogue` entry. `createTokenCatalogue()` describes every token family (colour, typography, spacing, radius, border width, shadow, motion, z-index, and breakpoints): each has its `--nx-*` name, aliases, values per theme mode and preset as the generated CSS declares them, and the authored source leaf. Runtime colours are derived from `DEFAULT_NEXUS_APPEARANCE` in explicit light and dark modes. `SemanticTokenMeta` no longer has a `description` field; those descriptions are now part of the catalogue.
