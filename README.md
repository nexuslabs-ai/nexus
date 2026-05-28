# Nexus Design System

Token-driven design system for product UI. Three layers compose into one consumable surface:

- **`@nexus/core`** — DTCG design tokens (color, spacing, radius, shadow, typography). Color emits as OKLCH at build time via a perceptual-L grid; spacing is per-mode (mode swap at runtime via the `data-style` attribute).
- **`@nexus/tailwind`** — Tailwind CSS theme generated from the tokens. All utilities are namespaced with the `nx:` prefix.
- **`@nexus/react`** — React components built on Radix UI primitives and the Tailwind layer. Variants via CVA; data-attribute test surface; padding-based sizing.

A playground app exercises the tokens visually; Storybook hosts the component catalog and runs both visual docs and interaction tests against the real components.

## Prerequisites

- Node ≥ 20.19.0
- Yarn 1.x (classic) — pinned via `packageManager: yarn@1.22.22`. Yarn Berry / Yarn 4 / pnpm / npm will install with the wrong dep shape.

## Quick start

```bash
yarn install              # install all workspace deps; wires Husky pre-commit hooks
yarn storybook            # component catalog + interactive playground
yarn playground           # token / theme explorer app
yarn dev                  # turbo watch across every workspace (library dev)
yarn test                 # run both vitest projects: unit (jsdom) + storybook (chromium)
```

Each command runs from the repo root.

## Workspace layout

| Path                  | Purpose                                                      |
| --------------------- | ------------------------------------------------------------ |
| `packages/core`       | Internal design tokens and theme definitions (not published) |
| `packages/tailwind`   | Tailwind CSS theme with `nx:` prefix                         |
| `packages/react`      | React components built with Radix UI and Tailwind CSS        |
| `packages/test-utils` | Test utilities for hooks and utilities                       |
| `apps/playground`     | Theme/token exploration UI                                   |
| `apps/docs`           | Documentation site (scaffold — no implementation yet)        |

## Where to learn more

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — testing model, story patterns, component checklist
- [`.claude/rules/`](.claude/rules/) — project conventions (canonical). There is no root `CLAUDE.md`; the rules directory is the authoritative AI-guidance source. High-traffic files:
  - [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns for the React package
  - [`components.md`](.claude/rules/components.md) — component architecture, `nx:` prefix, data attributes
- [`packages/core/docs/`](packages/core/docs/) — the token-system reference (not auto-loaded into every session): [`tokens.md`](packages/core/docs/tokens.md) (OKLCH pipeline, APCA gate), [`color-shades.md`](packages/core/docs/color-shades.md), [`surfaces.md`](packages/core/docs/surfaces.md), [`spacing-tokens.md`](packages/core/docs/spacing-tokens.md)
- [Issue tracker](../../issues) — bugs and feature requests

## Browser support

| Browser          | Minimum version |
| ---------------- | --------------- |
| Chrome           | 111             |
| Edge             | 111             |
| Firefox          | 113             |
| Safari           | 15.4            |
| Samsung Internet | 22              |

Design tokens use OKLCH color (Baseline 2023). Browsers below these versions do not support OKLCH and will not receive hex fallbacks. Consumers needing older browser support must pin to the last pre-OKLCH-migration tag.
