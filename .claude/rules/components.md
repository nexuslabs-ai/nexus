# Component Rules

## File Structure

Every component in `packages/react/src/components/ui/` needs 3 files:

```
{name}.tsx           # Component (kebab-case)
{name}.test.tsx      # Tests (kebab-case)
{Name}.stories.tsx   # Stories (PascalCase)
```

## Component Template

```tsx
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base classes (always applied)
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-border-default bg-background hover:bg-accent',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

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

## Required Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-slot` | Component identification | `data-slot="button"` |
| `data-variant` | Variant for styling hooks | `data-variant={variant}` |
| `data-size` | Size for styling hooks | `data-size={size}` |

## Props Pattern

```tsx
type ComponentProps = React.ComponentProps<'element'> &  // Native props
  VariantProps<typeof componentVariants> &               // Variant props
  {
    asChild?: boolean;                                   // Polymorphism
  };
```

## Export Pattern

Always export both the component and its variants function:

```tsx
export { Component, componentVariants };
```

## Import Order

Follow ESLint auto-sort order:

```tsx
// 1. React
import * as React from 'react';

// 2. External packages
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

// 3. Internal aliases
import { cn } from '@/lib/utils';

// 4. Relative imports (if any)
```

## Semantic Token Usage

Use semantic color tokens, not primitive colors:

```tsx
// Good
'bg-primary text-primary-foreground'
'bg-secondary hover:bg-secondary/80'
'border-border-default'

// Bad
'bg-blue-500 text-white'
'bg-neutral-100'
```

## asChild Pattern

The `asChild` prop enables component composition via Radix Slot:

```tsx
// Renders as button
<Button>Click</Button>

// Renders as anchor with button styles
<Button asChild>
  <a href="/link">Link</a>
</Button>
```

## Adding to Exports

After creating a component, add to `src/index.ts`:

```tsx
export * from '@/components/ui/new-component';
```

## Do Not

- Use raw Tailwind colors (use semantic tokens)
- Forget `data-slot` attribute
- Export without the variants function
- Skip `asChild` support for interactive components
- Use inline styles
