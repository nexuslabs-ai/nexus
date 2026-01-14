# Component Rules

> **Workflow:** Follow the CRITICAL WORKFLOW defined in root `CLAUDE.md`.

## File Structure

Every component in `packages/react/src/components/ui/` needs 2 files:

```
{name}.tsx           # Component (kebab-case)
{Name}.stories.tsx   # Stories + Tests (PascalCase, play functions)
```

**No separate `*.test.tsx` files.** Tests are play functions in stories.

## Component Template

```tsx
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base classes (always applied) - nx: prefix BEFORE pseudo-classes
  'nx:inline-flex nx:items-center nx:justify-center nx:transition-colors nx:focus-visible:outline-none nx:focus-visible:ring-2 nx:disabled:pointer-events-none nx:disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-hover',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-hover',
        outline:
          'nx:border nx:border-border-default nx:bg-background nx:hover:bg-accent',
      },
      size: {
        // Use padding for sizing (flex-friendly), avoid fixed heights
        default: 'nx:px-4 nx:py-2',
        sm: 'nx:px-3 nx:py-1.5 nx:text-xs',
        lg: 'nx:px-8 nx:py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

interface ComponentProps
  extends
    React.ComponentProps<'element'>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

function Component({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps) {
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

export { Component, type ComponentProps, componentVariants };
```

## Required Attributes

| Attribute      | Purpose                   | Example                  |
| -------------- | ------------------------- | ------------------------ |
| `data-slot`    | Component identification  | `data-slot="button"`     |
| `data-variant` | Variant for styling hooks | `data-variant={variant}` |
| `data-size`    | Size for styling hooks    | `data-size={size}`       |

## Props Pattern

Define props as a named interface above the function (not inline). Add JSDoc comments for custom props to document behavior, defaults, and usage examples:

````tsx
interface ComponentProps
  extends
    React.ComponentProps<'element'>, // Native element props
    VariantProps<typeof componentVariants> {
  // Variant props from cva
  /**
   * When true, renders as child element using Radix Slot.
   * Useful for composition with links or custom elements.
   * @default false
   * @example
   * ```tsx
   * <Button asChild>
   *   <a href="/page">Link as button</a>
   * </Button>
   * ```
   */
  asChild?: boolean;
}
````

### JSDoc Requirements

All custom props (not inherited from HTML elements or VariantProps) MUST have JSDoc with:

- Description of what the prop does
- `@default` value if applicable
- `@example` for non-obvious usage

### Boolean Props in CVA

**Do NOT use `true`/`false` values in CVA variants.** Handle boolean props with ternary operators in component code instead:

```tsx
// ❌ Bad - boolean variant in CVA
const variants = cva('...', {
  variants: {
    isCompact: {
      true: 'nx:p-2',
      false: 'nx:p-4',
    },
  },
});

// ✅ Good - boolean handled in component with ternary
function Component({ isCompact = false, ... }) {
  return (
    <div className={cn(
      variants({ variant, size }),
      isCompact ? 'nx:p-2' : 'nx:p-4',
    )} />
  );
}
```

**Why:**

- CVA `true`/`false` variants are less readable
- Ternary operators make the boolean logic explicit
- Keeps CVA focused on enum-style variants (variant, size, fill)
- Boolean props should be defined explicitly in the interface with JSDoc

## Export Pattern

Always export the component, props type, and variants function (sorted):

```tsx
export { Component, type ComponentProps, componentVariants };
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

All Tailwind utility classes MUST use the `nx:` prefix. The prefix comes BEFORE pseudo-classes and modifiers:

```tsx
// Good - nx: prefix BEFORE pseudo-classes
'nx:bg-primary-background nx:text-primary-foreground';
'nx:hover:bg-secondary-hover';
'nx:focus-visible:ring-2';
'nx:disabled:opacity-50';
'nx:[&_svg]:size-4';

// Bad - pseudo-class before nx: prefix (won't work correctly)
'hover:nx:bg-secondary-hover';
'focus-visible:nx:ring-2';
'disabled:nx:opacity-50';
'[&_svg]:nx:size-4';

// Bad - missing nx: prefix entirely
'bg-primary text-primary-foreground';
'hover:bg-secondary/80';
```

## Semantic Token Usage

Use semantic color tokens with full path, not primitives:

```tsx
// Good - full semantic token path
'nx:bg-primary-background nx:text-primary-foreground';
'nx:bg-secondary-background nx:hover:bg-secondary-hover';
'nx:border-border-default';
'nx:bg-error-background nx:text-error-foreground';

// Bad - primitive colors
'nx:bg-blue-500 nx:text-white';
'nx:bg-neutral-100';

// Bad - incomplete token path
'nx:bg-primary'; // use nx:bg-primary-background
'nx:bg-error'; // use nx:bg-error-background
```

## Sizing Convention

Use padding for component sizing instead of fixed heights/widths. This ensures components work well in flex layouts:

```tsx
// Good - padding-based sizing (flex-friendly)
size: {
  default: 'nx:px-4 nx:py-2',
  sm: 'nx:px-3 nx:py-1.5 nx:text-xs',
  lg: 'nx:px-8 nx:py-3',
  icon: 'nx:p-2.5',
}

// Bad - fixed heights (breaks in flex layouts)
size: {
  default: 'nx:h-10 nx:px-4 nx:py-2',
  sm: 'nx:h-9 nx:px-3',
  lg: 'nx:h-11 nx:px-8',
}
```

**Exceptions** (where fixed dimensions are acceptable):

- Modal/dialog width (`nx:max-w-lg`)
- Toast max-width
- Avatar/icon containers that need exact dimensions
- Progress bar heights

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
- Put pseudo-classes before `nx:` prefix (`hover:nx:` is wrong, use `nx:hover:`)
- Use raw Tailwind colors (use semantic tokens with full path)
- Use fixed heights/widths for sizing (use padding instead)
- Forget `data-slot` attribute
- Export without the variants function or props type
- Define props inline in function signature (use named interface)
- Skip `asChild` support for interactive components
- Use inline styles
- Use incomplete token paths (`nx:bg-primary` instead of `nx:bg-primary-background`)
- Use `true`/`false` values in CVA variants (use ternary in component code)
