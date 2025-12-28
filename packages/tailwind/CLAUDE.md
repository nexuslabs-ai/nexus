# @nexus/tailwind

Tailwind CSS theme package for Nexus Design System with `nx:` prefixed utilities.

## Purpose

This package provides CSS files that configure Tailwind v4 with:
- `nx:` prefix for all utility classes (prevents collisions with consumer's Tailwind)
- `--nx-*` prefixed CSS variables for primitive tokens
- Semantic token mappings via `@theme inline`
- Typography, shadow, and border utilities

## Files

| File | Description |
|------|-------------|
| `nexus.css` | Main entry: `@import "tailwindcss" prefix(nx)`, @theme, utilities |
| `variables.css` | Primitive CSS variables with `--nx-*` prefix |

## Generation

Files are auto-generated from `@nexus/core` tokens:

```bash
# From monorepo root
yarn tokens:tailwind

# Or from packages/core
yarn build:tailwind
```

## Usage

### In React Package

```css
/* packages/react/src/index.css */
@import '@nexus/tailwind';
```

### In Consumer Apps (shadcn-style)

Files are copied to consumer's codebase:

```
user-app/
└── src/design-system/
    ├── nexus.css
    └── variables.css
```

```css
/* user-app/src/styles/app.css */
@import '../design-system/nexus.css';
```

## CSS Variable Naming

| Type | Pattern | Example |
|------|---------|---------|
| Primitive | `--nx-{category}-{name}` | `--nx-color-blue-500`, `--nx-size-4` |
| Semantic | `--{semantic-name}` | `--color-primary-background` |

Semantic tokens reference primitives via `var(--nx-*)`.

## Utility Classes

All Tailwind utilities are prefixed with `nx:`:

```tsx
// Nexus component
<Button className="nx:bg-primary nx:text-primary-foreground nx:p-4">
  Click me
</Button>

// Works alongside consumer's unprefixed Tailwind
<div className="bg-blue-500 p-4">Legacy</div>
```

## Theme Customization

Consumers can customize by editing local copies:

### Change Primary Color

Edit `variables.css`:
```css
:root {
  --nx-color-blue-600: #8b5cf6;  /* Override with purple */
}
```

Or edit `nexus.css` semantic mapping:
```css
@theme inline {
  --color-primary-background: var(--nx-color-purple-600);
}
```

### Add New Color

Edit `variables.css`:
```css
:root {
  --nx-color-brand-500: #ff6b00;
  --nx-color-brand-600: #ea580c;
}
```

Edit `nexus.css`:
```css
@theme inline {
  --color-brand-background: var(--nx-color-brand-500);
}
```

## Do Not

- Edit these files directly (they're auto-generated)
- Remove the `prefix(nx)` from the Tailwind import
- Use unprefixed variables in components (use semantic tokens)

## Architecture

```
@nexus/core (private)
  └─→ generate-tailwind-package.js
        └─→ @nexus/tailwind (public)
              ├── nexus.css
              └── variables.css
                    └─→ @nexus/react (uses nx: classes)
```
