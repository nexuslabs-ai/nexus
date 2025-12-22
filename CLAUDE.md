# Nexus Design System

A modern React component library with W3C-standard design tokens, built as a Yarn/Turbo monorepo.

## Project Structure

```
ds/
├── packages/
│   ├── core/           # Design tokens (W3C DTCG format)
│   └── react/          # React component library (@anthropic/react)
├── apps/
│   └── docs/           # Documentation site (planned)
└── Root configs        # Shared TS, ESLint, Prettier, Turbo
```

## Tech Stack

- **React** 18/19 with TypeScript 5.7
- **Vite** 6.0 for building
- **Tailwind CSS** 4.0 with Vite plugin
- **Turbo** 2.3 for monorepo orchestration
- **CVA** (class-variance-authority) for component variants
- **Radix UI Slot** for composition patterns

## Common Commands

```bash
# Root commands
yarn build            # Build all packages
yarn dev              # Dev mode (watch)
yarn lint             # Lint all packages
yarn format           # Format with Prettier
yarn tokens           # Generate design tokens
yarn typecheck        # TypeScript check
yarn clean            # Clean all builds

# From packages/react
yarn build            # vite build
yarn dev              # vite build --watch

# From packages/core
yarn build:tokens     # Generate CSS from tokens
```

## Component Patterns

### Standard Component Structure

Components use CVA for variants and `cn()` for class composition:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const componentVariants = cva('base-classes', {
  variants: {
    variant: { default: '...', secondary: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

function Component({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof componentVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="component"
      data-variant={variant}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Component, componentVariants };
```

### Key Conventions

- Use `data-slot` attribute for component identification
- Use `data-variant` and `data-size` for styling hooks
- Export both component and variants
- Support `asChild` prop via Radix Slot for polymorphism

## Design Tokens

### Architecture (W3C DTCG Format)

Tokens follow the W3C Design Tokens Community Group standard:

```
packages/core/tokens/
├── primitives/         # Base values (color scales, spacing)
│   ├── color-light.json
│   └── color-dark.json
└── semantic/           # Contextual tokens referencing primitives
    ├── base-slate.json
    ├── base-neutral.json
    ├── brands-blue.json
    └── brands-amber.json
```

### Token Format

```json
{
  "tokenName": {
    "$value": "#ffffff",
    "$type": "color",
    "$description": "Optional description"
  },
  "reference": {
    "$value": "{slate.50}",
    "$type": "color"
  }
}
```

### Token Pipeline

1. Edit JSON files in `packages/core/tokens/`
2. Run `yarn tokens` from root
3. Generates `packages/react/src/generated/globals.css`
4. CSS variables available as `--token-name` and via Tailwind

### Semantic Token Categories

- **Background**: `background`, `background-subtle`, `background-muted`
- **Foreground**: `foreground`, `foreground-muted`
- **Borders**: `border`, `border-subtle`
- **Interactive**: `ring`, `input`
- **States**: `accent`, `destructive`
- **Brand**: `primary`, `secondary`, `primary-foreground`

## File Organization

```
packages/react/src/
├── components/
│   └── ui/              # UI components (button.tsx, etc.)
├── lib/
│   └── utils.ts         # cn() utility
├── generated/
│   └── globals.css      # Auto-generated token CSS
├── index.css            # Main styles
└── index.ts             # Package exports
```

## Code Style

### Formatting (Prettier)

- Single quotes, semicolons
- 2-space indentation
- 80 char line width
- Trailing commas (es5)
- Tailwind class sorting enabled

### Naming

- **Components**: PascalCase (`Button`, `Card`)
- **Files**: kebab-case (`button.tsx`, `utils.ts`)
- **Tokens**: camelCase in JSON (`backgroundColor`)
- **CSS vars**: kebab-case (`--color-background`)
- **Data attrs**: lowercase (`data-slot`, `data-variant`)

### Imports

Sorted by: external → internal → relative
Use `@/` alias for src-relative imports

## Utilities

### cn() - Class Name Merger

```ts
import { cn } from '@/lib/utils';

// Combines clsx + tailwind-merge
cn('px-4 py-2', conditional && 'bg-primary', className);
```

### CVA - Variant Management

```ts
import { cva, type VariantProps } from 'class-variance-authority';

const variants = cva('base', {
  variants: { size: { sm: '...', lg: '...' } },
  defaultVariants: { size: 'sm' },
});

// Type-safe variant props
type Props = VariantProps<typeof variants>;
```

## Build Output

React package exports:
- `dist/index.mjs` (ESM)
- `dist/index.js` (CJS)
- `dist/index.d.ts` (types)
- `dist/style.css` (styles)

Import in consuming apps:
```ts
import { Button } from '@anthropic/react';
import '@anthropic/react/styles.css';
```

## Theme Support

- Light theme: `:root` CSS variables
- Dark theme: `.dark` class selector
- Tokens support both via semantic layer

## Notes

- No test framework configured yet
- Docs app is placeholder (not implemented)
- Node >= 18.0.0 required
