---
'@nexus_ds/core': minor
---

Primary color now derives from the brand seed's own lightness instead of a fixed mid-tone shade, so the primary button _is_ the chosen color (deep navy stays navy; black renders black in light and white in dark). Fill legibility is APCA-guarded and the dark-mode lift is continuous at the honor boundary.

Fixed `pinnedOklch` so a fully-neutral seed (chroma 0) stays neutral instead of taking the fallback hue at full cusp chroma — this was rendering an achromatic (black/grey) brand's disabled, subtle, and border shades as pink.

Removed the static brand menu: the twelve `brands-*.json` token files are consolidated into a single `theme-default-{light,dark}.json` (primary + secondary + border-primary), and the `--brand` build flag / `DEFAULT_CONFIG.brand` are gone. Custom brand colors are now chosen at runtime rather than from a fixed set of pre-built brand stylesheets.
