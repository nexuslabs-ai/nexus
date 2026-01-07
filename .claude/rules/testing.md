# Testing Rules

> **Workflow:** Follow the CRITICAL WORKFLOW defined in root `CLAUDE.md`.

## Core Principle

**Stories are tests.** Every component story serves as:
1. Living documentation in Storybook
2. Interaction tests via play functions
3. Accessibility tests via addon-a11y

## Testing Split

| What | Where | Imports From |
|------|-------|--------------|
| Components | `*.stories.tsx` | `storybook/test` |
| Hooks | `*.test.ts` | `@nexus/test-utils` |
| Utilities | `*.test.ts` | `@nexus/test-utils` |

## File Structure

### Components (Story-First)

```
ComponentName/
├── component-name.tsx        # Implementation
├── ComponentName.stories.tsx # Stories = Tests
└── index.ts                  # Exports
```

No separate `*.test.tsx` files for components.

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

| Story Type | Purpose | Play Function? |
|------------|---------|----------------|
| Default | Default state | Optional |
| Each variant | Visual documentation | No |
| Each size | Visual documentation | No |
| Disabled | Disabled state behavior | Yes |
| ClickInteraction | Click handler works | Yes |
| KeyboardInteraction | A11y keyboard support | Yes |
| WithDataAttributes | Verify data-* attrs | Yes |
| asChild (if applicable) | Composition works | Yes |
| Edge cases | Empty, long content, etc. | Yes |
| AllVariants | Visual grid reference | No |

## Play Function Patterns

### Click Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await userEvent.click(button);
  await expect(args.onClick).toHaveBeenCalledTimes(1);
}
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
}
```

### Disabled State Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onClick).not.toHaveBeenCalled();
}
```

### Data Attributes Testing

```tsx
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toHaveAttribute('data-slot', 'button');
  await expect(button).toHaveAttribute('data-variant', 'secondary');
}
```

## Hook Tests (Using @nexus/test-utils)

```tsx
// use-counter.test.ts
import { act, describe, expect, it, renderHook } from '@nexus/test-utils';

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
import { describe, expect, it } from '@nexus/test-utils';

import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

## Running Tests

```bash
# Run all tests (unit + storybook)
yarn test

# Run only storybook tests (components)
yarn test:storybook

# Run only unit tests (hooks, utilities)
yarn test:unit

# Watch mode for storybook
yarn test:storybook:watch

# Interactive UI
yarn test:storybook:ui
```

## Accessibility

A11y is automatic. Every story is checked against axe-core rules via `addon-a11y`. Violations fail the test. No separate a11y assertions needed.

To test specific a11y attributes:

```tsx
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toHaveAccessibleName('Close dialog');
}
```

## Imports Reference

### For Stories (Component Tests)

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';
```

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
} from '@nexus/test-utils';
```

## Common Mistakes

| Don't | Do |
|-------|-----|
| Create `component.test.tsx` | Add play functions to stories |
| Import from `@testing-library/react` in stories | Use `storybook/test` |
| Import `render` from `@nexus/test-utils` | Use stories for components |
| Add manual `axe()` assertions | Let addon-a11y handle it |
| Skip keyboard interaction tests | Every interactive component needs them |
| Use `@nexus/test-utils` for components | Use `storybook/test` in stories |
| Import from `@storybook/test` | Use `storybook/test` (Storybook 10) |

## Visual Regression Testing (Chromatic)

Every story is automatically snapshotted by Chromatic in 4 modes:
- light desktop (1280px)
- dark desktop (1280px)
- light mobile (375px)
- dark mobile (375px)

### Running Visual Tests

**In Storybook (recommended for development):**
1. Open the Visual Tests addon panel
2. Click "Run tests"
3. Review and accept/reject changes

**From CLI:**
```bash
# Local (doesn't fail on changes)
yarn chromatic

# CI (fails if changes need review)
yarn chromatic:ci
```

### Chromatic Story Parameters

```tsx
import { themeOnlyModes } from '@/storybook/modes';

export const MyStory: Story = {
  parameters: {
    chromatic: {
      // Skip snapshot for interaction-only tests
      disableSnapshot: true,

      // Wait for animations
      delay: 500,

      // Custom modes for this story
      modes: themeOnlyModes,
    },
  },
};
```

### When to Disable Snapshots

Add `chromatic: { disableSnapshot: true }` for stories that:
- Only test interactions (no unique visual output)
- Test data attributes or ARIA properties
- Have identical appearance to another story

### When to Use themeOnlyModes

Use `modes: themeOnlyModes` for:
- Grid/showcase stories like AllVariants
- Simple components that don't need responsive testing

### Modes Location

Chromatic modes are defined in `packages/react/src/storybook/modes.ts`:
- `allModes` - All 4 theme/viewport combinations (default)
- `themeOnlyModes` - Light/dark desktop only
- `viewportOnlyModes` - Mobile/desktop light only
