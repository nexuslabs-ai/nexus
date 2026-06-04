# Contributing to Nexus Design System

Project overview lives in [`README.md`](README.md); this document is the testing on-ramp.

## Testing Philosophy

A single `*.stories.tsx` file does four jobs at once:

1. **Visual documentation** — autodocs is enabled globally in `packages/react/.storybook/preview.tsx`, so every story renders an autodoc page.
2. **Interactive playground** — Storybook's `argTypes` controls let designers and developers exercise every prop combination.
3. **Behavior tests** — `play` functions run as real assertions under Vitest's storybook project (real Chromium via Playwright).
4. **Accessibility assertions** — addon-a11y runs axe-core against every story with `test: 'error'`, so any violation fails the test.

You don't write a separate `*.test.tsx` for a component. That's not a stylistic preference — `vitest.config.ts` explicitly excludes `packages/react/src/components/**/*.test.{ts,tsx}` from the `unit` project.

Hooks and utilities use `*.test.ts` files with `@nexus/test-utils`. Scripts under `packages/core/scripts/__tests__/` use `.test.js` and import from `vitest` directly. Both run under Vitest's `unit` project (jsdom).

```
┌─────────────────────────────────────────────────────────────────┐
│  Components  →  *.stories.tsx (storybook project, real browser) │
│  Hooks/utils →  *.test.ts     (unit project, jsdom)             │
└─────────────────────────────────────────────────────────────────┘
```

The full spec lives in `.claude/rules/testing-react.md` and `.claude/rules/components.md`. This document is the on-ramp.

---

## Components: Stories as Tests

### Imports

Two distinct sources:

```tsx
// Types
import type { Meta, StoryObj } from '@storybook/react';

// Test utilities (Storybook 10 — note: `storybook/test`, NOT `@storybook/test`)
import { expect, fn, userEvent, within } from 'storybook/test';
```

### Story file structure

A real example from `Button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    onClick: fn(), // spy function for testing
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
    asChild: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;
```

Do **not** add `tags: ['autodocs']` to your meta. Autodocs is global; setting it per-story is redundant.

### Visual stories (no play function)

```tsx
export const Default: Story = {
  args: { children: 'Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};
```

### Interaction tests (with play functions)

Use data attributes (`data-slot`, `data-variant`, `data-size`) as the stable test surface — not class names. Tailwind classes are subject to the `nx:` prefix and may change as variants are restyled; data attributes are part of the component contract.

```tsx
export const ClickInteraction: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardInteraction: Story = {
  args: { children: 'Press Enter' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const WithDataAttributes: Story = {
  args: { children: 'Data Attrs', variant: 'secondary', size: 'lg' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toHaveAttribute('data-slot', 'button');
    await expect(button).toHaveAttribute('data-variant', 'secondary');
    await expect(button).toHaveAttribute('data-size', 'lg');
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
```

### Composition via `asChild`

```tsx
export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="https://example.com">Visit Website</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'button');
  },
};
```

### AllVariants grid

Stories that compose multiple instances for visual comparison. Tailwind utilities here must carry the `nx:` prefix, and colors must use semantic tokens (e.g., `nx:bg-error-background`, not `nx:bg-destructive` — `destructive` is the variant name, not a token). See [`.claude/rules/testing-react.md`](.claude/rules/testing-react.md) § Per-Base Variant Generation — the generator reuses this render-based showcase.

### A11y escape hatch

Some stories trigger known-broken a11y rules (e.g., a contrast pair that's tracked for token retuning). The escape hatch:

```tsx
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
  parameters: {
    a11y: { test: 'todo' }, // tracked separately; don't fail the suite
  },
};
```

Use sparingly. The default (and what every other story inherits) is `test: 'error'` — a violation fails CI. See [`.claude/rules/testing-react.md`](.claude/rules/testing-react.md) § Accessibility Testing for the full pattern.

---

## Hooks and Utilities: `*.test.ts`

Hooks and utility functions use plain Vitest with `@nexus/test-utils`.

### Imports

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

`@nexus/test-utils` re-exports `act`, `renderHook`, and `waitFor` from `@testing-library/react`, plus the standard Vitest globals. It does **not** export `render`, `screen`, `userEvent`, or `axe` — those would only be useful for component tests, which live in stories.

### Hook test example

Pattern from `.claude/rules/testing-react.md`:

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

### Utility test example

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

There are no hook tests in the repo today (the single `.test.ts` file, `packages/react/src/exports.test.ts`, is a package-exports smoke test). When a hook lands, the pattern above is ready.

---

## What's Out of Scope

**Don't write play functions for:**

- Visual appearance — the rendered story is the visual. Visual regression isn't currently in scope.
- Computed CSS values or pixel measurements — read the token, not the resolved style.
- Hover/focus visual styling — `:hover` snapshots aren't behavior assertions.
- Animation timing.

**Don't write `*.test.tsx` for components** — `vitest.config.ts` excludes them. Move the assertion into a story's `play` function.

**Don't assert on Tailwind class names** — they change as variants are restyled. Use `data-slot`, `data-variant`, `data-size`, ARIA attributes, or accessible queries (`getByRole`, `getByLabelText`).

---

## Component Checklist

A new (or updated) component should ship the following stories. The fuller table lives at `.claude/rules/testing-react.md`.

| Story                                | Play function? | Purpose                                                     |
| ------------------------------------ | -------------- | ----------------------------------------------------------- |
| `Default`                            | Optional       | Default args                                                |
| One story per variant                | No             | Visual documentation                                        |
| One story per size                   | No             | Visual documentation                                        |
| `Disabled`                           | Yes            | Verify disabled state; `onClick` not called                 |
| `ClickInteraction`                   | Yes            | Verify click handler fires                                  |
| `KeyboardInteraction`                | Yes            | Verify Tab focuses; Enter/Space triggers                    |
| `WithDataAttributes`                 | Yes            | Verify `data-slot`, `data-variant`, `data-size`             |
| `AsLink` / `asChild` (if applicable) | Yes            | Verify composition keeps `data-slot`                        |
| Edge cases                           | Yes            | Empty children, long content, special characters, with icon |
| `AllVariants`                        | No             | Visual grid for review                                      |

A11y is automatic — every story is axe-checked. No separate a11y story needed.

---

## Running Tests

| Command                     | What it does                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                 | Run both vitest projects: `unit` (jsdom) and `storybook` (real Chromium via Playwright)                               |
| `pnpm test:unit`            | `unit` project only — fastest feedback loop for hooks/utilities                                                       |
| `pnpm test:storybook`       | `storybook` project only — runs every story's play function in a browser                                              |
| `pnpm test:storybook:watch` | Watch mode for stories                                                                                                |
| `pnpm test:storybook:ui`    | **Debugging entry point** when a play function fails — opens Vitest's interactive UI mounted on the storybook project |
| `pnpm storybook`            | Start the Storybook dev server (the UI you're documenting against)                                                    |

The first run of `pnpm test` (or any storybook-project run) launches Storybook in the background — the first cold start takes a few extra seconds.

---

## AI Documentation MCP (nexus-docs-mcp)

This project runs a local documentation server that keeps Claude Code up-to-date with the exact library versions used here. Without it, the AI will use stale training data and suggest deprecated APIs.

### For teammates (using docs)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# One-time: authenticate with GitHub Container Registry
pnpm docs:login

# Pull the pre-indexed image and start the server
pnpm docs:pull
pnpm docs:start
```

The server runs at `http://localhost:6282`. Claude Code connects to it automatically via `.mcp.json` — no further setup needed.

To stop: `pnpm docs:stop`

When the maintainer publishes an update, pull and restart:

```bash
pnpm docs:pull && pnpm docs:stop && pnpm docs:start
```

### For the maintainer (managing docs)

```bash
# Start the local server for indexing (opens web UI at http://localhost:6282)
pnpm docs:serve

# Add or update libraries via the web UI / scrape_docs tool, then publish for the team
pnpm docs:publish   # export DB -> build Docker image -> push to GHCR
```

### Scripts reference

| Command        | Role       | What it does                                       |
| -------------- | ---------- | -------------------------------------------------- |
| `docs:serve`   | Maintainer | Start local server for indexing/managing libraries |
| `docs:export`  | Maintainer | Copy indexed DB into `docs-mcp/` for building      |
| `docs:build`   | Maintainer | Build Docker image with baked-in DB                |
| `docs:login`   | Both       | Authenticate with GitHub Container Registry        |
| `docs:push`    | Maintainer | Push image to GHCR                                 |
| `docs:publish` | Maintainer | All-in-one: export + build + push                  |
| `docs:pull`    | Teammate   | Pull latest image from GHCR                        |
| `docs:start`   | Teammate   | Start the docs MCP server on `localhost:6282`      |
| `docs:stop`    | Teammate   | Stop the container (auto-removed on stop)          |
| `docs:restore` | Maintainer | Pull the published DB back into the local store    |

---

## Authoritative Specs

This file is the on-ramp. The specs are:

- [`.claude/rules/testing-react.md`](.claude/rules/testing-react.md) — testing patterns, story structure, required stories, play functions, the base-variants generator
- [`.claude/rules/components.md`](.claude/rules/components.md) — component architecture, `nx:` prefix, data attributes, variants

When this doc and a rule file disagree, the rule file wins.
