# Playground App

Theme demonstration app for previewing design token combinations dynamically.

## Purpose

- Demo tool for showing clients theme variations
- Test different color, typography, spacing, and style combinations
- Preview light/dark mode switching in real-time

## Tech Stack

- **Vite** 7.x with React plugin
- **React** 19 with TypeScript
- **Tailwind CSS** 4.x
- Native HTML elements (no @nexus/react dependency)

## Commands

```bash
yarn dev              # Start dev server
yarn build            # Production build
yarn preview          # Preview production build
yarn copy:themes      # Copy modular CSS from core package
```

## Structure

```
apps/playground/
├── public/
│   └── themes/           # Modular CSS files (copied from core)
│       ├── primitives.css           # All color scales
│       ├── base-{palette}.css       # Base themes (5)
│       ├── brands-{brand}.css       # Brand themes (4)
│       ├── size-{mode}.css          # Size/spacing modes (5)
│       ├── typography-{mode}.css    # Typography modes (5)
│       ├── shadow-{mode}.css        # Shadow modes (5)
│       ├── radius-{mode}.css        # Border radius modes (5)
│       ├── borderwidth-{mode}.css   # Border width modes (5)
│       ├── typography-utilities.css # text-* utility classes
│       └── shadow-variables.css     # --shadow-* CSS variables
└── src/
    ├── main.tsx          # React entry
    ├── App.tsx           # Main layout
    ├── App.css           # Tailwind import
    ├── hooks/
    │   └── useTheme.ts   # Theme state + CSS loading
    └── components/
        ├── ThemeSwitcher.tsx    # Dropdown controls (2 rows: Colors + Tokens)
        └── ComponentShowcase.tsx # Component preview sections
```

## How It Works

1. **Static files** load once on mount: primitives, typography-utilities, shadow-variables
2. **Color themes** swap when base/brand dropdown changes
3. **Token modes** swap when size/typography/shadow/radius/border dropdowns change
4. **Dark mode** toggles `.dark` class on `<html>`

```tsx
// useTheme hook manages dynamic CSS loading
useEffect(() => loadCSS('/themes/primitives.css', 'primitives'), []);
useEffect(() => loadCSS('/themes/typography-utilities.css', 'typography-utilities'), []);
useEffect(() => loadCSS(`/themes/base-${theme.base}.css`, 'base'), [theme.base]);
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
yarn tokens:modular     # Generate modular CSS
yarn playground:copy    # Copy to playground
yarn playground         # Start dev server
```

## ComponentShowcase Sections

The showcase demonstrates all token categories:

| Section | Tokens Used |
|---------|-------------|
| Typography | `text-display-*`, `text-headling-*`, `text-body-*`, `text-label-*`, `text-code-*` |
| Shadows | `--shadow-2xs` to `--shadow-2xl`, `--shadow-inner`, `--shadow-focus-default` |
| Border Radius | `--sm`, `--md`, `--lg`, `--xl`, `--2xl`, `--3xl`, `--full` |
| Spacing | `--size-1` to `--size-16` |
| Buttons | Semantic colors + `var(--md)` for radius |
| Colors | `bg-primary-*`, `bg-secondary-*`, `bg-error-*`, etc. |
| Status | `bg-success-surface`, `text-success-text`, etc. |

## Adding Components

Edit [ComponentShowcase.tsx](src/components/ComponentShowcase.tsx) to add more component previews using native HTML with semantic token classes:

```tsx
// Use semantic color tokens
<button className="bg-primary-background text-primary-foreground px-4 py-2"
        style={{ borderRadius: 'var(--md)' }}>
  Button
</button>

// Use typography utilities
<p className="text-body-default">Body text</p>

// Use shadow variables
<div style={{ boxShadow: 'var(--shadow-lg)' }}>Card</div>
```

## Technical Notes

**Why `@theme` (not `@theme inline`) in App.css?**

| Directive | Generated CSS | Runtime Override |
|-----------|---------------|------------------|
| `@theme inline` | `.bg-background { background: #f8fafc; }` | Not possible |
| `@theme` | `.bg-background { background: var(--color-background); }` | Works |

The playground needs `@theme` so Tailwind generates CSS variable references that can be overridden when theme CSS files are loaded dynamically.

**Why `html` selector in modular CSS (not `:root`)?**

Modular CSS files use `html { }` instead of `:root { }` to ensure they override Tailwind's `@theme`-generated `:root` rules via cascade order (same specificity, but loaded later).

## Notes

- Theme files in `public/themes/` are gitignored
- Run `yarn playground:copy` after `yarn tokens:modular`
- Uses same semantic tokens as production builds
