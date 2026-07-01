# Nexus Agent Context

This file is the Codex-facing entrypoint for the Nexus design-system repo. The existing Claude setup remains the canonical detailed guidance; use this file as the fast path, then consult the linked `.claude` files when a task enters that area.

## Project Shape

- Monorepo using pnpm (`pnpm@10.12.1`) and Node `>=20.19.0`.
- Workspaces live under `packages/*` and `apps/*`.
- Core packages:
  - `packages/core`: DTCG design tokens and token build/audit scripts.
  - `packages/tailwind`: generated Tailwind theme utilities using the `nx:` prefix.
  - `packages/react`: React component library built on Radix primitives, CVA variants, semantic tokens, and Storybook tests.
  - `packages/test-utils`: Vitest/testing-library utility exports for hooks and utilities.
- Apps:
  - `apps/console`: token/theme exploration UI.
  - `apps/docs`: documentation site.

## Modern Web Guidance Policy

Modern Web Guidance is installed outside the repo for agent use. For HTML, CSS,
client-side JavaScript, accessibility, forms, layout, performance, overlays, and
browser-platform work, search Modern Web Guidance first and adapt its guidance to
Nexus conventions.

Browser support is Chrome 111+, Edge 111+, Firefox 113+, Safari 15.4+, and
Samsung Internet 22+. OKLCH is the browser-floor feature and is documented as
Baseline 2023, but do not treat all Baseline 2023 features as safe by default.
Check the specific feature's support against this browser floor and use
progressive enhancement or fallbacks where the floor does not cover it. The
canonical floor is also encoded in root `package.json#browserslist`; run
`pnpm audit:browser-support` when adopting or reclassifying browser-platform
features from Modern Web Guidance.

## Command Reference

Run commands from the repo root.

```bash
pnpm install
pnpm dev
pnpm storybook
pnpm console
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:unit
pnpm test:storybook
pnpm audit:browser-support
pnpm audit:contrast
```

For token output changes:

```bash
pnpm tokens:modular
pnpm tokens:tailwind
```

## Canonical Rules

The `.claude/rules` directory is the detailed source of truth for repo conventions. Before making changes in these areas, read the relevant rule file:

- General code quality: `.claude/rules/code-quality.md`
- React components: `.claude/rules/components.md`
- React testing and Storybook coverage: `.claude/rules/testing-react.md`
- Core testing philosophy: `.claude/rules/testing.md`
- Design tokens: `packages/core/tokens/`
- Responsive behavior: `.claude/rules/responsive.md`
- GitHub/PR conventions: `.claude/rules/github.md`
- shadcn adaptation differences: `.claude/rules/shadcn-divergences.md`

Important rule summaries:

- Favor simple, explicit code over clever abstractions.
- Keep the happy path flat with guard clauses.
- Extract branching or multi-line JSX handlers into named functions above `return`.
- Treat `useEffect` as an escape hatch for external synchronization, not derived React state.
- Comments should explain non-obvious logic only; TODOs need a tracked issue.
- This project is pre-production: prefer changing code in place over shims, broad backcompat, or feature flags.

## Component Work

Use `packages/react/src/components/` patterns as the reference.

- Every component needs `{name}.tsx` and `{Name}.stories.tsx`.
- Do not add component `*.test.tsx` files; component behavior is tested in Storybook `play` functions.
- Export the component, its props type, and relevant variants, then update `packages/react/src/index.ts`.
- Use named props interfaces extending `React.ComponentProps<...>` and `VariantProps<typeof ...>`.
- Use CVA for enum variants; keep boolean state logic explicit in the component body.
- Use Radix `Slot` and `asChild` for interactive composition where appropriate.
- Always include stable `data-*` attributes such as `data-slot`, `data-variant`, and `data-size`.
- Use `cn()` for class merging.

Tailwind conventions:

- Every Tailwind utility must use the `nx:` prefix.
- Put `nx:` before modifiers: `nx:hover:*`, `nx:md:*`, `nx:[&>svg]:*`.
- Use semantic token utilities, not raw primitives, in component code.
- Do not add `dark:` modifiers to semantic token utilities; semantic tokens already adapt by theme.
- Treat `.claude/rules/components.md` § Sizing Convention as the single source
  for component sizing values; do not infer a value from a similar component.
- Use the canonical focus outline tokens from `.claude/rules/components.md`.

Responsive conventions:

- Component-internal adaptation should use container queries.
- Viewport breakpoints are for page-shell decisions and documented full-viewport exceptions.

## Testing

Stories are tests for components. A component story file acts as visual documentation, interaction coverage, and accessibility coverage.

Use Storybook 10 imports:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
```

Required component story purposes are defined in `.claude/rules/testing-react.md`. New components generally need default, variant, size, disabled, click interaction, keyboard interaction, data-attribute, composition, edge-case, and showcase stories unless that rule documents an archetype-specific exception.

Hooks and utilities use `*.test.ts` with `@nexus_ds/test-utils`. Do not use Storybook imports in hook/utility tests.

Before finishing component work, run the narrowest meaningful checks first, then broaden as risk increases:

```bash
pnpm test:storybook
pnpm typecheck
pnpm lint
```

## Token Work

Read the token sources in `packages/core/tokens/` before changing tokens or generated token outputs.

- Token source lives under `packages/core/tokens/`.
- Do not edit `dist/` or `packages/tailwind/` directly; regenerate outputs.
- On disk, color tokens are hex; emitted runtime CSS is OKLCH.
- APCA contrast failures must be fixed by changing semantic mappings or palette/grid values, not by lowering thresholds.
- Spacing mode swaps happen at runtime through `data-density`.

## Claude Commands, Skills, Agents, And Settings

The repo still carries useful Claude-specific workflow assets:

- Commands: `.claude/commands/*`
- Skills: `.claude/skills/*`
- Agents: `.claude/agents/*`
- Claude permissions/settings config: `.claude/settings.json`

Codex does not automatically execute Claude commands or invoke Claude subagents. When a user mentions a Claude command such as `/implement`, translate the intent into normal Codex work and read the corresponding `.claude/commands/*.md` or `.claude/skills/*/SKILL.md` only for process guidance.

Formatting and linting run on commit via the Husky + lint-staged pre-commit hook (`eslint --fix` + `prettier --write` on staged files); the `nx:` Tailwind-class conventions are enforced by the `@nexus_ds/nx-class-conventions` ESLint rule. For immediate feedback, run `pnpm lint` and `pnpm format` explicitly.

## GitHub And PRs

Read `.claude/rules/github.md` before creating branches, commits, PRs, or reviews.

- Main branch is `main`.
- Infer owner/repo from `git remote` or `gh repo view`; do not hardcode.
- PR titles use conventional commit style: `{type}({scope}): {description}`.
- PR bodies should include Summary, GitHub Issue, and Test Plan sections.
- Use `Closes #123` for linked issues.

## Local Safety

- Do not edit `.env*` files.
- Do not touch generated outputs unless the task is specifically to update them through the repo's generation commands.
- Preserve user changes in the worktree; inspect before editing files that may already be modified.
- Prefer focused edits that match nearby patterns over broad refactors.
