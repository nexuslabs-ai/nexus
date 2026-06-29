# Nexus Design System

Token-driven design system for product UI. Three layers compose into one consumable surface:

- **`@nexus/core`** — DTCG design tokens (color, spacing, radius, shadow, typography, motion). Color emits as OKLCH at build time via a perceptual-L grid; spacing is per-mode (mode swap at runtime via the `data-density` attribute).
- **`@nexus/tailwind`** — Tailwind CSS theme generated from the tokens. All utilities are namespaced with the `nx:` prefix.
- **`@nexus/react`** — React components built on Radix UI primitives and the Tailwind layer. Variants via CVA; data-attribute test surface; padding-based sizing.

A console app exercises the tokens visually; Storybook hosts the component catalog and runs both visual docs and interaction tests against the real components.

## Prerequisites

- **Node** ≥ 20.19.0 (see `.nvmrc`)
- **pnpm** — pinned via `packageManager: pnpm@10.12.1`
- **Docker Desktop** — for the docs-MCP server (optional)

## Quick start

```bash
make setup        # install deps + the Playwright browser
make dev          # Storybook — the component catalog & dev surface
```

`make help` lists every shortcut. Full setup, the `make` workflow, the testing model, and the docs-MCP are in **[`CONTRIBUTING.md`](CONTRIBUTING.md)**.

## Workspace layout

| Path                  | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `packages/core`       | Internal design tokens and theme definitions (not published)  |
| `packages/tailwind`   | Tailwind CSS theme with `nx:` prefix                          |
| `packages/react`      | React components built with Radix UI and Tailwind CSS         |
| `packages/test-utils` | Test utilities for hooks and utilities                        |
| `apps/console`        | Theme/token exploration UI                                    |
| `apps/docs`           | Documentation site (Next.js — IA shell + live theme explorer) |

## Where to learn more

- **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — setup, the `make` workflow, the testing model, story patterns, and the docs-MCP
- [`.claude/rules/`](.claude/rules/) — project conventions (canonical; there is no root `CLAUDE.md`). High-traffic files:
  - [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns for the React package
  - [`components.md`](.claude/rules/components.md) — component architecture, `nx:` prefix, data attributes
- [Issue tracker](../../issues) — bugs and feature requests

## Browser support

| Browser          | Minimum version |
| ---------------- | --------------- |
| Chrome           | 111             |
| Edge             | 111             |
| Firefox          | 113             |
| Safari           | 15.4            |
| Samsung Internet | 22              |

Design tokens use OKLCH color (Baseline 2023). Browsers below these versions do not support OKLCH and will not receive hex fallbacks — consumers needing older support must pin to the last pre-OKLCH-migration tag. The same floor is encoded in root `package.json#browserslist`; run `pnpm audit:browser-support` before adopting a new Modern Web Guidance feature.
