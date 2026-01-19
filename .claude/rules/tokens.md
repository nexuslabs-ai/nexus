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
    "background": { "$value": "{blue.500}", "$type": "color" },
    "foreground": { "$value": "{blue.50}", "$type": "color" },
    "hover": { "$value": "{blue.600}", "$type": "color" },
    "active": { "$value": "{blue.700}", "$type": "color" },
    "disabled": { "$value": "{blue.300}", "$type": "color" },
    "text": { "$value": "{blue.500}", "$type": "color" },
    "surface": { "$value": "{blue.100}", "$type": "color" }
  }
}
```

This generates CSS variables like `--color-primary-background`, `--color-primary-hover`, etc.

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

The reference path matches the JSON structure: `{colorName.shade}`

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

| Category | Properties                                                            | Example                      |
| -------- | --------------------------------------------------------------------- | ---------------------------- |
| Layout   | `background`, `foreground`, `container`, `popover`, `muted`, `accent` | `--color-background`         |
| Brand    | `primary.*`, `secondary.*`                                            | `--color-primary-background` |
| Status   | `error.*`, `success.*`, `warning.*`, `information.*`                  | `--color-error-text`         |
| Borders  | `border.default`, `border.primary`, `border.error`, etc.              | `--color-border-default`     |

Each brand/status group has: `background`, `foreground`, `hover`, `active`, `disabled`, `text`, `surface`

## Light/Dark Theme Tokens

- **Primitives**: Single file with all color scales (theme-agnostic)
- **Semantics**: Separate files for light and dark modes
  - `base-{palette}-light.json` → light mode values
  - `base-{palette}-dark.json` → dark mode values
- CSS output: Light in `@theme` block, dark in `.dark` selector

## Validation

Token files are validated against `packages/core/tokens.schema.json`

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
yarn tokens:tailwind           # Uses default: --base=slate --brand=blue

# Modular CSS (all themes for playground)
yarn tokens:modular
```

## Theme Selection

Configure theme via CLI arguments:

```bash
node scripts/generate-tailwind-package.js --base=slate --brand=blue
```

Available options:

- **Base**: slate, neutral, zinc, gray, stone
- **Brand**: blue, gray, neutral, slate
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
