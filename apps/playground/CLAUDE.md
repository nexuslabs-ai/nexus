# Playground App

Theme demonstration app for previewing design token combinations dynamically.

## Purpose

- Demo tool for showing clients theme variations
- Test different base palette + brand combinations
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
│       ├── primitives.css
│       ├── base-{palette}.css
│       └── brands-{brand}.css
└── src/
    ├── main.tsx          # React entry
    ├── App.tsx           # Main layout
    ├── App.css           # Tailwind import
    ├── hooks/
    │   └── useTheme.ts   # Theme state + CSS loading
    └── components/
        ├── ThemeSwitcher.tsx    # Dropdown controls
        └── ComponentShowcase.tsx # Component preview
```

## How It Works

1. **Primitives CSS** loads once on mount (all Tailwind colors)
2. **Base CSS** swaps when palette dropdown changes
3. **Brand CSS** swaps when brand dropdown changes
4. **Dark mode** toggles `.dark` class on `<html>`

```tsx
// useTheme hook manages dynamic CSS loading
useEffect(() => loadCSS(`/themes/base-${theme.base}.css`, 'base'), [theme.base]);
useEffect(() => loadCSS(`/themes/brands-${theme.brand}.css`, 'brand'), [theme.brand]);
```

## Available Themes

| Type | Options |
|------|---------|
| Base | slate, neutral, zinc, gray, stone |
| Brand | blue, gray, neutral, slate |
| Mode | light, dark |

## Setup

```bash
# From root
yarn tokens:modular     # Generate modular CSS
yarn playground:copy    # Copy to playground
yarn playground         # Start dev server
```

## Adding Components

Edit [ComponentShowcase.tsx](src/components/ComponentShowcase.tsx) to add more component previews using native HTML with semantic token classes:

```tsx
// Add to showcase - use semantic color tokens
<div className="rounded-lg bg-container p-4 border border-border-default">
  <button className="bg-primary-background text-primary-foreground px-4 py-2 rounded-md">
    New Button
  </button>
</div>
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
