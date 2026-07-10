# @nexus_ds/core

## 0.3.0

### Minor Changes

- 249ef8e: Expose the full shipped density, corner, and elevation modes through the public appearance model unions, option tables, and sanitizers.
- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 958c764: Split the appearance `contrast` control into independent `lightContrast` and `darkContrast` scalars. Theme derivation applies each mode's contrast to that mode's tokens only, so the dark theme can be tuned without moving the light theme. Snapshot version bumped to 4; stale snapshots reset to `60/60` defaults (pre-production, no migration).
- 1d55de3: Add token-engine instrumentation exports for the semantic color cutover: public APCA contrast access, semantic token registry metadata, the public surface-token type, and the frozen engine matrix snapshot fixture.
- 748e08c: Adjudicate semantic color token values for the token engine by aligning runtime producers with the reviewed semantic JSON values for chart series 2, warning fills, default focus, black-brand primary states, and foreground ink tiers. Set the default dark structural contrast to `0` and refresh the reviewed engine snapshot matrix.

## 0.2.0

### Minor Changes

- 58c79bc: Primary color now derives from the brand seed's own lightness instead of a fixed mid-tone shade, so the primary button _is_ the chosen color (deep navy stays navy; black renders black in light and white in dark). Fill legibility is APCA-guarded and the dark-mode lift is continuous at the honor boundary.

  Fixed `pinnedOklch` so a fully-neutral seed (chroma 0) stays neutral instead of taking the fallback hue at full cusp chroma — this was rendering an achromatic (black/grey) brand's disabled, subtle, and border shades as pink.

  Removed the static brand menu: the twelve `brands-*.json` token files are consolidated into a single `theme-default-{light,dark}.json` (primary + secondary + border-primary), and the `--brand` build flag / `DEFAULT_CONFIG.brand` are gone. Custom brand colors are now chosen at runtime rather than from a fixed set of pre-built brand stylesheets.

## 0.1.0

### Minor Changes

- c455b16: First public release under the `@nexus_ds` scope. Publishes the framework-agnostic runtime engine (`@nexus_ds/core`: appearance model, runtime theme derivation, OKLCH/APCA utilities) and the lint guardrails (`@nexus_ds/eslint-plugin`) to public npm. Copied component code binds to core's runtime contract, so this begins core's semver-stable surface.
