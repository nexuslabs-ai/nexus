---
'@nexus_ds/core': minor
---

Export the surface ladder from `@nexus_ds/core/catalogue`: `SURFACE_TOKENS`, `LIGHT_SURFACE_LADDER`, `DARK_SURFACE_LADDER`, and the `ShadeAnchor` type. Each ladder maps every opaque surface token to the anchor or raw step the theme engine derives it from. The main entry adds the `SemanticColorName` type, the literal union of every `SEMANTIC_TOKEN_REGISTRY` name, which now types `SemanticTokenMeta.name`.
