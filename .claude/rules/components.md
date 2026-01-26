# Component Rules

> Architectural guidelines for Nexus React components.
> For token mappings from shadcn/ui, see [shadcn-divergences.md](shadcn-divergences.md).

## Core Principles

| Principle                 | Why                                                              |
| ------------------------- | ---------------------------------------------------------------- |
| **Semantic tokens only**  | Enables theming; primitives are implementation details           |
| **Padding-based sizing**  | Fixed heights break in flex layouts                              |
| **Data attributes**       | Enable CSS hooks for testing, styling, and state inspection      |
| **CVA for enum variants** | Clear variant-to-class mapping; boolean logic stays in component |
| **Named interfaces**      | Self-documenting; enables JSDoc; better IDE experience           |

## File Structure

Every component in `packages/react/src/components/ui/` needs 2 files:

```
{name}.tsx           # Component (kebab-case)
{Name}.stories.tsx   # Stories + Tests (PascalCase, play functions)
```

**No separate `*.test.tsx` files.** Tests are play functions in stories.

## Component Template

This is a minimal template showing required structure. Adapt variants and props to your component's needs.

```tsx
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const componentVariants = cva(
  // Base classes - nx: prefix BEFORE pseudo-classes
  'nx:inline-flex nx:items-center nx:transition-colors',
  {
    variants: {
      variant: {
        /* enum-style variants */
      },
      size: {
        /* padding-based sizing */
      },
    },
    defaultVariants: {
      variant: 'default',
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
      data-slot="component-name"
      data-variant={variant}
      data-size={size}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Component, type ComponentProps, componentVariants };
```

**Live examples:** See `button.tsx`, `badge.tsx` for full implementations.

## Data Attributes

| Attribute      | Purpose                  | Required?                   |
| -------------- | ------------------------ | --------------------------- |
| `data-slot`    | Component identification | Always                      |
| `data-variant` | Current variant value    | When component has variants |
| `data-size`    | Current size value       | When component has sizes    |

Additional `data-*` attributes are acceptable for component-specific state (e.g., `data-loading`, `data-fill`).

## Props Pattern

### Interface Definition

Define props as a named interface above the function. Extend from:

- `React.ComponentProps<'element'>` for native element props
- `VariantProps<typeof componentVariants>` for CVA-generated variant props

### JSDoc Requirements

All custom props (not inherited) must have JSDoc with:

- Description of what the prop does
- `@default` value if applicable
- `@example` for non-obvious usage

```tsx
interface ComponentProps extends React.ComponentProps<'button'> {
  /**
   * Brief description of what this does.
   * @default false
   */
  customProp?: boolean;
}
```

### Boolean Props

Handle boolean props with ternary operators in component code, not CVA:

```tsx
// In component body, not CVA variants
className={cn(
  componentVariants({ variant, size }),
  isCompact ? 'nx:p-2' : 'nx:p-4',
)}
```

**Why:** Keeps CVA focused on enum-style variants; makes boolean logic explicit.

## Class Naming

### nx: Prefix Rule

All Tailwind utilities must use `nx:` prefix. The prefix comes BEFORE all modifiers (pseudo-classes, arbitrary selectors, responsive prefixes):

| Pattern                                | Correct?            |
| -------------------------------------- | ------------------- |
| `nx:hover:bg-primary-background-hover` | Yes                 |
| `hover:nx:bg-primary-background-hover` | No                  |
| `nx:focus-visible:ring-2`              | Yes                 |
| `nx:[&>svg]:text-foreground`           | Yes                 |
| `[&>svg]:nx:text-foreground`           | No                  |
| `nx:[&_p]:leading-relaxed`             | Yes                 |
| `[&_p]:nx:leading-relaxed`             | No                  |
| `nx:md:flex`                           | Yes                 |
| `md:nx:flex`                           | No                  |
| `bg-primary-background`                | No (missing prefix) |

**Rule:** `nx:` always comes first, then any modifier (pseudo-class, arbitrary selector, responsive), then the utility.

### Semantic Token Paths

Use full semantic token paths, not incomplete or primitive values:

| Pattern                        | Correct? | Notes                           |
| ------------------------------ | -------- | ------------------------------- |
| `nx:bg-primary-background`     | Yes      | Full path                       |
| `nx:bg-primary`                | No       | Incomplete                      |
| `nx:bg-blue-500`               | No       | Primitive color                 |
| `nx:hover:bg-background-hover` | Yes      | Hover state token               |
| `nx:hover:bg-accent`           | No       | `accent` doesn't exist in Nexus |

**Reference:** See `packages/tailwind/nexus.css` for available tokens.

## Sizing Convention

Use padding for sizing, not fixed heights:

```tsx
// Padding-based (correct)
size: {
  default: 'nx:px-4 nx:py-2',
  sm: 'nx:px-3 nx:py-1.5',
  lg: 'nx:px-8 nx:py-3',
}

// Fixed heights (avoid)
size: {
  default: 'nx:h-10 nx:px-4',
}
```

**Exceptions:** Avatars, progress bars, modals may need fixed dimensions.

## Export Pattern

Always export component, props type, and variants function:

```tsx
export { Component, type ComponentProps, componentVariants };
```

## Import Order

ESLint auto-sorts, but the expected order is:

1. React
2. External packages (Radix, CVA)
3. Internal aliases (`@/lib/*`)
4. Relative imports

## Compound Variants

Use `compoundVariants` when styling depends on multiple prop combinations (e.g., `variant` + `fill`):

```tsx
compoundVariants: [
  { variant: 'default', fill: 'solid', className: '...' },
  { variant: 'default', fill: 'light', className: '...' },
],
```

**Live example:** See `badge.tsx` for a full compound variants implementation.

## asChild Pattern

The `asChild` prop enables composition via Radix Slot. Include for interactive components:

```tsx
// Renders as button
<Button>Click</Button>

// Renders as anchor with button styles
<Button asChild>
  <a href="/link">Link</a>
</Button>
```

## State Patterns

Components may implement additional state patterns like loading, disabled, or error states. When doing so:

- Combine states appropriately (e.g., `disabled || loading`)
- Include accessibility attributes (`aria-busy`, `aria-disabled`)
- Use `data-*` attributes for styling hooks

**Live example:** See `button.tsx` for loading state implementation.

## Adding to Exports

After creating a component, add to `src/index.ts`:

```tsx
export * from '@/components/ui/new-component';
```

## Checklist

Before submitting a component:

- [ ] `nx:` prefix on all utility classes
- [ ] Prefix before ALL modifiers (`nx:hover:`, `nx:[&>svg]:`, `nx:md:` — not `hover:nx:`, `[&>svg]:nx:`)
- [ ] Full semantic token paths (not incomplete like `nx:bg-primary`)
- [ ] `data-slot` attribute present
- [ ] Padding-based sizing (no fixed heights unless necessary)
- [ ] Named interface with JSDoc for custom props
- [ ] Exports include component, props type, and variants function
- [ ] `asChild` support for interactive components
