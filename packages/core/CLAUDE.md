# Core Package (@nexus/core)

Private package containing design tokens in W3C DTCG format. Not published to npm.

## Quick Reference

```bash
yarn build:tokens    # Generate CSS from tokens
```

Output: `dist/globals.css` → auto-copied to `packages/react/src/generated/globals.css`

## Token Structure

```
tokens/
├── primitives/           # Raw color scales (light/dark variants)
│   ├── color-light.json  # Light mode primitives (:root)
│   └── color-dark.json   # Dark mode primitives (.dark)
├── semantic/             # Contextual tokens referencing primitives
│   ├── base-slate.json   # Layout colors (background, foreground, borders)
│   ├── base-neutral.json # Alternative neutral palette
│   ├── brands-blue.json  # Brand colors (primary, secondary, accent)
│   └── brands-amber.json # Alternative brand palette
└── component/            # Component-specific tokens (future)
```

## Token Format (W3C DTCG)

**Primitive token** (direct value):
```json
{
  "blue": {
    "500": {
      "$value": "#3b82f6",
      "$type": "color"
    }
  }
}
```

**Semantic token** (reference):
```json
{
  "primary": {
    "$value": "{blue.500}",
    "$type": "color"
  }
}
```

Reference syntax: `{colorName.shade}` resolves to `var(--colorName-shade)`

## Theme Configuration

The active theme is defined in `scripts/generate-css.js`:

```js
const DEFAULT_THEME = {
  base: 'base-slate.json',    // Layout tokens
  brand: 'brands-blue.json',  // Brand tokens
};
```

To switch themes, change these file references.

## Generated CSS Structure

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --blue-500: #3b82f6;        /* Light primitives */
}

.dark {
  --blue-500: #60a5fa;        /* Dark primitives */
}

@theme inline {
  --color-primary: var(--blue-500);  /* Semantic tokens */
}

@layer base { ... }           /* Default body styles */
```

## Adding Tokens

1. **Primitive colors**: Add to `tokens/primitives/color-light.json` and `color-dark.json`
2. **Semantic tokens**: Add to appropriate file in `tokens/semantic/`
3. Run `yarn tokens` from root
4. Verify in `packages/react/src/generated/globals.css`

## Semantic Token Categories

| Category | Tokens | Used For |
|----------|--------|----------|
| Layout | `background`, `foreground`, `container`, `popover`, `muted`, `accent` | Page structure |
| Brand | `primary`, `secondary`, `accent` (with `-foreground` variants) | Interactive elements |
| Borders | `border-default`, `border-primary`, `border-error`, `border-success` | Border colors |
| Status | `error`, `success`, `warning`, `informations` (with `-foreground`) | Feedback states |

## Important Notes

- **Never edit** `dist/` or `packages/react/src/generated/` files directly
- Primitives use direct hex values; semantics use `{references}`
- Light/dark variants are in separate primitive files, not semantic files
- The `component/` directory is reserved for future component-specific tokens
