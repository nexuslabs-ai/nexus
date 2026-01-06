# React Package (@nexus/react)

React component library built with Radix UI primitives and Tailwind CSS. Follows shadcn/ui architecture.

## Quick Reference

```bash
yarn build            # Build library (dist/)
yarn dev              # Watch mode
yarn storybook        # Start Storybook on port 6006
yarn lint             # Lint src/
yarn typecheck        # TypeScript check
```

## Directory Structure

```
src/
├── components/ui/    # UI components (button.tsx, etc.)
├── lib/utils.ts      # cn() utility
├── index.css         # Main styles (imports @nexus/tailwind)
└── index.ts          # Package exports
```

## Component File Pattern

Each component has 3 files in `src/components/ui/`:

| File | Pattern | Purpose |
|------|---------|---------|
| `{name}.tsx` | `button.tsx` | Component implementation |
| `{name}.test.tsx` | `button.test.tsx` | Unit tests |
| `{Name}.stories.tsx` | `Button.stories.tsx` | Storybook stories |

## Component Structure

```tsx
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const componentVariants = cva('base-classes', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { default: '...', sm: '...', lg: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'default' },
});

function Component({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'element'> &
  VariantProps<typeof componentVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'element';
  return (
    <Comp
      data-slot="component"
      data-variant={variant}
      data-size={size}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Component, componentVariants };
```

## Key Conventions

| Convention | Example |
|------------|---------|
| `data-slot` attribute | `data-slot="button"` |
| `data-variant` attribute | `data-variant={variant}` |
| `data-size` attribute | `data-size={size}` |
| `asChild` prop | Enables Radix Slot for polymorphism |
| Export variants function | `export { Button, buttonVariants }` |
| Use `cn()` for classes | `cn(variants({ variant, size, className }))` |

## Test Structure

Tests use 6 describe blocks:

```tsx
describe('Component', () => {
  describe('Rendering', () => { /* renders, children, element type */ });
  describe('Props', () => { /* className, native props, data attrs, asChild */ });
  describe('Variants', () => { /* all variant/size combinations */ });
  describe('Interactions', () => { /* click, focus, keyboard */ });
  describe('Accessibility', () => { /* axe audit, aria attrs */ });
  describe('Edge Cases', () => { /* empty, long content, special chars */ });
});
```

## Story Structure

Required stories per component:

- `Default` - Primary use case with args
- Individual variants (`Primary`, `Secondary`, `Outline`)
- Individual sizes (`Small`, `Large`)
- `Disabled` - Disabled state
- `AllVariants` - Grid showing all combinations
- Usage examples (`WithIcon`, `AsLink`)

## Exports

Add new components to `src/index.ts`:

```ts
// Components
export * from '@/components/ui/button';
export * from '@/components/ui/new-component';
```

## Import Alias

Use `@/` for src-relative imports (configured in tsconfig.json and vite.config.ts):

```ts
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

## Build Output

| File | Format | Purpose |
|------|--------|---------|
| `dist/index.mjs` | ESM | Modern bundlers |
| `dist/index.js` | CJS | Node/legacy |
| `dist/index.d.ts` | Types | TypeScript |
| `dist/style.css` | CSS | Styles |

Consumer usage:
```ts
import { Button } from '@nexus/react';
import '@nexus/react/styles.css';
```

## Storybook

- Config in `.storybook/` (main.ts, preview.tsx)
- Theme toggle in toolbar (light/dark)
- Accessibility addon enabled
- Uses same Tailwind setup as library
