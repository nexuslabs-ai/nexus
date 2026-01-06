# Core Package (@nexus/core)

Private package containing design tokens in W3C DTCG format. Not published to npm.

## Quick Reference

```bash
yarn build:tailwind                         # Generate @nexus/tailwind package CSS
yarn build:tokens:modular                   # Generate modular CSS for playground
```

Output:
- `../tailwind/nexus.css` → Main Tailwind theme with `nx:` prefix
- `../tailwind/variables.css` → Primitive CSS variables with `--nx-*` prefix
- `dist/modular/` → Individual theme CSS files for playground

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
│   ├── brands-{brand}-*.json  # Brand variants (blue, gray, neutral, slate)
│   └── spacing.json           # Spacing semantic mappings
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

Reference syntax: `{colorName.shade}` → `var(--nx-color-colorName-shade)`

## Theme Selection

Themes are selected via CLI arguments for the tailwind generation script:

```bash
# Default theme (all options have defaults)
yarn tokens:tailwind  # Uses slate/blue/vega defaults

# Custom theme
node scripts/generate-tailwind-package.js --base=neutral --brand=gray --size=lyra
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

### @nexus/tailwind (nexus.css)

```css
@import "tailwindcss" prefix(nx);
@custom-variant dark (&:is(.dark *));

@import "./variables.css";

@theme {
  --*: initial;

  /* Semantic tokens - light mode (reference --nx-* primitives) */
  --color-background: var(--nx-color-slate-50);
  --color-primary-background: var(--nx-color-blue-500);
  --spacing-4: var(--nx-size-4);
}

.dark {
  /* Semantic tokens - dark mode (must use nx- prefix to match Tailwind output) */
  --nx-color-background: var(--nx-color-slate-950);
}

/* Typography utilities (Tailwind v4 @utility) */
@utility text-display-large {
  font-family: var(--nx-typography-family-font-sans);
  font-size: var(--nx-typography-size-6xl);
  font-weight: var(--nx-typography-weight-light);
  line-height: var(--nx-typography-leading-6xl);
}
```

### @nexus/tailwind (variables.css)

```css
:root {
  /* All primitives use --nx-* prefix */
  --nx-color-blue-500: #3b82f6;
  --nx-color-slate-50: #f8fafc;
  --nx-size-0: 0rem;
  --nx-size-4: 1rem;
  --nx-shadow-xs-layer-1-x: 0px;
  /* ... */
}
```

## Modular CSS (for Playground)

Generate separate CSS files for dynamic theme switching:

```bash
yarn build:tokens:modular
```

Output in `dist/modular/`:

| File Pattern | Content |
|--------------|---------|
| `color.css` | All color primitives (`--nx-color-*`) |
| `base-{palette}.css` | Base themes (light + dark, references `--nx-color-*`) |
| `brands-{brand}.css` | Brand themes (light + dark) |
| `size-{mode}.css` | Size/spacing primitives (`--nx-size-*`) |
| `typography-{mode}.css` | Typography scale primitives (`--nx-typography-*`) |
| `shadow-{mode}.css` | Shadow primitives (`--nx-shadow-*`) |
| `radius-{mode}.css` | Border radius primitives (`--nx-radius-*`) |
| `borderwidth-{mode}.css` | Border width primitives (`--nx-borderwidth-*`) |
| `typography-utilities.css` | text-* utility classes |
| `shadow-variables.css` | --nx-shadow-* composite CSS variables |
| `borderwidth-utilities.css` | border-default, border-thick utilities |
| `spacing.css` | Spacing semantic mappings (`--spacing-*` → `var(--nx-size-*)`) |

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
6. Run `yarn tokens:tailwind` from root
7. Verify in `packages/tailwind/` CSS files

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-tailwind-package.js` | Generate @nexus/tailwind package CSS |
| `generate-modular.js` | Modular CSS for all themes (playground) |
| `utils.js` | Shared utilities (token parsing, CSS var generation) |

Tests: `scripts/__tests__/utils.test.js` (31 unit tests)

## CSS Variable Naming

| Type | Pattern | Example |
|------|---------|---------|
| Primitive | `--nx-{category}-{path}` | `--nx-color-blue-500`, `--nx-size-4` |
| Semantic | `--{category}-{path}` | `--color-background`, `--spacing-4` |
| Tailwind utility | `nx:{utility}` | `nx:bg-primary`, `nx:p-4` |

## Important Notes

- **Never edit** `dist/` or `packages/tailwind/` CSS files directly
- Primitives are theme-agnostic (same colors for light/dark)
- Semantic files have separate light/dark variants
- Dark mode overrides semantic vars, not primitive vars
- All primitives use `--nx-*` prefix to avoid collisions
