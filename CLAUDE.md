# Nexus Design System

A multi-framework design system built as a Yarn/Turbo monorepo, starting with React. Components follow shadcn/ui architecture and patterns.

## Workflow Instructions

When working on tasks:

1. **Plan first**: Create a clear todo list with steps before starting
2. **Summarize after each step**: Provide a concise summary of what was done after completing each todo/phase
3. **Wait for confirmation**: Pause after each summary for user review before moving to the next step
4. **Keep summaries brief**: Use tables or bullet points, not lengthy explanations
5. **Update context**: After completing a plan/task, ask if CLAUDE.md should be updated to reflect new patterns, components, or architectural decisions

## Project Structure

```
ds/
├── packages/
│   ├── core/           # Design tokens (private, not published)
│   │   ├── tokens/     # JSON token definitions
│   │   └── scripts/    # CSS generation scripts
│   ├── react/          # React component library (@nexus/react)
│   └── test-utils/     # Test utilities (@nexus/test-utils)
├── apps/
│   └── docs/           # Documentation site (planned)
└── Root configs        # Shared TS, ESLint, Prettier, Turbo
```

## Tech Stack

- **React** 18/19 with TypeScript 5.7
- **Vite** 6.0 for building (library mode)
- **Tailwind CSS** 4.0 with @theme directive (CSS-first, no tailwind.config.js)
- **Turbo** 2.3 for monorepo orchestration
- **CVA** (class-variance-authority) for component variants
- **Radix UI** primitives for accessibility (shadcn approach)
- **Vitest** for testing
- **Storybook** 10 for component documentation

## Common Commands

```bash
# Root commands
yarn build            # Build all packages
yarn dev              # Dev mode (watch)
yarn lint             # Lint all packages
yarn test             # Run all tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage report
yarn format           # Format with Prettier
yarn tokens           # Generate design tokens
yarn typecheck        # TypeScript check
yarn clean            # Clean all builds

# From packages/react
yarn build            # vite build
yarn dev              # vite build --watch
yarn storybook        # Start Storybook dev server (port 6006)
yarn build-storybook  # Build static Storybook

# From packages/core
yarn build:tokens     # Generate CSS from tokens
```

## Testing

### Testing Strategy

Three-layer testing approach with clear separation of concerns:

| Layer | Tool | Purpose | What It Covers |
|-------|------|---------|----------------|
| **Unit Tests** | Vitest + RTL | Behavior & Logic | Rendering, props, interactions, keyboard nav, a11y violations, edge cases |
| **Storybook** | Storybook 10 | Visual Docs | All visual states, prop combinations, usage examples, composition patterns |
| **Visual Regression** | Chromatic | Snapshot Diffs | Cross-browser rendering, responsive layouts, state variations |

**Key distinctions:**
- Unit tests → *"Does it work correctly?"*
- Storybook → *"What does it look like and how do I use it?"*
- Chromatic → *"Did the visuals change unexpectedly?"*

### Setup

Tests use Vitest + React Testing Library + vitest-axe. Configuration is in `vitest.config.ts`.

```ts
// Import from @nexus/test-utils (re-exports testing-library + custom render)
import { axe, render, screen, userEvent } from '@nexus/test-utils';
import { describe, expect, it, vi } from 'vitest';
```

### Test File Pattern

Place test files alongside components: `button.tsx` → `button.test.tsx`

### Test Categories

Organize tests into these describe blocks:

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

### Accessibility Testing

```tsx
it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Custom Render with Theme

```tsx
// Light mode (default)
render(<Button>Click</Button>);

// Dark mode
render(<Button>Click</Button>, { theme: 'dark' });
```

## Storybook

### Configuration

Storybook 10 with React Vite. Config in `packages/react/.storybook/`:

- `main.ts` - Framework config, addons, Tailwind CSS plugin
- `preview.tsx` - Global decorators, theme toggle, backgrounds

### Story File Pattern

Place stories alongside components: `button.tsx` → `Button.stories.tsx`

### Story Structure

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline'] },
    size: { control: 'select', options: ['default', 'sm', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Button' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  ),
};
```

### Required Stories per Component

- Default (primary use case)
- All variants
- All sizes
- Disabled state
- AllVariants grid (visual comparison)

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

Available in `@theme` block (use as Tailwind classes like `bg-primary`):

- **Layout**: `background`, `foreground`, `container`, `popover`, `muted`, `accent`
- **Brand**: `primary`, `primary-foreground`, `secondary`, `secondary-foreground`
- **Borders**: `border-default`, `border-primary`, `border-error`, `border-success`
- **Status**: `error`, `success`, `warning`, `informations` (with `-foreground` variants)

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
import { Button } from '@nexus/react';
import '@nexus/react/styles.css';
```

## Theme Support

- Light theme: `:root` CSS variables
- Dark theme: `.dark` class selector
- Tokens support both via semantic layer

## Architecture Philosophy

1. **JSON as Source of Truth**: All design tokens defined in JSON, transformed to CSS
2. **shadcn/ui Patterns**: Components follow shadcn architecture (copy/customize philosophy)
3. **Framework Agnostic Tokens**: Core package is private, enables future Vue/Svelte support

## Notes

- Node >= 18.0.0 required
- Docs app is placeholder (not implemented)
- Components reference shadcn's implementation for consistency
