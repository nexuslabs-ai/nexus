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

**On-disk format: hex strings.** `tokens/primitives/color.json` and the ten semantic overlay tokens (e.g., `#000000cc`) store hex. Tokens Studio and Figma Variables hex-normalise color values on export and cannot round-trip OKLCH, so hex is the only viable on-disk format for a Figma-driven workflow.

**Runtime format: OKLCH.** The build pipeline converts hex to `oklch(...)` at emit time. The conversion happens in `packages/core/scripts/utils.js` (`formatTokenValue`), which routes every `$type: "color"` hex value through `packages/core/scripts/lib/perceptual-grid.js`.

### Routing modes

**Grid-pinned** — applies whenever the token path has length ≥ 2 and its **last segment** is a shade key (`shade ∈ {50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950}`). This handles both today's flat palette shape (`{palette}.{shade}`) and any future nested grouping (`chart.series.500`). Lightness (L) is overwritten by the perceptual grid loaded from `packages/core/scripts/lib/perceptual-grid.json`. Chroma comes from culori's parse of the hex and is then clamped via `culori.toGamut('rgb')` to stay in sRGB. Hue is preserved from the hex.

**Mechanical** — applies to everything else: white, black, semantic overlay hex with alpha (e.g., `#000000cc`), and any one-off value that isn't a palette shade key. Straight hex→oklch via culori; alpha is preserved from 8-digit hex.

### Warning for designers

When you pick a hex in Figma for a palette shade, only the **hue and chroma** of that hex flow through to the generated CSS. The **L is overwritten by the grid**. A vivid `#ff0000` and a dark `#400000` at the same shade key produce identical lightness — only the hue and chroma differ. To change the lightness of a shade, edit `packages/core/scripts/lib/perceptual-grid.json` — the JSON hex is not the right lever.

### DTCG deviation

We keep `$value` as a hex string on disk rather than the DTCG-2025.10 structured-object form (`{ "colorSpace": "oklch", "components": [...] }`). Reason: design tools write hex strings on export, not DTCG objects, so the structured form would be lost on the next round-trip. The string form passes through the existing resolver unchanged. Revisit if a downstream consumer ever needs spec-compliant import.

### Browser floor

OKLCH requires Chrome 111+, Safari 15.4+, Firefox 113+ (Baseline 2023). No hex fallback is emitted. Consumers needing older browsers must pin to the last pre-migration tag.

### APCA contrast gate

`yarn workspace @nexus/core audit:contrast` (implemented in `packages/core/scripts/audit-contrast.js`) runs APCA Lc on every base and brand foreground↔background pair, with thresholds chosen per APCA's intended-use tiers:

| Pair                                                                                | Threshold | Rationale |
| ----------------------------------------------------------------------------------- | --------- | --------- | ----- | -------------------------------------- |
| `foreground ↔ background`                                                           | `         | Lc        | ≥ 75` | Body text, fluent reading              |
| `{primary,secondary,error,success,warning,information}-foreground ↔ -background`    | `         | Lc        | ≥ 60` | UI labels (buttons, badges)            |
| `{primary,secondary,error,success,warning,information}-subtle-foreground ↔ -subtle` | `         | Lc        | ≥ 60` | Labels on tinted (subtle) fills        |
| `muted-foreground ↔ muted`                                                          | `         | Lc        | ≥ 45` | Incidental / de-emphasised text        |
| `muted-light-foreground ↔ muted-light`                                              | `         | Lc        | ≥ 45` | Dividers, helper text, subtle surfaces |
| `disabled-foreground ↔ disabled`                                                    | `         | Lc        | ≥ 45` | Disabled-state text, still readable    |
| `focus.{default,error} ↔ {background,container,popover}`                            | `         | Lc        | ≥ 45` | Focus rings on every surface they hit  |

Failures must be fixed by adjusting the semantic token reference (which shade a given role points to) or the L grid values — not by lowering the thresholds. The tiers themselves come from APCA's published guidance and are not negotiable per-finding.

## File Naming

| Directory  | Pattern                             | Example                                                  |
| ---------- | ----------------------------------- | -------------------------------------------------------- |
| primitives | `color.json`                        | Single file with all color scales                        |
| primitives | `{category}/{category}-{mode}.json` | `size/size-vega.json`, `radius/radius-subtle.json`       |
| primitives | `shadow/shadow-{mode}-{theme}.json` | `shadow/shadow-vega-light.json`, `shadow-vega-dark.json` |
| primitives | `typography/typography-{mode}.json` | `typography/typography-vega.json`                        |
| semantic   | `base-{palette}-{theme}.json`       | `base-slate-light.json`, `base-slate-dark.json`          |
| semantic   | `brands-{name}-{theme}.json`        | `brands-blue-light.json`, `brands-blue-dark.json`        |
| semantic   | `spacing.json`                      | Standalone semantic (no light/dark variant)              |
| component  | `{component}.json`                  | `button.json` (future)                                   |

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

| Category | Properties                                                  | Example                           |
| -------- | ----------------------------------------------------------- | --------------------------------- |
| Layout   | `background`, `foreground`, `container`, `popover`, `muted` | `--color-background`              |
| Brand    | `primary.*`, `secondary.*`                                  | `--color-primary-background`      |
| Status   | `error.*`, `success.*`, `warning.*`, `information.*`        | `--color-error-subtle-foreground` |
| Borders  | `border.default`, `border.primary`, `border.error`, etc.    | `--color-border-default`          |

Each brand/status group has: `background`, `background-hover`, `background-active`, `foreground`, `disabled`, `subtle`, `subtle-foreground`, `subtle-hover`, `subtle-active`

## Light/Dark Theme Tokens

- **Primitives**: Single file with all color scales (theme-agnostic)
- **Semantics**: Separate files for light and dark modes
  - `base-{palette}-light.json` → light mode values
  - `base-{palette}-dark.json` → dark mode values
- CSS output: Light in `@theme` block, dark in `.dark` selector

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
- **Size**: vega, lyra, maia, mira, nova
- **Typography**: vega, lyra, maia, mira, nova
- **Shadow**: vega, lyra, maia, mira, nova
- **Radius**: blunt, sharp, subtle, smooth, mellow
- **Border Width**: vega, lyra, maia, mira, nova

## CSS Variable Naming

| Type             | Pattern                  | Example                              |
| ---------------- | ------------------------ | ------------------------------------ |
| Primitive        | `--nx-{category}-{path}` | `--nx-color-blue-500`, `--nx-size-4` |
| Semantic         | `--{category}-{path}`    | `--color-background`, `--spacing-4`  |
| Tailwind utility | `nx:{utility}`           | `nx:bg-primary`, `nx:p-4`            |

## Typography Utilities

Typography composite tokens generate `@utility` classes with `typography-*` prefix:

```css
@utility typography-body-default {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-base);
  font-weight: var(--nx-typography-weight-normal);
  line-height: var(--nx-typography-line-height-base);
  letter-spacing: var(--nx-typography-letterspacing-normal);
}
```

Usage: `nx:typography-body-default`, `nx:typography-heading-large`, etc.

## Do Not

- Edit files in `dist/` or `packages/tailwind/` directly
- Use raw hex values in semantic tokens (use `{references}`)
- Forget to create both light and dark variants for semantic files
- Add tokens without `$type` property
