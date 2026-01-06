# @nexus/test-utils

Testing utilities for hooks and utility functions in Nexus Design System.

## Important: Component Testing Has Moved

**DO NOT use this package for component testing.**

Components are tested via Storybook play functions:

```tsx
// In *.stories.tsx
import { expect, fn, userEvent, within } from 'storybook/test';
```

**Note:** In Storybook 10, use `storybook/test` (not `@storybook/test`).

This package is only for hooks and utility functions.

## Quick Reference

```bash
yarn build      # Build with tsup
yarn dev        # Watch mode
yarn typecheck  # TypeScript check
```

## What This Package Provides

| Export | Source | Purpose |
|--------|--------|---------|
| `renderHook` | @testing-library/react | Hook testing |
| `act` | @testing-library/react | State updates in tests |
| `waitFor` | @testing-library/react | Async assertions |
| `describe`, `it`, `expect`, `vi` | vitest | Test utilities |

## What This Package Does NOT Provide

| Removed | Reason | Use Instead |
|---------|--------|-------------|
| `render` | Components use stories | Storybook play functions |
| `screen`, `within` | Components use stories | `storybook/test` |
| `userEvent` | Components use stories | `storybook/test` |
| `axe` | A11y is automatic | `addon-a11y` with `test: 'error'` |

## Usage: Hook Testing

```tsx
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

## Usage: Utility Testing

```tsx
import { describe, expect, it } from '@nexus/test-utils';

import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats USD', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

## Setup File

The `setup.ts` file is loaded by vitest for unit tests. It provides:

| Setup | Purpose |
|-------|---------|
| jest-dom matchers | `toBeInTheDocument()`, `toHaveClass()`, etc. |
| ResizeObserver mock | For hooks using ResizeObserver |
| matchMedia mock | For hooks using media queries |
| IntersectionObserver mock | For hooks using intersection |

## Directory Structure

```
src/
├── index.ts    # Exports (renderHook, act, waitFor, vitest utils)
└── setup.ts    # Test setup (mocks, matchers)
```

## Build Output

| File | Purpose |
|------|---------|
| `dist/index.js` | ESM exports |
| `dist/index.cjs` | CJS exports |
| `dist/setup.js` | Setup file (ESM) |
| `dist/setup.cjs` | Setup file (CJS) |

## Do Not

- Import `render`, `screen`, `userEvent` from this package (removed)
- Use this package for component testing (use stories)
- Add axe assertions (addon-a11y handles it)

## Do

- Use for `renderHook` to test custom hooks
- Use for utility function unit tests
- Import vitest utilities from here for consistency
