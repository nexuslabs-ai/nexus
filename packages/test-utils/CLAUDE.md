# Test Utils Package (@nexus/test-utils)

Shared testing utilities for Nexus Design System components. Re-exports testing-library with custom enhancements.

## Quick Reference

```bash
yarn build      # Build with tsup
yarn dev        # Watch mode
yarn typecheck  # TypeScript check
```

## What This Package Provides

| Export | Source | Purpose |
|--------|--------|---------|
| `render` | Custom | Theme-aware render with wrapper |
| `screen`, `within` | @testing-library/react | Query utilities |
| `userEvent` | @testing-library/user-event | User interaction simulation |
| `axe` | vitest-axe | Accessibility testing |
| `waitFor`, `act` | @testing-library/react | Async utilities |
| Query functions | @testing-library/react | `getByRole`, `findByText`, etc. |

## Usage in Tests

```tsx
import { axe, render, screen, userEvent } from '@nexus/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('renders', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  it('is accessible', async () => {
    const { container } = render(<Button>Click</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

## Theme Testing

```tsx
// Light mode (default)
render(<Component>Content</Component>);

// Dark mode - wraps component in .dark class
render(<Component>Content</Component>, { theme: 'dark' });
```

## Directory Structure

```
src/
├── index.ts    # All exports (re-exports + custom)
├── render.tsx  # Custom render with ThemeWrapper
└── setup.ts    # Test setup (mocks, matchers)
```

## Setup File

The `setup.ts` file is loaded by vitest before tests run. It provides:

| Setup | Purpose |
|-------|---------|
| jest-dom matchers | `toBeInTheDocument()`, `toHaveClass()`, etc. |
| vitest-axe matchers | `toHaveNoViolations()` |
| ResizeObserver mock | For Radix UI components |
| matchMedia mock | For responsive components |
| IntersectionObserver mock | For lazy-loading components |

## Build Output

| File | Purpose |
|------|---------|
| `dist/index.js` | ESM exports |
| `dist/index.cjs` | CJS exports |
| `dist/setup.js` | Setup file (ESM) |
| `dist/setup.cjs` | Setup file (CJS) |

## Configuration in Root

The vitest.config.ts at root references this package:

```ts
setupFiles: ['./packages/test-utils/src/setup.ts'],
```

## Adding New Utilities

1. Create utility in `src/`
2. Export from `src/index.ts`
3. Run `yarn build` to rebuild
4. Available to all packages via `@nexus/test-utils`

## Do Not

- Import directly from `@testing-library/react` in component tests (use this package)
- Forget to use `userEvent.setup()` before interactions
- Skip the `await` on async operations (`user.click()`, `axe()`)
