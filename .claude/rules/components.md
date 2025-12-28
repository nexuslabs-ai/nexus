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
  // Base classes (always applied) - ALL classes use nx: prefix
  'nx:inline-flex nx:items-center nx:justify-center',
  {
    variants: {
      variant: {
        primary: 'nx:bg-primary nx:text-primary-foreground hover:nx:bg-primary/90',
        secondary: 'nx:bg-secondary nx:text-secondary-foreground hover:nx:bg-secondary/80',
        outline: 'nx:border nx:border-border-default nx:bg-background hover:nx:bg-accent',
      },
      size: {
        default: 'nx:h-9 nx:px-4 nx:py-2',
        sm: 'nx:h-8 nx:px-3 nx:text-xs',
        lg: 'nx:h-10 nx:px-6',
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

## Class Naming (nx: prefix)

All Tailwind utility classes MUST use the `nx:` prefix:

```tsx
// Good - uses nx: prefix
'nx:bg-primary nx:text-primary-foreground'
'hover:nx:bg-secondary/80'
'nx:border nx:border-border-default'

// Bad - missing nx: prefix
'bg-primary text-primary-foreground'
'hover:bg-secondary/80'
```

## Semantic Token Usage

Use semantic color tokens, not primitive colors:

```tsx
// Good
'nx:bg-primary nx:text-primary-foreground'
'nx:bg-secondary hover:nx:bg-secondary/80'
'nx:border-border-default'

// Bad
'nx:bg-blue-500 nx:text-white'
'nx:bg-neutral-100'
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

- Forget `nx:` prefix on utility classes
- Use raw Tailwind colors (use semantic tokens)
- Forget `data-slot` attribute
- Export without the variants function
- Skip `asChild` support for interactive components
- Use inline styles
