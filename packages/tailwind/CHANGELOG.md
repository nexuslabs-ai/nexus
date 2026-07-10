# @nexus_ds/tailwind

## 0.1.0

### Minor Changes

- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 410076a: Bake the token engine floor into generated Tailwind CSS semantic color fallbacks. Runtime `--nx-color-*` overrides still win, while the committed fallback literals now come from the reviewed engine matrix instead of semantic color JSON.
- 748e08c: Adjudicate semantic color token values for the token engine by aligning runtime producers with the reviewed semantic JSON values for chart series 2, warning fills, default focus, black-brand primary states, and foreground ink tiers. Set the default dark structural contrast to `0` and refresh the reviewed engine snapshot matrix.
