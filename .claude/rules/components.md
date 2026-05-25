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

### Adaptive-by-Default Semantic Tokens

Semantic color tokens adapt to theme automatically. Do not write `dark:` modifiers on tokens that already have a semantic name — the underlying CSS variable is already overridden under the `.dark` selector at emit time, so the modifier is a no-op.

| Pattern                         | Correct? | Notes                                                   |
| ------------------------------- | -------- | ------------------------------------------------------- |
| `nx:bg-primary-background`      | Yes      | Semantic token — adapts across light/dark automatically |
| `nx:text-foreground`            | Yes      | Same — `foreground` already carries its dark-mode value |
| `nx:dark:bg-primary-background` | No       | `dark:` is a no-op; the token already adapts            |

**Rule of thumb:** any class referencing a token from [`tokens.md` § Semantic Token Categories](tokens.md#semantic-token-categories) (Layout, Brand, Status, Borders, Navigation, Data viz) adapts — don't add `dark:`. The `dark:` modifier is reserved for raw primitives, which should be rare in component code.

**Primitive edge case.** Raw primitive utilities (`nx:bg-blue-500 nx:dark:bg-blue-900`) _are_ non-adaptive, so `dark:` is the only mechanism for varying them by theme. But primitives in component code are themselves an anti-pattern (see § Semantic Token Paths above), so this case should almost never come up — if you find yourself reaching for one, prefer adding the missing semantic token instead.

See [`tokens.md` § Light/Dark Theme Tokens](tokens.md#lightdark-theme-tokens) for how the `.dark` selector emit makes this work.

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

### Active / press states on container & popover

When a component renders on `container` or `popover` and needs a visible press cue, do **not** rely on `*-active` fill changes — those tokens collapse to the rest shade in dark mode (and in light mode for popover) by design. The press cue lives at the component layer, applied to the `:active` / `[data-state="active"]` selector:

- `nx:active:shadow-inner` — `inset` shadow primitive, additive on top of the existing fill.
- `nx:active:border-border-active` — emphasised border, useful when the component already has a border.

See [`surfaces.md` Rule 6](surfaces.md#rules) and [`surfaces.md` § Known overlaps](surfaces.md#known-overlaps) for why these surfaces don't get a distinct active fill.

## Focus States

The canonical focus ring is an **outline** — not a box-shadow, and not Tailwind `ring-*`:

```
nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2
```

For error focus on invalid fields, swap the colour to `nx:focus-visible:outline-focus-error`.

The focus colour (`outline-focus-default` → `--color-focus-default`) is a neutral grey tuned to clear APCA Lc ≥ 45 on every surface it lands on — page, card, muted, primary, error (see [`tokens.md` § APCA contrast gate](tokens.md#apca-contrast-gate)). An outline is surface-invariant and, unlike a box-shadow ring, **survives Windows High Contrast Mode (`forced-colors: active`)**, where the OS forces it to a visible system colour.

### Outline does not stack with elevation

The focus ring lives on the CSS `outline` property, so it is independent of `box-shadow` and never competes with an elevation shadow. Elevated surfaces (Card `shadow-sm`, Dialog `shadow-lg`) keep their shadow while focusable children render their outline on top — the elevation/focus separation the box-shadow ring once required is no longer needed.

Do not use `nx:shadow-*` or `nx:ring-*` utilities for focus.

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
- [ ] No `dark:` modifiers on semantic tokens (they adapt automatically)
- [ ] `data-slot` attribute present
- [ ] Padding-based sizing (no fixed heights unless necessary)
- [ ] Named interface with JSDoc for custom props
- [ ] Exports include component, props type, and variants function
- [ ] `asChild` support for interactive components
- [ ] Focus uses the outline ring (`nx:focus-visible:outline-focus-default`), not `nx:ring-*` or `nx:shadow-*`
