# Design Token Rules

## Token Format (W3C DTCG)

All tokens follow the W3C DTCG format: required `$value` + `$type`, optional `$description` and `$extensions`. See [§ Validation](#validation) for the `$type` enumeration and [§ Font Source Extensions](#font-source-extensions) for an `$extensions` example.

## Color Token Pipeline

**On-disk: hex; runtime: OKLCH.** `color.json` stores hex (8-digit for alpha shades, see [§ Alpha Token Scale](#alpha-token-scale)); the build converts to `oklch(...)` at emit time. Hex is the on-disk format because Tokens Studio and Figma Variables hex-normalise on export and cannot round-trip OKLCH — it's the only viable source format for a Figma-driven workflow.

### Routing modes

The converter has two paths, one per shipped function in `perceptual-grid.js`:

**Grid-pinned** (`hexToOklchPinned`) — when the token path has length ≥ 2 and its last segment is a shade key (`50`–`950`). Catches today's `{palette}.{shade}` shape and any future nesting like `chart.series.500`. The hex's lightness is replaced by the value in `perceptual-grid.json`; chroma is preserved (clamped to the Display P3 boundary); hue is preserved. This is what makes every palette's shade-500 land at the same perceived depth. The build warns when P3 clipping drops chroma by more than 20%.

**Mechanical** (`hexToOklchMechanical`) — everything else: `white`, `black`, alpha shades (`a50`–`a950`), and any one-off. Straight hex→OKLCH; alpha preserved from 8-digit hex.

### Alpha Token Scale

The **5 surface palettes** (`slate`, `neutral`, `gray`, `stone`, `zinc`) plus `white`/`black` ship alpha shades `a50`–`a950` alongside their solid scale. Chromatic palettes (`red`, `green`, `blue`, …) **do not** — this mirrors Tier-A practice (Radix, Geist, Stripe Sail, Linear, Atlassian): alpha is for surface chrome (scrims, hovers, frosted panels, translucent borders), not chromatic tints.

Translucent surfaces — popover / command-palette backgrounds, modal scrims, hover rows on tinted lists — reference these surface-palette alphas instead of hand-written `rgba()`, so they blend correctly across every base palette. The `overlay` token follows this rule (`{palette.a700}` light / `{palette.a800}` dark), not a hardcoded `rgba`.

**`.base` convention.** The fully-opaque value of `white`/`black` lives at `.base` (`{white.base}`, `{black.base}`) — _not_ `{white}` or a numbered shade. For the 5 surface palettes the solid value is the numbered shade (`{slate.500}`); alpha shades nest under the solid (`{slate.a200}`, `{white.a900}`).

Each alpha shade is the palette's 950 hex plus an alpha byte — the curve lives in `color.json` (edit it there to retune; the perceptual grid does **not** apply to alpha shades).

**Not APCA-gated.** Alpha tokens blend with their backdrop, so contrast is context-dependent — they're excluded from the `audit:contrast` pairs. `oklchToSrgbInts()` throws on an alpha-bearing color, so any future pair that needs one must pre-blend against its surface first.

### Warning for designers

When you change a hex in Figma for a palette shade, only the **hue and chroma** carry through — the **lightness is overwritten by the grid**. `#ff0000` and `#400000` at the same shade key produce identical lightness. To change a shade's lightness, edit `packages/core/src/lib/perceptual-grid.json`, not the hex.

### DTCG deviation

We keep `$value` as a hex string on disk, not the DTCG-2025.10 structured-object form (`{ "colorSpace": "oklch", "components": [...] }`). Design tools round-trip hex; they don't round-trip the structured form, so it would be lost on the next Figma export. Revisit if a consumer needs spec-compliant import.

### Browser floor

OKLCH requires Chrome 111+, Safari 15.4+, Firefox 113+ (Baseline 2023). No hex fallback is emitted — consumers needing older browsers must pin to the last pre-migration tag.

**Display P3 is automatic.** Emitted `oklch(...)` values carry P3 chroma; browsers gamut-map at render time. No `@media (color-gamut: p3)` query or hex fallback is needed — the CSS is the same everywhere, capable hardware just shows more chroma.

### APCA contrast gate

`yarn workspace @nexus/core audit:contrast` (implemented in `packages/core/scripts/audit-contrast.js`) runs APCA Lc on every base and brand foreground↔background pair, with thresholds chosen per APCA's intended-use tiers:

| Pair                                                                                                                    | Threshold             | Rationale                                                            |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------- |
| `foreground ↔ background`                                                                                               | `&#124;Lc&#124; ≥ 75` | Body text, fluent reading                                            |
| `{primary,secondary,error,success,warning,information}-foreground ↔ -background`                                        | `&#124;Lc&#124; ≥ 60` | UI labels (buttons, badges)                                          |
| `{primary,secondary,error,success,warning,information}-subtle-foreground ↔ -subtle`                                     | `&#124;Lc&#124; ≥ 60` | Labels on tinted (subtle) fills                                      |
| `muted-foreground ↔ muted`                                                                                              | `&#124;Lc&#124; ≥ 45` | Incidental / de-emphasised text                                      |
| `muted-foreground-subtle ↔ muted`                                                                                       | `&#124;Lc&#124; ≥ 45` | Tertiary text — helper text, captions, divider labels                |
| `disabled-foreground ↔ disabled`                                                                                        | `&#124;Lc&#124; ≥ 45` | Disabled-state text, still readable                                  |
| `nav-foreground ↔ nav-{background,item-hover,item-active}`                                                              | `&#124;Lc&#124; ≥ 60` | Nav label text on chrome surfaces                                    |
| `nav-muted-foreground ↔ nav-background`                                                                                 | `&#124;Lc&#124; ≥ 45` | Nav helper / metadata text                                           |
| `focus.color.{default,error} ↔ {background,container,popover,nav-background,nav-item-hover,nav-item-active,nav-border}` | `&#124;Lc&#124; ≥ 45` | Focus rings on every surface they hit (canvas + raised + nav chrome) |
| `chart.categorical.{1..5} ↔ {background,container}`                                                                     | `&#124;Lc&#124; ≥ 60` | Categorical chart marks on every surface                             |

**Scoring is sRGB-equivalent.** The audit measures what a legacy sRGB display renders — the lowest-common-denominator surface — so contrast guarantees hold everywhere, P3 hardware or not.

Failures must be fixed by adjusting the semantic token reference (which shade a given role points to) or the L grid values — **not** by lowering the thresholds. The tiers come from APCA's published guidance and are not negotiable per-finding.

## File Naming

Token files live under `packages/core/tokens/` — `primitives/` (color, radius, borderwidth, typography, shadow, focus) and `semantic/` (`base-{palette}-{theme}`, `brands-{name}-{theme}`, `chart-{scale}-{mode}-{theme}`, per-mode `spacing-{mode}`, and standalone `focus.json` / `breakpoints.json` / `z-index.json`). The tree is the reference; a few non-obvious choices:

- **Spacing** has no primitive layer — `spacing-{mode}.json` carries direct px (see [`spacing-tokens.md`](spacing-tokens.md)).
- **`breakpoints.json`** is theme-agnostic and build-time only (see [`responsive.md`](responsive.md)); **`z-index.json`** is a standalone semantic scale (see [`components.md` § Layering model](components.md#layering-model)).

### Shadow Tokens (Theme-Aware)

Shadow primitives split by both mode AND theme (`shadow-{mode}-{theme}.json`) because the same elevation reads differently on a light vs dark canvas — a black-tinted drop-shadow that defines a card edge in light mode disappears against a near-black canvas in dark mode. Each theme tunes its own opacity, offset, and blur.

## Color Scale Convention

Primitive colors use an 11-step shade scale (50–950). See [`color-shades.md`](color-shades.md) for what each shade means and what to use it for.

## Semantic Token Categories

Semantic colors group into Layout, Brand (`primary` / `secondary`), Status (`error` / `success` / `warning` / `information`), Borders, Navigation, Focus, and Data viz — the groupings are visible in the `base-*` / `brands-*` token files.

**See also:**

- [surfaces.md](surfaces.md) — the 5-level surface contract these tokens compose, elevation grammar, and known overlaps.
- [color-shades.md](color-shades.md) — what each 50 → 950 shade is for, per mode.
- [components.md § Layering model](components.md#layering-model) — the z-index token scale and stacking contract.

### Data viz tokens

Categorical chart palette. Hues rotate (teal → lime → orange → rose → indigo) for rhythm in stacked/grouped marks and deliberately avoid status-semantic hues (green / yellow / red) so a series doesn't read as an error. The `categorical` infix locks scale-type in both the filename and the token path, so future scale shapes (`sequential`, `diverging`) land as their own files and never collide on the same CSS variable. Each chart × surface pair is APCA-validated at the UI tier across every base palette.

## Light/Dark Theme Tokens

- **Primitives**: most are theme-agnostic (color, radius, borderwidth, typography). Shadow and focus split light/dark because the rendered value depends on the surface it sits on.
- **CSS output**: light values in the `@theme` block, dark overrides in the `.dark` selector.
- **Authoring rule**: because `.dark` already overrides semantic token values, never write `dark:` modifiers on semantic-named utilities in component code — see [`components.md` § Adaptive-by-default semantic tokens](components.md#adaptive-by-default-semantic-tokens).

## Validation

Seven `$type` values are used: `color`, `dimension`, `fontFamily`, `fontWeight`, `typography`, `shadow`, `number` (`color` is hex-only on disk — no `rgb()` / `hsl()`). The build does **not** enforce a central `$type` schema; only point validators in `utils.js` check specific roles (z-index → `number`, breakpoints → `dimension`, shadows → `shadow`).

## Font Source Extensions

A `fontFamily` token can carry `$extensions.nx-font-source` to drive font loading: `type: "google"` (with `family` / `weights` / `styles`) makes the generators emit an `@import` for Google Fonts; `type: "system"` loads nothing. (A `custom` URL type is specced but not yet implemented.)

### Variable-font axes

The `weights` array drives variable-font loading. Listing the full ramp (`[100, 200, …, 900]`, as the typography modes do for Inter) requests Inter's variable `wght` axis as a single payload, not nine static cuts. **Only `wght` is requested.** Inter also ships an `opsz` (optical-size) axis, but Google Fonts serves only the axes named in the request URL, so `opsz` is never delivered and optical sizing stays inactive. The utilities therefore do **not** emit `font-optical-sizing: auto` — with no `opsz` axis loaded it is a no-op. Activating it would mean requesting the axis in the import; no token field consumes one today.

## Generation Workflow

After editing token files, regenerate the CSS (`yarn tokens:tailwind` for the `@nexus/tailwind` package, `yarn tokens:modular` for the playground bundles), then verify with `yarn audit:contrast` and `yarn validate:spacing-modes`. Build defaults and per-axis overrides are CLI flags on `generate-tailwind-package.js` — see [§ Theme Selection](#theme-selection).

## Theme Selection

Each axis (base, brand, typography, shadow, radius, borderwidth) is selected via a CLI flag on `generate-tailwind-package.js`; the available modes per axis are the files under each `primitives/` subdir and the `base-*` / `brands-*` semantic files.

> **Spacing isn't a per-mode CLI flag.** All 7 modes (vega, lyra, maia, mira, nova, luma, sera) ship in every build — there's no single-mode build. Mode swap is via the `data-style="X"` attribute on `<html>` (or any subtree) at runtime, no rebuild needed. `--spacingDefault=<mode>` only picks which mode lands under the `:root` cascade default; the other six still emit their `[data-style="X"]` blocks. See [`spacing-tokens.md`](spacing-tokens.md).

> **Mode distinctness varies by axis.** A flag being accepted doesn't mean it resolves to unique values. `shadow` is distinct across all five modes. `typography` ships only three (`nova` / `vega` / `maia`); its `lyra` / `mira` were byte-identical to `vega` and removed. `borderwidth` exposes five flags but only two are distinct: `borderwidth-nova` (1.5px / 3px) and the `vega` cluster (`lyra` = `mira` = `vega` at 1px / 2px). Don't read a surviving `lyra` / `mira` flag as a distinct design on every axis.

## CSS Variable Naming

Primitives are `--nx-`-prefixed (`--nx-color-blue-500`); semantics drop the prefix (`--color-background`); Tailwind utilities carry the `nx:` prefix (`nx:bg-primary-background`).

> **Spacing emits both forms with different jobs.** `--spacing-{N}` lives in `@theme {}` as a **build-time** input — Tailwind reads it to decide which utility classes to emit (`nx:p-4`, `nx:gap-4`, etc.). `--nx-spacing-{N}` is the **runtime** variable the emitted utilities reference (`.nx\:p-4 { padding: var(--nx-spacing-4) }`); per-mode `[data-style="X"]` blocks override it, so mode-switching cascades to every `nx:p-*` utility without a rebuild. For runtime consumption outside Tailwind (inline styles, SVG, canvas), use `var(--nx-spacing-N)` — `var(--spacing-N)` may not exist at runtime.

> **Standalone semantic vars.** `--breakpoint-{sm,md,lg,xl,2xl}` and `--z-index-{overlay,sticky,modal,popover,toast,max}` are semantic-only (no `--nx-` prefix, no primitive layer). The token name IS the full variable.

## Typography Utilities

Typography composite tokens (in `tokens/styles/typography.json`) generate `@utility typography-*` classes (`nx:typography-body-default`, `nx:typography-heading-large`, …). The generator emits `text-wrap: pretty` on the **body tier only** — orphan/widow protection for multi-line copy, unwanted on headings.

Letter-spacing is **proportional**: `tight` (−0.4px) on display + headings ≥ 30px, `normal` (0) at 24px and below — bigger type tightens, body-scale stays neutral. There's no intermediate step, so 30px is the threshold.

### Typography modes → product archetypes

Three typography modes ship, differing by a uniform ±1px on every step of the size scale:

| Mode     | Archetype            | Use for                                                              |
| -------- | -------------------- | -------------------------------------------------------------------- |
| `nova`   | Tool / dense         | Developer tools, dashboards, data-heavy UIs (Figma / Linear density) |
| `vega` ★ | Standard product     | SaaS, consumer apps — the recommended default and bundled mode       |
| `maia`   | Editorial / document | Reading-focused UIs, document editors (Notion density)               |

All three currently share the Inter / Georgia / JetBrains Mono families — they differ by scale only. Two former modes (`lyra`, `mira`) were byte-duplicates of `vega` and were removed; reintroduce them only with a real typeface or scale-ratio decision behind them.

## Do Not

- Edit files in `dist/` or `packages/tailwind/` directly (they're generated — re-run `yarn tokens:tailwind`)
- Use raw hex in semantic **color** tokens — reference a primitive (`{slate.500}`)
- Add a themed color file (`base-*`, `brands-*`, `chart-*`) without **both** light and dark variants
- Add any token without a `$type` property
