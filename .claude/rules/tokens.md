# Design Token Rules

## Token Format (W3C DTCG)

All tokens MUST follow the W3C Design Tokens Community Group format:

```json
{
  "tokenName": {
    "$value": "value-here",
    "$type": "color|dimension|fontWeight|shadow|etc",
    "$description": "Optional description"
  }
}
```

Required properties: `$value`, `$type`
Optional properties: `$description`, `$extensions`

## Color Token Pipeline

> Public-facing companion: [`packages/core/docs/color-math.md`](../../packages/core/docs/color-math.md) narrates this pipeline for designers and external readers.

**On-disk format: hex strings.** `tokens/primitives/color.json` stores hex — 6-digit for solid shades (`#020617`) and 8-digit for alpha shades (`#0206170a`, see [§ Alpha Token Scale](#alpha-token-scale)). Tokens Studio and Figma Variables hex-normalise color values on export and cannot round-trip OKLCH, so hex is the only viable on-disk format for a Figma-driven workflow.

**Runtime format: OKLCH.** The build pipeline converts hex to `oklch(...)` at emit time. The conversion happens in `packages/core/scripts/utils.js` (`formatTokenValue`), which routes every `$type: "color"` hex value through `packages/core/scripts/lib/perceptual-grid.js`.

### Routing modes

**Grid-pinned** — applies whenever the token path has length ≥ 2 and its **last segment** is a shade key (`shade ∈ {50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950}`). This handles both today's flat palette shape (`{palette}.{shade}`) and any future nested grouping (`chart.series.500`). Lightness (L) is overwritten by the perceptual grid loaded from `packages/core/src/lib/perceptual-grid.json`. Chroma comes from culori's parse of the hex and is then clamped via `clampChroma(color, 'oklch', 'p3')` so shades ship at their full chroma up to the Display P3 boundary; only the over-P3 excess clips. The build warns when post-clamp chroma drops by more than 20% (rare under P3 — flags the cases worth a designer's eye). Hue is preserved from the hex.

**Mechanical** — applies to everything else: white, black, the alpha shades (`a50`–`a950`, 8-digit hex), and any one-off value whose last path segment isn't a palette shade key. Straight hex→oklch via culori; alpha is preserved from 8-digit hex.

### Alpha Token Scale

Every palette ships **alpha (transparent) shades** `a50`–`a950` alongside the solid `50`–`950` scale. Translucent surfaces — popover / command-palette backgrounds, modal scrims, hover rows on tinted lists, borders on colored cards — reference these instead of hand-written `rgba()`, so they blend with whatever surface they sit on and theme correctly across every base palette.

**Structure.** Chromatic palettes nest the alpha shades under the palette (`slate.a200` → `{slate.a200}`). `white` and `black` are standalone leaf tokens, so their alpha shades are **top-level leaves** referenced with a hyphen (`{white-a900}`, `{black-a50}`) — nesting them would break the existing `{white}` / `{black}` references.

**Value derivation.** Each alpha shade is the palette's **950 hex** plus an alpha byte from this curve:

| Shade     | `a50` | `a100` | `a200` | `a300` | `a400` | `a500` | `a600` | `a700` | `a800` | `a900` | `a950` |
| --------- | ----- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Alpha     | `0a`  | `10`   | `18`   | `30`   | `50`   | `80`   | `a0`   | `c0`   | `d8`   | `e8`   | `f4`   |
| ≈ opacity | 4%    | 6%     | 9%     | 19%    | 31%    | 50%    | 63%    | 75%    | 85%    | 91%    | 96%    |

E.g. `slate` (950 = `#020617`) yields `slate.a50` = `#0206170a` and `slate.a500` = `#02061780`.

**Routing.** Alpha shades route **mechanically** (not grid-pinned): the shade-key regex matches only `50`–`950`, so an `a*` segment falls through to a straight hex→OKLCH conversion. L/C/H come from the 950 base hex and the alpha channel is preserved — `slate.a200` → `oklch(0.1288 0.0406 264.695 / 0.0941)`. To retune the curve, edit the alpha bytes in `color.json`; the perceptual grid does **not** apply to alpha shades.

**Semantic alpha tokens.** Each base file exposes `background-hover-alpha`, `popover-alpha`, `popover-backdrop`, `border.default-alpha`, and `overlay` (migrated from a hardcoded `#…cc` to `{palette.a700}` light / `{palette.a800}` dark).

**Not APCA-gated.** Alpha tokens blend with their backdrop, so their contrast is context-dependent — they are intentionally excluded from the `audit:contrast` pairs. `oklchToSrgbInts()` throws on an alpha-bearing color, so any future pair that needs one must pre-blend against its surface first.

**Figma parity.** The alpha primitives are mirrored into `figma-snapshot.json` so `audit:figma-parity --category color` sees no drift. Figma is the side that catches up — designers add the matching alpha variables there (code is canonical, per `.claude/rules/figma.md`).

### Warning for designers

When you pick a hex in Figma for a palette shade, only the **hue and chroma** of that hex flow through to the generated CSS. The **L is overwritten by the grid**. A vivid `#ff0000` and a dark `#400000` at the same shade key produce identical lightness — only the hue and chroma differ. To change the lightness of a shade, edit `packages/core/src/lib/perceptual-grid.json` — the JSON hex is not the right lever.

### DTCG deviation

We keep `$value` as a hex string on disk rather than the DTCG-2025.10 structured-object form (`{ "colorSpace": "oklch", "components": [...] }`). Reason: design tools write hex strings on export, not DTCG objects, so the structured form would be lost on the next round-trip. The string form passes through the existing resolver unchanged. Revisit if a downstream consumer ever needs spec-compliant import.

### Browser floor

OKLCH requires Chrome 111+, Safari 15.4+, Firefox 113+ (Baseline 2023). No hex fallback is emitted. Consumers needing older browsers must pin to the last pre-migration tag.

**Display P3 delivery is automatic.** Emitted `oklch(...)` values carry P3 chroma; browsers map them to the display's native gamut at render time — full Display P3 on capable hardware (most laptops/tablets/phones since ~2017), gamut-mapped to sRGB on legacy displays. No `@media (color-gamut: p3)` query or hex fallback is needed; the CSS is the same everywhere, capable hardware just shows more of the chroma the source hex carried.

### APCA contrast gate

`yarn workspace @nexus/core audit:contrast` (implemented in `packages/core/scripts/audit-contrast.js`) runs APCA Lc on every base and brand foreground↔background pair, with thresholds chosen per APCA's intended-use tiers:

| Pair                                                                                                                    | Threshold | Rationale |
| ----------------------------------------------------------------------------------------------------------------------- | --------- | --------- | ----- | -------------------------------------------------------------------- |
| `foreground ↔ background`                                                                                               | `         | Lc        | ≥ 75` | Body text, fluent reading                                            |
| `{primary,secondary,error,success,warning,information}-foreground ↔ -background`                                        | `         | Lc        | ≥ 60` | UI labels (buttons, badges)                                          |
| `{primary,secondary,error,success,warning,information}-subtle-foreground ↔ -subtle`                                     | `         | Lc        | ≥ 60` | Labels on tinted (subtle) fills                                      |
| `muted-foreground ↔ muted`                                                                                              | `         | Lc        | ≥ 45` | Incidental / de-emphasised text                                      |
| `muted-foreground-subtle ↔ muted`                                                                                       | `         | Lc        | ≥ 45` | Tertiary text — helper text, captions, divider labels                |
| `disabled-foreground ↔ disabled`                                                                                        | `         | Lc        | ≥ 45` | Disabled-state text, still readable                                  |
| `nav-foreground ↔ nav-{background,item-hover,item-active}`                                                              | `         | Lc        | ≥ 60` | Nav label text on chrome surfaces                                    |
| `nav-muted-foreground ↔ nav-background`                                                                                 | `         | Lc        | ≥ 45` | Nav helper / metadata text                                           |
| `focus.color.{default,error} ↔ {background,container,popover,nav-background,nav-item-hover,nav-item-active,nav-border}` | `         | Lc        | ≥ 45` | Focus rings on every surface they hit (canvas + raised + nav chrome) |
| `chart.categorical.{1..5} ↔ {background,container}`                                                                     | `         | Lc        | ≥ 60` | Categorical chart marks on every surface                             |

**Scoring is sRGB-equivalent.** APCA reads only `[r, g, b]` ints, so `hexToSrgbInts` re-clamps the (P3-emit) color into sRGB before sampling channels. The audit measures what a legacy sRGB display renders — the lowest-common-denominator surface — so contrast guarantees hold everywhere, P3 hardware or not. APCA scores are byte-stable across the sRGB→P3 emit retarget (issue #86).

Failures must be fixed by adjusting the semantic token reference (which shade a given role points to) or the L grid values — not by lowering the thresholds. The tiers themselves come from APCA's published guidance and are not negotiable per-finding.

## File Naming

| Directory  | Pattern                               | Example                                                                       |
| ---------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| primitives | `color.json`                          | Single file with all color scales                                             |
| primitives | `{category}/{category}-{mode}.json`   | `radius/radius-subtle.json`, `borderwidth/borderwidth-vega.json`              |
| primitives | `shadow/shadow-{mode}-{theme}.json`   | `shadow/shadow-vega-light.json`, `shadow-vega-dark.json`                      |
| primitives | `typography/typography-{mode}.json`   | `typography/typography-vega.json`                                             |
| primitives | `borderwidth/borderwidth-{mode}.json` | `borderwidth/borderwidth-vega.json`                                           |
| primitives | `focus/focus-{name}-{theme}.json`     | `focus/focus-default-light.json`, `focus-default-dark.json`                   |
| semantic   | `base-{palette}-{theme}.json`         | `base-slate-light.json`, `base-slate-dark.json`                               |
| semantic   | `brands-{name}-{theme}.json`          | `brands-blue-light.json`, `brands-blue-dark.json`                             |
| semantic   | `chart-{scale}-{mode}-{theme}.json`   | `chart-categorical-default-light.json`, `chart-categorical-default-dark.json` |
| semantic   | `spacing-{mode}.json`                 | Per-mode direct-px spacing (no primitive layer — see `spacing-tokens.md`)     |
| semantic   | `focus.json`                          | Standalone semantic — focus colour refs + the `focus.offset` outline distance |
| component  | `{component}.json`                    | `button.json` (future)                                                        |
| styles     | `{name}.json`                         | `styles/shadows.json`, `styles/typography.json`                               |

### Shadow Tokens (Theme-Aware)

Shadow tokens have light/dark variants because shadows appear differently on light vs dark backgrounds:

```
primitives/shadow/
├── shadow-vega-light.json    # Vega shadows for light theme
├── shadow-vega-dark.json     # Vega shadows for dark theme
├── shadow-lyra-light.json
├── shadow-lyra-dark.json
└── ...
```

Available shadow modes: `vega`, `lyra`, `maia`, `mira`, `nova`

## Nested Token Structure

Semantic tokens use nested groups for states:

```json
{
  "primary": {
    "background": { "$value": "{blue.600}", "$type": "color" },
    "background-hover": { "$value": "{blue.700}", "$type": "color" },
    "background-active": { "$value": "{blue.800}", "$type": "color" },
    "foreground": { "$value": "{white}", "$type": "color" },
    "disabled": { "$value": "{blue.300}", "$type": "color" },
    "subtle": { "$value": "{blue.50}", "$type": "color" },
    "subtle-foreground": { "$value": "{blue.600}", "$type": "color" },
    "subtle-hover": { "$value": "{blue.100}", "$type": "color" },
    "subtle-active": { "$value": "{blue.200}", "$type": "color" }
  }
}
```

This generates CSS variables like `--color-primary-background`, `--color-primary-background-hover`, etc.

## Reference Syntax

Semantic tokens reference primitives using curly brace syntax:

```json
{
  "background": {
    "$value": "{slate.50}",
    "$type": "color"
  }
}
```

The reference path matches the JSON structure: `{colorName.shade}`. At build time the resolver walks this reference to the primitive hex value, then the OKLCH converter emits `var(--nx-color-slate-50)` as an `oklch(...)` value. The hex string stays in JSON; the CSS variable contains OKLCH. See [§ Color Token Pipeline](#color-token-pipeline) for routing details.

## Color Scale Convention

Primitive colors use Tailwind's shade scale (50-950):

```
50   - Lightest (backgrounds)
100  - Very light
200  - Light
300  - Light-medium
400  - Medium-light
500  - Base/default
600  - Medium-dark
700  - Dark
800  - Very dark
900  - Darker
950  - Darkest (text on light bg)
```

## Semantic Token Categories

| Category   | Properties                                                                                                    | Example                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Layout     | `background`, `foreground`, `container`, `popover`, `muted`, `muted-foreground-subtle`                        | `--color-background`                      |
| Brand      | `primary.*`, `secondary.*`                                                                                    | `--color-primary-background`              |
| Status     | `error.*`, `success.*`, `warning.*`, `information.*`                                                          | `--color-error-subtle-foreground`         |
| Borders    | `border.default`, `border.primary`, `border.error`, etc.                                                      | `--color-border-default`                  |
| Navigation | `nav-background`, `nav-foreground`, `nav-muted-foreground`, `nav-item-hover`, `nav-item-active`, `nav-border` | `--color-nav-background`                  |
| Focus      | `focus.{default,error}` colour refs; `focus.offset` outline distance                                          | `--color-focus-default`, `--focus-offset` |
| Data viz   | `chart.categorical.{1..5}`                                                                                    | `--color-chart-categorical-1`             |

Each brand/status group has: `background`, `background-hover`, `background-active`, `foreground`, `disabled`, `subtle`, `subtle-foreground`, `subtle-hover`, `subtle-active`

**See also:**

- [surfaces.md](surfaces.md) — the 5-level surface contract these tokens compose (canvas / muted / container / popover / nav), elevation grammar, and known overlaps.
- [color-shades.md](color-shades.md) — what each 50 → 950 shade is for, per mode.
- [components.md § Layering model](components.md#layering-model) — the z-index token scale (`--z-index-*`) and stacking contract.

### Data viz tokens

Categorical chart palette for data visualization. Hues rotate (teal → lime → orange → rose → indigo) for visual rhythm in stacked/grouped marks and deliberately avoid status-semantic hues (green/amber/red) so a red bar doesn't read as an error series.

Theme-aware — lives in `chart-categorical-{mode}-light.json` and `chart-categorical-{mode}-dark.json` (a themed pair). The `categorical` infix locks scale-type in both the filename and the token path (`chart.categorical.{1..5}` → `--color-chart-categorical-{1..5}`), so future scale shapes (sequential, diverging) land as `chart-sequential-default-*.json` with `chart.sequential.N` paths and never collide on the same CSS variable. Light mode uses shade 600–700 primitives (dark colors on a near-white canvas); dark mode uses shade 200–300 (light colors on a near-black canvas). Each chart × surface pair (`chart.categorical.{1..5}` ↔ `background`, `chart.categorical.{1..5}` ↔ `container`) is APCA-validated at Lc ≥ 60 (UI tier) across every base palette by `yarn audit:contrast`.

## Light/Dark Theme Tokens

- **Primitives**: Single file with all color scales (theme-agnostic)
- **Semantics**: Themed pairs follow `{type}-{mode}-light.json` + `{type}-{mode}-dark.json`. Concrete instances: `base-slate-{light,dark}.json`, `brands-blue-{light,dark}.json`, `chart-categorical-default-{light,dark}.json`.
- CSS output: Light in `@theme` block, dark in `.dark` selector
- **Authoring rule**: Because the `.dark` selector already overrides semantic token values, never write `dark:` modifiers on semantic-named utilities in component code — see [`components.md` § Adaptive-by-default semantic tokens](components.md#adaptive-by-default-semantic-tokens).

## Validation

Valid `$type` values:

- `color` - Color values (#hex, rgb, hsl)
- `dimension` - Sizes with units (rem, px)
- `fontFamily` - Font stack
- `fontWeight` - Weight values (400, 700)
- `duration` - Time values (ms, s)
- `shadow` - Box shadow definitions
- `number` - Unitless numbers

## Font Source Extensions

Typography font family tokens can include `$extensions.nx-font-source` for automatic font loading:

| `type`   | Description             | Required Fields               |
| -------- | ----------------------- | ----------------------------- |
| `google` | Load from Google Fonts  | `family`, `weights`, `styles` |
| `system` | System font (no import) | None                          |
| `custom` | Custom URL (future)     | `url`                         |

Example:

```json
{
  "font-mono": {
    "$value": "JetBrains Mono",
    "$type": "fontFamily",
    "$extensions": {
      "nx-font-source": {
        "type": "google",
        "family": "JetBrains+Mono",
        "weights": [400, 500, 600, 700],
        "styles": ["normal"]
      }
    }
  }
}
```

The generation scripts (`generate-tailwind-package.js`, `generate-modular.js`) read these extensions and output `@import` statements for Google Fonts at the top of the generated CSS.

### Variable-font axes

The `weights` array drives variable-font loading. Listing the full ramp (`[100, 200, …, 900]`, as the typography modes do for Inter) requests Inter's variable `wght` axis from Google Fonts as a single payload, not nine static cuts. **Only `wght` is requested.** Inter also ships an `opsz` (optical-size) axis, but Google Fonts serves only the axes named in the request URL (`Inter:wght@…`), so `opsz` is never delivered and optical sizing stays inactive. The utilities therefore do **not** emit `font-optical-sizing: auto` — with no `opsz` axis loaded it is a no-op, and `auto` is the CSS initial value besides. Activating optical sizing would mean requesting the axis in the import (`Inter:opsz,wght@…`); there is no `variableAxes` / `opsz` field in the token JSON because nothing consumes one today.

## Generation Workflow

After editing token files:

```bash
# Generate @nexus/tailwind package CSS
yarn tokens:tailwind           # Bundled defaults: --base=stone --brand=neutral --radius=sharp

# Modular CSS (all themes for playground)
yarn tokens:modular
```

## Theme Selection

Configure theme via CLI arguments:

```bash
node scripts/generate-tailwind-package.js --base=stone --brand=neutral
```

Available options:

- **Base**: slate, neutral, zinc, gray, stone
- **Brand**: blue, gray, neutral, slate, stone
- **Typography**: nova, vega, maia
- **Shadow**: vega, lyra, maia, mira, nova
- **Radius**: blunt, sharp, subtle, smooth, mellow
- **Border Width**: vega, lyra, maia, mira, nova

> **Spacing isn't a per-mode CLI flag.** All 7 modes (vega, lyra, maia, mira, nova, luma, sera) ship in every build — there's no single-mode build. Mode swap is via the `data-style="X"` attribute on `<html>` (or any subtree) at runtime, no rebuild needed. `--spacingDefault=<mode>` is the one related CLI option: it only picks which mode lands under the `:root` cascade default (so a document with no `data-style` attribute resolves to that mode); the other six still emit their `[data-style="X"]` blocks alongside. See `spacing-tokens.md`.

> **Mode distinctness varies by axis.** A mode listed above means the CLI flag is accepted — not that it resolves to unique values. `shadow` is genuinely distinct across all five modes. `typography` ships only three (`nova` / `vega` / `maia`); its `lyra` / `mira` were byte-identical to `vega` and removed. `borderwidth` still exposes five flags, but several are byte-identical copies of `vega` (`borderwidth-lyra` = `borderwidth-mira` = `borderwidth-vega`) — the flag resolves, it just yields the same tokens. Don't read a surviving `lyra` / `mira` flag as a distinct design on every axis.

## CSS Variable Naming

| Type             | Pattern                  | Example                                 |
| ---------------- | ------------------------ | --------------------------------------- |
| Primitive        | `--nx-{category}-{path}` | `--nx-color-blue-500`, `--nx-radius-md` |
| Semantic         | `--{category}-{path}`    | `--color-background`, `--spacing-4`     |
| Tailwind utility | `nx:{utility}`           | `nx:bg-primary`, `nx:p-4`               |

> **Spacing has no primitive layer.** `spacing-{mode}.json` files carry direct px values (no `{N}` refs), so there is no `--nx-size-*` namespace — `--nx-spacing-N` is emitted directly from the per-mode semantic files. See `spacing-tokens.md`.

## Typography Utilities

Typography composite tokens (defined in `tokens/styles/typography.json`) generate `@utility` classes with the `typography-*` prefix. The generator emits `text-wrap: pretty` on the **body tier only** (orphan/widow protection for multi-line copy):

```css
@utility typography-body-default {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-base);
  font-weight: var(--nx-typography-weight-normal);
  line-height: var(--nx-typography-line-height-base);
  letter-spacing: var(--nx-typography-letterspacing-normal);
  text-wrap: pretty;
}
```

Usage: `nx:typography-body-default`, `nx:typography-heading-large`, etc.

### The 17 composite utilities

| Tier    | Utilities                                                                             | Weight            | Letter-spacing |
| ------- | ------------------------------------------------------------------------------------- | ----------------- | -------------- |
| Display | `display-large` (60px), `display-medium` (48px)                                       | light / normal    | tight          |
| Heading | `heading-xlarge` (36px), `heading-large` (30px)                                       | semibold          | tight          |
| Heading | `heading-medium` (24px), `heading-small` (20px), `heading-xsmall` (18px)              | semibold          | normal         |
| Body    | `body-large` (18px), `body-default` (16px), `body-small` (14px), `body-xsmall` (12px) | normal            | normal         |
| Label   | `label-large` / `label-default` / `label-small` (14/14/12px), `label-caps` (12px)     | semibold/medium   | normal / wider |
| Code    | `code-block`, `code-inline` (14px, mono)                                              | normal / semibold | 0              |

Letter-spacing is **proportional**: `tight` (−0.4px) on display + headings ≥ 30px, `normal` (0) at 24px and below — bigger type tightens, body-scale stays neutral. The token jumps straight from `tight` to `normal` (no intermediate step), so 30px is the threshold.

### Typography modes → product archetypes

Three typography modes ship, differing by a uniform **±1px on every step** of the 13-step size scale:

| Mode     | Base | Archetype            | Use for                                                              |
| -------- | ---- | -------------------- | -------------------------------------------------------------------- |
| `nova`   | 15px | Tool / dense         | Developer tools, dashboards, data-heavy UIs (Figma / Linear density) |
| `vega` ★ | 16px | Standard product     | SaaS, consumer apps — the recommended default and bundled mode       |
| `maia`   | 17px | Editorial / document | Reading-focused UIs, document editors (Notion density)               |

Select via the `--typography` CLI flag (see [Theme Selection](#theme-selection)). All three currently share the Inter / Georgia / JetBrains Mono families — they differ by scale only. Two former modes (`lyra`, `mira`) were byte-duplicates of `vega` and were removed; reintroduce them only with a real typeface or scale-ratio decision behind them.

## Do Not

- Edit files in `dist/` or `packages/tailwind/` directly
- Use raw hex values in semantic tokens (use `{references}`)
- Forget to create both light and dark variants for semantic files
- Add tokens without `$type` property
