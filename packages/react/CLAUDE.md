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
├── storybook/        # Storybook utilities (modes.ts)
├── lib/utils.ts      # cn() utility
├── index.css         # Main styles (imports @nexus/tailwind)
└── index.ts          # Package exports
```

## Component File Pattern

Each component has 2 files in `src/components/ui/`:

| File                 | Pattern              | Purpose                          |
| -------------------- | -------------------- | -------------------------------- |
| `{name}.tsx`         | `button.tsx`         | Component implementation         |
| `{Name}.stories.tsx` | `Button.stories.tsx` | Stories + Tests (play functions) |

**No separate `*.test.tsx` files for components.** Tests are play functions in stories.

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

| Convention               | Example                                      |
| ------------------------ | -------------------------------------------- |
| `data-slot` attribute    | `data-slot="button"`                         |
| `data-variant` attribute | `data-variant={variant}`                     |
| `data-size` attribute    | `data-size={size}`                           |
| `asChild` prop           | Enables Radix Slot for polymorphism          |
| Export variants function | `export { Button, buttonVariants }`          |
| Use `cn()` for classes   | `cn(variants({ variant, size, className }))` |

## Icons

Uses **Tabler Icons** (`@tabler/icons-react`) as the default icon library.

### Internal vs External Icons

| Type         | Description                                                    | Source                    |
| ------------ | -------------------------------------------------------------- | ------------------------- |
| **Internal** | Icons hardcoded by DS (loader, chevrons, check, close, alerts) | `@/lib/icons` barrel      |
| **External** | User-facing icons passed via props                             | Consumers import directly |

### Internal Icons Barrel

Components import internal icons from `src/lib/icons.ts`:

```tsx
import { IconLoader2 } from '@/lib/icons';
```

Available internal icons:

| Category   | Icons                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| Loading    | `IconLoader2`                                                               |
| Navigation | `IconChevronDown`, `IconChevronLeft`, `IconChevronRight`, `IconChevronUp`   |
| Actions    | `IconCheck`, `IconX`                                                        |
| Alerts     | `IconAlertCircle`, `IconAlertTriangle`, `IconCircleCheck`, `IconInfoCircle` |
| Common UI  | `IconSearch`, `IconEye`, `IconEyeOff`                                       |

### Using Icons in Components

```tsx
// Internal icon (from barrel)
import { IconLoader2 } from '@/lib/icons';

<IconLoader2 className="nx:animate-spin" aria-hidden="true" />;

// External icon (consumer provides)
interface ButtonProps {
  icon?: React.ReactNode;
}
```

### Stories with Icons

Import directly from `@tabler/icons-react` in stories:

```tsx
import { IconRocket, IconStar } from '@tabler/icons-react';

export const WithIcon: Story = {
  render: () => (
    <Button>
      <IconRocket />
      Launch
    </Button>
  ),
};
```

## Testing (Story-First)

Components are tested via Storybook play functions. Import from `storybook/test`:

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';

export const Interactive: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

Run tests:

```bash
yarn test:storybook        # Run component tests
yarn test:storybook:watch  # Watch mode
```

## Story Structure

Required stories per component:

| Story                      | Purpose           | Play Function? |
| -------------------------- | ----------------- | -------------- |
| `Default`                  | Primary use case  | No             |
| Variants (`Primary`, etc.) | Visual docs       | No             |
| Sizes (`Small`, `Large`)   | Visual docs       | No             |
| `Disabled`                 | Disabled behavior | Yes            |
| `ClickInteraction`         | Click handler     | Yes            |
| `KeyboardInteraction`      | A11y keyboard     | Yes            |
| `AllVariants`              | Visual grid       | No             |
| `AsLink` (if applicable)   | Composition       | Yes            |

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

| File              | Format | Purpose         |
| ----------------- | ------ | --------------- |
| `dist/index.mjs`  | ESM    | Modern bundlers |
| `dist/index.js`   | CJS    | Node/legacy     |
| `dist/index.d.ts` | Types  | TypeScript      |
| `dist/style.css`  | CSS    | Styles          |

Consumer usage:

```ts
import { Button } from '@nexus/react';
import '@nexus/react/styles.css';
```

## Storybook

- Config in `.storybook/` (main.ts, preview.tsx, vitest.setup.ts)
- Theme toggle in toolbar (light/dark)
- Accessibility tests automatic via `addon-a11y`
- Component tests via `@storybook/addon-vitest` (Playwright browser)
- Uses same Tailwind setup as library

## Chromatic Visual Testing

Chromatic captures visual snapshots in 4 modes by default (light/dark × desktop/mobile).

### Mode Configuration

Modes are defined in `src/storybook/modes.ts`:

| Mode                | Use Case                                    |
| ------------------- | ------------------------------------------- |
| `allModes`          | All 4 combinations (default)                |
| `themeOnlyModes`    | Light/dark desktop only (AllVariants grids) |
| `viewportOnlyModes` | Desktop/mobile light only                   |

### Story Parameters

```tsx
import { themeOnlyModes } from '@/storybook/modes';

export const MyStory: Story = {
  parameters: {
    chromatic: {
      disableSnapshot: true, // For interaction-only tests
      modes: themeOnlyModes, // For grid stories
    },
  },
};
```

Run visual tests:

```bash
yarn chromatic          # Local (doesn't fail on changes)
yarn chromatic:ci       # CI (fails if changes need review)
```
