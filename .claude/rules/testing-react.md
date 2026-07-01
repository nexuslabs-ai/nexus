# Testing Rules - React Package

> This file contains testing patterns for `@nexus_ds/react` package.
> For core testing philosophy, see: [testing.md](testing.md)

## Core Principle

**Stories are tests.** Every component story serves as:

1. Living documentation in Storybook
2. Interaction tests via play functions
3. Accessibility tests via addon-a11y

## Testing Split

| What       | Where           | Imports From           |
| ---------- | --------------- | ---------------------- |
| Components | `*.stories.tsx` | `storybook/test`       |
| Hooks      | `*.test.ts`     | `@nexus_ds/test-utils` |
| Utilities  | `*.test.ts`     | `@nexus_ds/test-utils` |

## File Structure

### Components (Story-First)

```
component-name/              # kebab-case folder
├── component-name.tsx        # Implementation (kebab-case)
├── ComponentName.stories.tsx # Stories = Tests (PascalCase)
└── index.ts                  # Barrel: export * from './component-name'
```

**No separate `*.test.tsx` files for components.** Tests live in stories.

### Hooks & Utilities (Unit Tests)

```
hooks/
├── use-hook-name.ts
└── use-hook-name.test.ts    # Unit test

lib/
├── utils.ts
└── utils.test.ts            # Unit test
```

## Story Template with Play Functions

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Component } from './component';

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  args: {
    onClick: fn(), // Spy for callbacks
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

// Visual story (no play function needed)
export const Default: Story = {
  args: { children: 'Default' },
};

// Interaction test (with play function)
export const Interactive: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole('button');

    await userEvent.click(element);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

## Required Stories Per Component

| Story Type              | Purpose                   | Play Function? |
| ----------------------- | ------------------------- | -------------- |
| Default                 | Default state             | Optional       |
| Each variant            | Visual documentation      | No             |
| Each size               | Visual documentation      | No             |
| Disabled                | Disabled state behavior   | Yes            |
| ClickInteraction        | Click handler works       | Yes            |
| KeyboardInteraction     | A11y keyboard support     | Yes            |
| WithDataAttributes      | Verify data-\* attrs      | Yes            |
| asChild (if applicable) | Composition works         | Yes            |
| Edge cases              | Empty, long content, etc. | Yes            |
| AllVariants ★           | Visual grid reference     | No             |

★ The canonical showcase name is `AllVariants`; per-component exceptions (e.g. Avatar uses `AllSizes`) are noted in the component's stories.

### Archetype Equivalence Policy

The matrix above is canonical by story **purpose**. For a subset of components, equivalent story names are accepted when the literal name would duplicate behavior.

| Archetype           | Components   | Requirement          | Accepted Story Names                                    |
| ------------------- | ------------ | -------------------- | ------------------------------------------------------- |
| Trigger-and-overlay | Dialog       | Click interaction    | `ClickInteraction`, `OpenCloseInteraction`              |
| Trigger-and-overlay | DropdownMenu | Click interaction    | `ClickInteraction`, `OpenCloseInteraction`              |
| Trigger-and-overlay | DropdownMenu | Disabled behavior    | `Disabled`, `WithDisabledItems`                         |
| Trigger-and-overlay | Select       | Click interaction    | `ClickInteraction`, `OpenCloseInteraction`              |
| Trigger-and-overlay | Select       | Disabled behavior    | `Disabled`, `DisabledInteraction`                       |
| Text input          | Input        | Click interaction    | `ClickInteraction`, `FocusBlurInteraction`              |
| Text input          | Input        | Keyboard interaction | `KeyboardInteraction`, `TypeInteraction`                |
| Accordion toggle    | Accordion    | Click interaction    | `ClickInteraction`, `ExpandInteraction`                 |
| Tab selection       | Tabs         | Disabled behavior    | `Disabled`, `WithDisabledTab`, `DisabledTabInteraction` |
| Axis toggle         | Show, Hide   | Showcase story       | `AllAxes`                                               |

Dialog has no `Disabled` requirement — a modal frame has no internal items to
disable. DropdownMenu and Select do (their items can be individually disabled),
so each gets a Disabled row with the equivalent name that matches its idiom.

Rules:

1. If one accepted name for that requirement exists, coverage passes.
2. Drift is only reported when no accepted equivalent exists and a true drift alias is found.
3. Use canonical names for new components unless a documented archetype equivalence applies.
4. When a component omits a canonical interaction requirement (e.g. Dialog omits `Disabled`), the audit emits an informational entry per omitted name so the archetype decision is visible in audit output, not silent.

## Play Function Patterns

### Click Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await userEvent.click(button);
  await expect(args.onClick).toHaveBeenCalledTimes(1);
};
```

### Keyboard Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const element = canvas.getByRole('button');

  await userEvent.tab();
  await expect(element).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  await expect(args.onClick).toHaveBeenCalledTimes(1);
};
```

### Disabled State Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onClick).not.toHaveBeenCalled();
};
```

### Data Attributes Testing

```tsx
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toHaveAttribute('data-slot', 'button');
  await expect(button).toHaveAttribute('data-variant', 'secondary');
};
```

### A11y Attribute Testing

```tsx
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toHaveAccessibleName('Close dialog');
};
```

## Hook Tests (Using @nexus_ds/test-utils)

```tsx
// use-counter.test.ts
import { act, describe, expect, it, renderHook } from '@nexus_ds/test-utils';

import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## Utility Tests

```tsx
// format-currency.test.ts
import { describe, expect, it } from '@nexus_ds/test-utils';

import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

## Imports Reference

### For Stories (Component Tests)

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';
```

**Note:** In Storybook 10, use `storybook/test` (not `@storybook/test`).

### For Unit Tests (Hooks/Utilities)

```tsx
import {
  act,
  describe,
  expect,
  it,
  renderHook,
  vi,
  waitFor,
} from '@nexus_ds/test-utils';
```

## Accessibility Testing

A11y is automatic. Every story is checked against axe-core rules via `addon-a11y` and violations fail the test — keyboard nav, ARIA semantics, focus management, role/landmark structure. No separate a11y assertions needed.

**Color contrast is APCA-gated, not axe-gated.** Axe-core's `color-contrast` rules are disabled in `preview.tsx` because they enforce WCAG 2.x ratios that don't match Nexus's APCA tier model. Contrast is verified at the token layer by `pnpm --filter @nexus_ds/core audit:contrast`.

## Running Tests

```bash
# Run all tests (unit + storybook)
pnpm test

# Run only storybook tests (components)
pnpm test:storybook

# Run only unit tests (hooks, utilities)
pnpm test:unit

# Watch mode for storybook
pnpm test:storybook:watch

# Interactive UI
pnpm test:storybook:ui
```

## Common Mistakes

| Don't                                           | Do                                     |
| ----------------------------------------------- | -------------------------------------- |
| Create `component.test.tsx`                     | Add play functions to stories          |
| Import from `@testing-library/react` in stories | Use `storybook/test`                   |
| Import `render` from `@nexus_ds/test-utils`     | Use stories for components             |
| Add manual `axe()` assertions                   | Let addon-a11y handle it               |
| Skip keyboard interaction tests                 | Every interactive component needs them |
| Use `@nexus_ds/test-utils` for components       | Use `storybook/test` in stories        |
| Import from `@storybook/test`                   | Use `storybook/test` (Storybook 10)    |

## Do Not

- Create separate `*.test.tsx` files for components
- Use `@testing-library/react` directly in stories
- Skip keyboard accessibility tests
- Commit `skip` or `only` in story files
- Add retries for flaky component tests
