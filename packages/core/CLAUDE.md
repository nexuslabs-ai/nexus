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
│   └── color-mode-1.json      # All color scales (theme-agnostic)
├── semantic/
│   ├── base-slate-light.json  # Slate base - light mode
│   ├── base-slate-dark.json   # Slate base - dark mode
│   ├── base-neutral-*.json    # Neutral palette variants
│   ├── base-zinc-*.json       # Zinc palette variants
│   ├── base-gray-*.json       # Gray palette variants
│   ├── base-stone-*.json      # Stone palette variants
│   ├── brands-blue-*.json     # Blue brand variants
│   ├── brands-gray-*.json     # Gray brand variants
│   ├── brands-neutral-*.json  # Neutral brand variants
│   └── brands-slate-*.json    # Slate brand variants
└── component/                  # Component-specific tokens (future)
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
# Default theme
yarn tokens  # Uses --base=slate --brand=blue

# Custom theme
node scripts/generate-css.js --base=neutral --brand=gray
```

Available options:
- **Base**: slate, neutral, zinc, gray, stone
- **Brand**: blue, gray, neutral, slate

## Generated CSS Structure

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  /* Primitives - all color scales (theme-agnostic) */
  --blue-500: #3b82f6;
  --slate-50: #f8fafc;
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

@layer base { ... }
```

## Modular CSS (for Playground)

Generate separate CSS files for dynamic theme switching:

```bash
yarn build:tokens:modular
```

Output in `dist/modular/`:
- `primitives.css` - All color scales
- `base-{palette}.css` - Base themes (light + dark)
- `brands-{brand}.css` - Brand themes (light + dark)

## Semantic Token Categories

| Category | Token Pattern | Example |
|----------|---------------|---------|
| Layout | `background`, `foreground`, `container`, `popover`, `muted`, `accent` | `--color-background` |
| Brand | `primary.*`, `secondary.*` | `--color-primary-background` |
| Status | `error.*`, `success.*`, `warning.*`, `information.*` | `--color-error-text` |
| Borders | `border.default`, `border.primary`, `border.error` | `--color-border-default` |

Each semantic group has: `background`, `foreground`, `hover`, `active`, `disabled`, `text`, `surface`

## Adding Tokens

1. **Primitives**: Add to `tokens/primitives/color-mode-1.json`
2. **Base tokens**: Add to both `base-{name}-light.json` and `base-{name}-dark.json`
3. **Brand tokens**: Add to both `brands-{name}-light.json` and `brands-{name}-dark.json`
4. Run `yarn tokens` from root
5. Verify in generated CSS files

## Scripts

| Script | Purpose |
|--------|---------|
| `generate-css.js` | Production CSS with selected theme |
| `generate-modular.js` | Modular CSS for all themes |
| `copy-to-react.js` | Copy globals.css to React package |

## Important Notes

- **Never edit** `dist/` or `packages/react/src/generated/` files directly
- Primitives are theme-agnostic (same colors for light/dark)
- Semantic files have separate light/dark variants
- Dark mode overrides semantic vars, not primitive vars
