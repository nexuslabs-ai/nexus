# Playground App

Theme demonstration app for previewing design token combinations dynamically.

## Purpose

- Demo tool for showing clients theme variations
- Test different color, typography, spacing, and style combinations
- Preview light/dark mode switching in real-time

## Tech Stack

- **Vite** 7.x with React plugin
- **React** 19 with TypeScript
- **Tailwind CSS** 4.x with `nx:` prefix
- Native HTML elements (no @nexus/react dependency)

## Commands

```bash
yarn dev              # Start dev server
yarn build            # Production build
yarn preview          # Preview production build
```

Note: Theme CSS files are automatically copied by `yarn tokens:modular` from the root.

## Structure

```
apps/playground/
├── public/
│   └── themes/           # Runtime CSS files (copied from core)
│       ├── color.css                # Color primitives (--nx-color-*)
│       ├── base-{palette}.css       # Base themes (5)
│       ├── brands-{brand}.css       # Brand themes (4)
│       ├── size-{mode}.css          # Size/spacing modes (5)
│       ├── typography-{mode}.css    # Typography modes (5)
│       ├── shadow-{mode}.css        # Shadow modes (5)
│       ├── radius-{mode}.css        # Border radius modes (5)
│       ├── borderwidth-{mode}.css   # Border width modes (5)
│       ├── typography-utilities.css # text-* utility classes
│       ├── borderwidth-utilities.css # border-default/thick utilities
│       └── shadow-variables.css     # --nx-shadow-* CSS variables
└── src/
    ├── main.tsx          # React entry
    ├── App.tsx           # Main layout
    ├── App.css           # Imports styles/globals.css
    ├── styles/           # Build-time CSS (copied from core)
    │   ├── globals.css   # Tailwind entry with @theme block
    │   ├── color.css     # Color primitives
    │   ├── typography-utilities.css
    │   └── borderwidth-utilities.css
    ├── hooks/
    │   └── useTheme.ts   # Theme state + CSS loading
    └── components/
        ├── ThemeSwitcher.tsx    # Dropdown controls (2 rows: Colors + Tokens)
        └── ComponentShowcase.tsx # Component preview sections
```

## How It Works

1. **Build-time CSS** (`src/styles/`) is processed by Tailwind via Vite
   - `globals.css` imports Tailwind with `prefix(nx)` and `@theme` block
   - Generates `nx:` prefixed utility classes with `var()` references

2. **Runtime CSS** (`public/themes/`) is loaded dynamically by `useTheme` hook
   - Color themes swap when base/brand dropdown changes
   - Token modes swap when size/typography/shadow/radius/border dropdowns change

3. **Dark mode** toggles `.dark` class on `<html>`

```tsx
// useTheme hook manages dynamic CSS loading
useEffect(() => loadCSS(`/themes/base-${theme.base}.css`, 'base'), [theme.base]);
useEffect(() => loadCSS(`/themes/brands-${theme.brand}.css`, 'brand'), [theme.brand]);
useEffect(() => loadCSS(`/themes/size-${theme.size}.css`, 'size'), [theme.size]);
// ... etc for each dimension
```

## Available Theme Dimensions

### Color Themes

| Type | Options |
|------|---------|
| Base | slate, neutral, zinc, gray, stone |
| Brand | blue, gray, neutral, slate |
| Mode | light, dark |

### Design Token Modes

| Dimension | Options | Default |
|-----------|---------|---------|
| Size | vega, lyra, maia, mira, nova | vega |
| Typography | vega, lyra, maia, mira, nova | vega |
| Shadow | vega, lyra, maia, mira, nova | vega |
| Radius | blunt, sharp, subtle, smooth, mellow | subtle |
| Border Width | vega, lyra, maia, mira, nova | vega |

## Setup

```bash
# From root
yarn tokens:modular     # Generate modular CSS AND copy to playground
yarn playground         # Start dev server
```

## ComponentShowcase Sections

The showcase demonstrates all token categories:

| Section | Tokens Used |
|---------|-------------|
| Typography | `text-display-*`, `text-headling-*`, `text-body-*`, `text-label-*`, `text-code-*` |
| Shadows | `--shadow-2xs` to `--shadow-2xl`, `--shadow-inner`, `--shadow-focus-default` |
| Border Radius | `rounded-base`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` |
| Spacing | `--size-1` to `--size-16` |
| Buttons | Semantic colors + `var(--md)` for radius |
| Colors | `bg-primary-*`, `bg-secondary-*`, `bg-error-*`, etc. |
| Status | `bg-success-surface`, `text-success-text`, etc. |

## Adding Components

Edit [ComponentShowcase.tsx](src/components/ComponentShowcase.tsx) to add more component previews using native HTML with `nx:` prefixed classes:

```tsx
// Use semantic color tokens with nx: prefixed Tailwind utilities
<button className="nx:bg-primary-background nx:text-primary-foreground nx:rounded-md nx:px-4 nx:py-2">
  Button
</button>

// Use typography utilities
<p className="nx:text-body-default">Body text</p>

// Use shadow utilities
<div className="nx:shadow-lg nx:rounded-lg nx:p-4">Card</div>

// Use border width utilities
<div className="nx:border-default nx:border-border-default nx:rounded">Default border</div>
```

## Technical Notes

**Why two CSS locations?**

| Location | Purpose | Processed By |
|----------|---------|--------------|
| `src/styles/` | Build-time (Tailwind generates utilities) | Vite + Tailwind |
| `public/themes/` | Runtime (dynamic theme switching) | Browser (no processing) |

**Why `@theme` (not `@theme inline`) in globals.css?**

| Directive | Generated CSS | Runtime Override |
|-----------|---------------|------------------|
| `@theme inline` | `.nx\:bg-background { background: #f8fafc; }` | Not possible |
| `@theme` | `.nx\:bg-background { background: var(--nx-color-background); }` | Works |

The playground needs `@theme` so Tailwind generates CSS variable references that can be overridden when theme CSS files are loaded dynamically.

**Why `html` selector in theme CSS (not `:root`)?**

Theme CSS files use `html { }` instead of `:root { }` to ensure they override Tailwind's `@theme`-generated `:root` rules via cascade order (same specificity, but loaded later).

## Notes

- All CSS files are committed for standalone deployment
- Playground has no direct code dependency on core package
- CSS is copied via `yarn tokens:modular` from root (regenerate after token changes)
