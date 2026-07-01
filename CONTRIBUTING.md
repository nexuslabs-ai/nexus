# Contributing to Nexus Design System

Project overview lives in [`README.md`](README.md). This is the day-to-day handbook — how to set up, run the dev servers, test, and ship.

**Everything routes through `make`.** Run `make help` for the full list. Prefer the `make` targets over raw `pnpm` / `turbo`: they wrap the flags everyone should be using (turbo filters, the docs-MCP lifecycle, the pre-push gate) so the workflow stays consistent across the team.

## Prerequisites

- **Node** ≥ 20.19.0 (see `.nvmrc`)
- **pnpm** — pinned via `packageManager` in `package.json` (`pnpm@10.12.1`)
- **Docker Desktop** — for the docs-MCP server only (recommended, not required to build the library)

## Setup

```bash
make setup        # install all workspace deps + the Playwright browser (for story tests)
```

That's the whole first-time setup. It also wires the Husky pre-commit hook, which formats and `nx:`-lints your staged files on every commit.

## Day-to-day

Pick the surface you're working on — each is one `make` command that turbo orchestrates (parallel servers, prefixed logs, one Ctrl-C stops all):

| Command        | Brings up                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------- |
| `make dev`     | **Storybook** — the component catalog + interaction tests. The 90% surface.                 |
| `make console` | the console app **+ a live `@nexus_ds/react` watcher** (component edits show up in the app) |
| `make docs`    | the docs site **+ live `@nexus_ds/react`**                                                  |
| `make dev-all` | everything: console + docs + storybook + all package watchers                               |

> **First start on a clean checkout:** `console` / `docs` read `@nexus_ds/react`'s `dist`, which the watcher emits a moment after launch — a brief error on the very first start is expected, or run `make build` once beforehand.

Leave **`make up`** running in another terminal so the docs-MCP is available to Claude Code (see [AI Documentation MCP](#ai-documentation-mcp-nexus-docs-mcp)).

## Before you push

```bash
make verify       # the full gate: lint + format check + typecheck + tests + token/a11y/browser audits
```

`make verify` is what CI gates on, run locally. For the fast inner loop:

- `make lint` — ESLint (cheap; run it constantly)
- `make typecheck` — `tsc` across the packages
- `pnpm test:unit` — just the jsdom unit tests (hooks / utilities)
- `pnpm test:storybook:ui` — the interactive debugger when a story's `play` function fails

The pre-commit hook already formats and `nx:`-lints staged files, so you rarely format by hand (`pnpm format` does a full-tree pass if you want one).

## Make targets

`make help` prints these with descriptions. The full set:

| Group        | Targets                                                         |
| ------------ | --------------------------------------------------------------- |
| **Setup**    | `setup` · `fresh` (clean + install + build) · `clean`           |
| **Dev**      | `dev` · `console` · `docs` · `dev-all`                          |
| **Build**    | `build` · `tokens` (regenerate token CSS from `@nexus_ds/core`) |
| **Quality**  | `lint` · `typecheck` · `audit` · `verify`                       |
| **Docs MCP** | `up` · `down` · `serve` · `publish`                             |

Anything not wrapped is still a plain pnpm script (`pnpm test`, `pnpm test:storybook:ui`, the per-package `audit:*`).

---

## Testing

A single `*.stories.tsx` file does four jobs at once:

1. **Visual documentation** — autodocs is enabled globally in `packages/react/.storybook/preview.tsx`, so every story renders an autodoc page.
2. **Interactive playground** — Storybook's `argTypes` controls let designers and developers exercise every prop combination.
3. **Behavior tests** — `play` functions run as real assertions under Vitest's storybook project (real Chromium via Playwright).
4. **Accessibility assertions** — addon-a11y runs axe-core against every story with `test: 'error'`, so any violation fails the test.

You don't write a separate `*.test.tsx` for a component. That's not a stylistic preference — `vitest.config.ts` explicitly excludes `packages/react/src/components/**/*.test.{ts,tsx}` from the `unit` project.

Hooks and utilities use `*.test.ts` files with `@nexus_ds/test-utils`. Scripts under `packages/core/scripts/__tests__/` use `.test.js` and import from `vitest` directly. Both run under Vitest's `unit` project (jsdom).

```
┌─────────────────────────────────────────────────────────────────┐
│  Components  →  *.stories.tsx (storybook project, real browser) │
│  Hooks/utils →  *.test.ts     (unit project, jsdom)             │
└─────────────────────────────────────────────────────────────────┘
```

The full spec lives in `.claude/rules/testing-react.md` and `.claude/rules/components.md`. This section is the on-ramp.

### Components: stories as tests

Two distinct import sources:

```tsx
// Types
import type { Meta, StoryObj } from '@storybook/react';

// Test utilities (Storybook 10 — note: `storybook/test`, NOT `@storybook/test`)
import { expect, fn, userEvent, within } from 'storybook/test';
```

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

Do **not** add `tags: ['autodocs']` to your meta — autodocs is global; setting it per-story is redundant.

**Visual stories** (no play function):

```tsx
export const Default: Story = { args: { children: 'Button' } };
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};
```

**Interaction tests** (with play functions). Use data attributes (`data-slot`, `data-variant`, `data-size`) as the stable test surface — not class names. Tailwind classes carry the `nx:` prefix and may change as variants are restyled; data attributes are part of the component contract.

```tsx
export const ClickInteraction: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
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

**Composition via `asChild`:**

```tsx
export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="https://example.com">Visit Website</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'button');
  },
};
```

**A11y escape hatch** — some stories trigger known-broken a11y rules (e.g. a contrast pair tracked for token retuning). Use sparingly; the default every story inherits is `test: 'error'` (a violation fails CI):

```tsx
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
  parameters: { a11y: { test: 'todo' } }, // tracked separately; don't fail the suite
};
```

### Hooks and utilities: `*.test.ts`

Plain Vitest with `@nexus_ds/test-utils` (re-exports `act`, `renderHook`, `waitFor` plus the standard Vitest globals — **not** `render` / `screen` / `userEvent` / `axe`, which only make sense for component tests, and those live in stories):

```tsx
import { act, describe, expect, it, renderHook } from '@nexus_ds/test-utils';

import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

### What's out of scope

- **No `*.test.tsx` for components** — `vitest.config.ts` excludes them; move the assertion into a story's `play` function.
- **Don't assert on Tailwind class names** — they change as variants are restyled. Use `data-*`, ARIA attributes, or accessible queries (`getByRole`, `getByLabelText`).
- **No play functions for** visual appearance, computed CSS / pixel measurements, `:hover` snapshots, or animation timing.

### Component checklist

A new (or updated) component ships these stories (fuller table in `.claude/rules/testing-react.md`):

| Story                                | Play function? | Purpose                                         |
| ------------------------------------ | -------------- | ----------------------------------------------- |
| `Default`                            | Optional       | Default args                                    |
| One per variant / size               | No             | Visual documentation                            |
| `Disabled`                           | Yes            | Disabled state; `onClick` not called            |
| `ClickInteraction`                   | Yes            | Click handler fires                             |
| `KeyboardInteraction`                | Yes            | Tab focuses; Enter/Space triggers               |
| `WithDataAttributes`                 | Yes            | `data-slot` / `data-variant` / `data-size`      |
| `AsLink` / `asChild` (if applicable) | Yes            | Composition keeps `data-slot`                   |
| Edge cases                           | Yes            | Empty / long / special-char children, with icon |
| `AllVariants`                        | No             | Visual grid for review                          |

A11y is automatic — every story is axe-checked, no separate a11y story needed.

### Running tests

`make verify` runs the whole suite (plus lint / typecheck / audits). To run or debug tests directly:

| Command                  | What it does                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| `pnpm test`              | both vitest projects — `unit` (jsdom) + `storybook` (Chromium)    |
| `pnpm test:unit`         | unit only — fastest loop for hooks / utilities                    |
| `pnpm test:storybook`    | every story's play function in a real browser                     |
| `pnpm test:storybook:ui` | **debugger** — Vitest's interactive UI when a play function fails |

The first storybook-project run launches Storybook in the background — the cold start takes a few extra seconds.

---

## AI Documentation MCP (nexus-docs-mcp)

A local documentation server keeps Claude Code on the exact library versions used here (Tailwind v4, Storybook 10, Vitest 4, Radix, recharts 3, zod 4, …) instead of stale training data. It ships as a pre-indexed Docker image, so there's nothing to scrape locally.

### Teammates — use it

Requires Docker. One command brings it up:

```bash
make up           # pull the published image + run it at http://localhost:6282
```

`.mcp.json` connects Claude Code automatically — no further setup. Stop it with `make down`. After a maintainer publishes an update: `make down && make up`.

> The image is public (read-only), so `make up` pulls it anonymously — no auth needed. Registry login (`pnpm docs:login`, with the bot credentials) is only for maintainers **publishing** an update; see below.

### Maintainers — update it

```bash
make serve        # local docs-mcp server + web dashboard at :6282 for indexing
# add/refresh libraries via the dashboard or the scrape_docs tool, then:
make publish      # login → export DB → build image → push to GHCR
```

The index DB ships **inside** the image, never in git — the live index is the source of truth, and `list_libraries` shows what's in it.

### Lifecycle reference

| make           | wraps                                                 | role                               |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| `make up`      | `docs:pull` + `docs:start`                            | teammate — run the published index |
| `make down`    | `docs:stop`                                           | teammate — stop it                 |
| `make serve`   | `docs:serve`                                          | maintainer — local indexing server |
| `make publish` | `docs:login` + `docs:publish` (export → build → push) | maintainer — ship an update        |

The rule that mandates querying it lives in [`.claude/rules/docs-mcp.md`](.claude/rules/docs-mcp.md).

---

## Authoritative specs

This handbook is the on-ramp. The canonical conventions live in [`.claude/rules/`](.claude/rules/) — there is no root `CLAUDE.md`. When this doc and a rule file disagree, the rule file wins.

- [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns and required stories
- [`components.md`](.claude/rules/components.md) — component architecture, `nx:` prefix, data attributes, variants
- [`github.md`](.claude/rules/github.md) — branch naming, PR title/body conventions, the review-bot flow
