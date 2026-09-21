# Theme inspection

`inspectTheme(input)` is the supported, browser-safe explanation API exported by `@nexus_ds/core`. It executes the same derivation as `deriveTheme(input)`, with a collector local to that call. The returned theme and `themeToCss(result.theme)` preserve ordinary derivation output. Errors propagate with the same type and message; a failed derivation does not return a successful inspection.

```ts
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  inspectTheme,
  themeToCss,
} from '@nexus_ds/core';

const input = createNexusThemeContract({
  ...DEFAULT_NEXUS_APPEARANCE,
  brandColor: '#2863ab',
});
const inspection = inspectTheme(input);
const css = themeToCss(inspection.theme);
const buttonContrast = inspection.diagnostics.find(
  ({ mode, pair }) =>
    mode === 'light' &&
    pair.fg === 'primary-foreground' &&
    pair.bg === 'primary-background'
);
```

For this Blue seed with the default contrast of 50, the light primary background is `oklch(0.4991 0.1301 255.276)`, the final label is white, and the requested UI target is APCA Lc 67.5. Its supporting ramp is generated independently. The authored Blue 600 palette color is a third concept: the preset supplies its original HEX seed, not the converted palette shade.

## Result contract

| Field             | Meaning                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion`   | `1`. Consumers should check this before interpreting an exported inspection.                                                            |
| `input`           | Copy of the supplied derivation seeds, contrast values and optional tone. Display preference and preset identity are not engine inputs. |
| `normalizedInput` | The effective tone (default `neutral`) and contrast (finite values clamped to 0–100, otherwise 50). Seed strings are unchanged.         |
| `theme`           | Complete light and dark semantic CSS custom-property maps.                                                                              |
| `trace`           | Ordered evidence from the actual derivation, plus explicitly identified authored palette provenance.                                    |
| `diagnostics`     | Additional measurements of every final APCA pair in both modes. These are computed after derivation, outside `trace`.                   |

This API accepts `ThemeDerivationInput`, not an arbitrary appearance object. Use the existing appearance sanitization and `createNexusThemeContract` adapter where appropriate. The engine does not validate a light background seed that its white-plane branch does not read. The raw input copy can retain nonfinite numbers from JavaScript callers; JSON exporters should encode those explicitly instead of relying on JSON's conversion to `null`. Ordinary accepted appearance contracts use finite numbers.

Neither derivation nor inspection touches the DOM, storage, cookies, or global appearance. The result owns its event array, input copies and theme maps. Authored palette provenance and its nested coordinates are frozen shared data. There is no globally active collector, timestamp, or random event identifier. Cache warming does not change the trace.

## Reading events

Every event has a zero-based `sequence`, `mode`, `stage`, and an optional semantic CSS custom-property `token`. Events can be narrowed using `kind`:

| Kind          | Payload                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `decision`    | `operation` and scalar/array `values`: branch, candidate, iteration bounds, constraints, result, or a source reference.              |
| `gamut`       | The actual unrounded OKLCH `input` and `output` at a P3 or sRGB clamp.                                                               |
| `conversion`  | Input CSS, floating-point RGB channels, quantized sRGB integers, alpha handling, optional backdrop and resulting composite integers. |
| `measurement` | Actual foreground/background values, luminances and absolute APCA Lc; target/pass where evaluated against a target.                  |
| `palette`     | Frozen authored conversion provenance, explicitly marked `origin: 'authored-palette-provenance'`.                                    |
| `assignment`  | A semantic value assigned at a stage, with its source. Final assignments use stage `output`.                                         |

`decision.values` depends on the operation; consumers should narrow `kind` and inspect the documented operation before reading fields. Trace positions are execution order, not permanent IDs. A token may have multiple assignments because later constraints can change it. Use `theme` or the final `output` assignments for displayed final values.

The solver keeps its short-circuit checks. `foreground-candidate`, `surface-spacing-check`, `family-shade-across-candidate`, and `focus-candidate` record `evaluated` and `unevaluated` counts. Only the first `evaluated` constraints were measured in their recorded constraint order. An absent branch or remaining candidate is not an executed failure. Do not turn skipped constraints into measured results or reconstruct intermediate attempts from the final theme.

`foreground-endpoint` precedes endpoint-floor checks. `reachable-target` distinguishes the requested target from the measured endpoint maximum and the effective capped target. `foreground-unreachable` is recorded internally before the existing error is thrown; errors do not expose partial public inspection results.

## Calculation boundaries

- Authored palette provenance uses the existing canonical conversion: original HEX, hue/common lightness grid, optional P3 cusp chroma at 95%, target, P3-clamped coordinates and formatted CSS. It is lazily cached when inspected. This is reference provenance, not a claim that a cached palette lookup reran a theme search. The ordinary path does not allocate this metadata.
- Custom brand ramps run through the existing seed algorithm. `brand-ramp-shade` records all eleven shade values, fixed-grid lightness, hue, cusp, seed-chroma cap and achromatic handling.
- Solid primary fills follow seed lightness and their own legibility/state rules. A ramp reference emitted during initial family construction can subsequently be overwritten by the solid-fill path.
- Emitted colors use P3 clamps and the engine's existing formatting. Runtime APCA measurements convert the actual CSS strings to sRGB, quantize channels, and then compute luminance. `policy: 'opaque'` drops alpha, matching `apcaLc`; `policy: 'composite'` blends alpha over the actual recorded backdrop when needed. For hexadecimal alpha, source bytes are already quantized. Family fill searches use the existing numeric endpoint luminances 0 and 1 directly; measurements retain those exact values.
- Authored palette audits use unrounded coordinates before sRGB conversion. That audit path is distinct from runtime measurements of emitted strings.
- Final diagnostics include the full pair/backdrop identity, base tier floor, requested target (including chart offsets), measured Lc, booleans for each threshold, and their own ordered conversion/measurement `evidence`. Evidence sequence numbers restart for each diagnostic. A missed requested target can coexist with a satisfied mandatory floor; the derivation trace explains endpoint capping. APCA evidence is not a complete accessibility certification.

## Engine coverage and verification

| Chapter / behavior                     | Evidence                                                                                                                                                                                                       | Tests                                                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inputs/defaults and per-mode contrast  | `normalize-input`, `contrast-profile`                                                                                                                                                                          | Inspection defaults, normalization, ignored light seed, existing error parity                                                                     |
| Authored palettes and Warning → Orange | `palette`, `status-palette`, `ramp-reference`                                                                                                                                                                  | Immutable provenance, unchanged status when brand changes, existing authored conversion and theme fixtures                                        |
| Supporting ramp / solid-fill split     | `brand-ramp-shade`, `primary-fill-lightness`, `primary-endpoint-brand`                                                                                                                                         | Eleven shades, achromatic seed, light cap and all three dark branches                                                                             |
| Fill legibility and interaction states | `primary-legibility-candidate`, `primary-hover-target`, `primary-active-target`, `primary-state-target`, `primary-state-candidate`, `primary-state-base-fallback`                                              | Endpoint mappings, navy adjustment and shared-label fallback                                                                                      |
| Surfaces                               | `surface-anchor`, `surface-candidate`, `surface-constraint`, `surface-spacing-check`, `surface-spacing-bisection`, `surface-spacing-result`                                                                    | White plane, dark clamp, narrowed helper ladder; current normalized profiles need not visit the bisection branch                                  |
| Text                                   | `text-chroma-cap`, `quiet-text-candidate`, `quiet-text-seed`, `quiet-text-endpoint-fallback`                                                                                                                   | Tone matrix, fixed white text reference, pathological foreground fallback                                                                         |
| Status and secondary semantics         | `family-shade-candidate`, `family-shade-across-candidate`, `family-endpoint-fallback`, assignments and references                                                                                              | Authored mapping, Error's shared backgrounds, existing family tests                                                                               |
| Charts                                 | Palette events attached to each chart token, `foreground-constraint`                                                                                                                                           | Actual mode references and per-series 4.5-Lc offsets                                                                                              |
| Alpha and focus                        | Alpha assignments, `focus-candidate`, `focus-endpoint-fallback`, conversion/measurement events                                                                                                                 | Quantized popover composition; existing focus, alpha and backdrop regression tests                                                                |
| Final constraints                      | `family-fill-target`, `family-fill-preserved`, `family-fill-bisection`, `foreground-endpoint`, `reachable-target`, `foreground-bisection`, `foreground-candidate`, `foreground-preserved`, `foreground-result` | Ordered APCA call parity, exact short-circuit counts, preserved seeds, capped targets, failure parity                                             |
| Output                                 | `output` assignments, complete `theme`, diagnostics                                                                                                                                                            | Registry equality, complete theme/CSS parity for all nine presets × five tones × three contrast combinations, custom/endpoints/gamut/alpha inputs |

The tests wrap the third-party APCA function while executing its real implementation: ordinary derivation's complete measurement sequence must equal the executed trace, and inspection may add only the separately listed diagnostic measurements. This prevents a second solver replay from passing output-only parity tests.

Use `deriveTheme` for ordinary rendering. Inspection deliberately retains many events and performs final diagnostics; request it for learning/debugging workflows. Optional chaining gates event objects, contexts and metadata on the production path. Package audits verify the ESM/CJS API and typed consumers; the existing contrast gate and golden fixtures remain unchanged.
