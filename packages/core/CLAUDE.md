# Core Package (@nexus/core)

Private package containing design tokens in W3C DTCG format. Not published to npm.

## Quick Reference

```bash
yarn build:tokens                           # Generate production CSS (default: slate/blue)
yarn build:tokens:modular                   # Generate modular CSS for playground
node scripts/generate-css.js --base=neutral --brand=gray  # Custom theme
```

Output:
- `dist/globals.css` → auto-copied to `packages/react/src/generated/globals.css`
- `dist/modular/` → individual theme CSS files for playground

## Token Structure

```
tokens/
├── primitives/
│   ├── color.json             # All color scales (theme-agnostic)
│   ├── size/                  # Size/spacing modes
│   │   ├── size-vega.json     # Default density
│   │   ├── size-lyra.json     # Compact density
│   │   ├── size-maia.json     # Comfortable density
│   │   ├── size-mira.json     # Spacious density
│   │   └── size-nova.json     # Extra spacious
│   ├── typography/            # Typography scale modes
│   │   └── typography-{mode}.json
│   ├── shadow/                # Shadow intensity modes
│   │   └── shadow-{mode}.json
│   ├── radius/                # Border radius modes
│   │   └── radius-{mode}.json
│   └── borderwidth/           # Border width modes
│       └── borderwidth-{mode}.json
├── semantic/
│   ├── base-slate-light.json  # Slate base - light mode
│   ├── base-slate-dark.json   # Slate base - dark mode
│   ├── base-{palette}-*.json  # Other palette variants (neutral, zinc, gray, stone)
│   └── brands-{brand}-*.json  # Brand variants (blue, gray, neutral, slate)
├── styles/
│   ├── typography.json        # Typography style definitions → @utility classes
│   └── shadows.json           # Shadow style definitions → --shadow-* variables
└── component/                 # Component-specific tokens (future)
```

## Token Format (W3C DTCG)

**Primitive token** (direct value):
```json
{
  "blue": {
    "500": { "$value": "#3b82f6", "$type": "color" }
  }
}
```

**Semantic token** (nested, with reference):
```json
{
  "primary": {
    "background": { "$value": "{blue.500}", "$type": "color" },
    "foreground": { "$value": "{blue.50}", "$type": "color" },
    "hover": { "$value": "{blue.600}", "$type": "color" }
  }
}
```

Reference syntax: `{colorName.shade}` → `var(--colorName-shade)`

## Theme Selection

Themes are selected via CLI arguments:

```bash
# Default theme (all options have defaults)
yarn tokens  # Uses slate/blue/vega defaults

# Custom theme
node scripts/generate-css.js --base=neutral --brand=gray --size=lyra --shadow=subtle
```

Available options:

| Option | Default | Values |
|--------|---------|--------|
| `--base` | slate | slate, neutral, zinc, gray, stone |
| `--brand` | blue | blue, gray, neutral, slate |
| `--size` | vega | vega, lyra, maia, mira, nova |
| `--typography` | vega | vega, lyra, maia, mira, nova |
| `--shadow` | vega | vega, lyra, maia, mira, nova |
| `--radius` | subtle | blunt, sharp, subtle, smooth, mellow |
| `--borderwidth` | vega | vega, lyra, maia, mira, nova |

## Generated CSS Structure

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  /* Primitives - all color scales */
  --blue-500: #3b82f6;
  --slate-50: #f8fafc;

  /* Size/spacing primitives (from selected mode) */
  --size-0: 0rem;
  --size-4: 1rem;

  /* Shadow variables */
  --shadow-xs: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  --shadow-focus: 0px 0px 0px 2px var(--blue-100);
}

@theme inline {
  /* Semantic tokens - light mode */
  --color-background: var(--slate-50);
  --color-primary-background: var(--blue-500);
}

.dark {
  /* Semantic tokens - dark mode overrides */
  --color-background: var(--slate-950);
}

/* Typography utilities (Tailwind v4 @utility) */
@utility text-display-large {
  font-family: var(--family-font-sans);
  font-size: var(--size-6xl);
  font-weight: var(--weight-light);
  line-height: var(--leading-6xl);
}

@layer base { ... }
```

## Modular CSS (for Playground)

Generate separate CSS files for dynamic theme switching:

```bash
yarn build:tokens:modular
```

Output in `dist/modular/`:

| File Pattern | Content |
|--------------|---------|
| `primitives.css` | All color scales |
| `base-{palette}.css` | Base themes (light + dark) |
| `brands-{brand}.css` | Brand themes (light + dark) |
| `size-{mode}.css` | Size/spacing primitives |
| `typography-{mode}.css` | Typography scale primitives |
| `shadow-{mode}.css` | Shadow primitives |
| `radius-{mode}.css` | Border radius primitives |
| `borderwidth-{mode}.css` | Border width primitives |
| `typography-utilities.css` | text-* utility classes |
| `shadow-variables.css` | --shadow-* CSS variables |
| `borderwidth-utilities.css` | border-default, border-thick utilities |
| `spacing.css` | Spacing semantic mappings |

## Semantic Token Categories

| Category | Token Pattern | Example |
|----------|---------------|---------|
| Layout | `background`, `foreground`, `container`, `popover`, `muted`, `accent` | `--color-background` |
| Brand | `primary.*`, `secondary.*` | `--color-primary-background` |
| Status | `error.*`, `success.*`, `warning.*`, `information.*` | `--color-error-text` |
| Borders | `border.default`, `border.primary`, `border.error` | `--color-border-default` |

Each semantic group has: `background`, `foreground`, `hover`, `active`, `disabled`, `text`, `surface`

## Adding Tokens

1. **Color primitives**: Add to `tokens/primitives/color.json`
2. **Size/typography/shadow/radius/borderwidth**: Add to respective `tokens/primitives/{category}/{category}-{mode}.json`
3. **Base tokens**: Add to both `tokens/semantic/base-{name}-light.json` and `base-{name}-dark.json`
4. **Brand tokens**: Add to both `tokens/semantic/brands-{name}-light.json` and `brands-{name}-dark.json`
5. **Typography/shadow styles**: Add to `tokens/styles/typography.json` or `shadows.json`
6. Run `yarn tokens` from root
7. Verify in generated CSS files

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-css.js` | Production CSS with selected theme |
| `generate-modular.js` | Modular CSS for all themes |
| `copy-to-react.js` | Copy globals.css to React package |
| `utils.js` | Shared utilities (token parsing, CSS var generation) |

Tests: `scripts/__tests__/utils.test.js` (31 unit tests)

## Important Notes

- **Never edit** `dist/` or `packages/react/src/generated/` files directly
- Primitives are theme-agnostic (same colors for light/dark)
- Semantic files have separate light/dark variants
- Dark mode overrides semantic vars, not primitive vars
