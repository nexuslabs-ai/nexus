# nxds

nxds is a framework-agnostic theme engine and design system. Set one appearance object, and every component follows your brand, density and corners. Docs: **<https://nxds.dev>**.

Three layers compose into one consumable surface:

- **`@nxds/core`** — DTCG design tokens (color, spacing, radius, shadow, typography, motion). Color emits as OKLCH at build time via a perceptual-L grid; spacing is per-mode (mode swap at runtime via the `data-density` attribute).
- **`@nxds/tailwind`** — Tailwind CSS theme generated from the tokens. All utilities are namespaced with the `nx:` prefix.
- **`@nxds/react`** — React components built on Radix UI primitives and the Tailwind layer. Variants via CVA; data-attribute test surface.

Add nxds to your app with `nxds-cli`:

```bash
npx nxds-cli@latest init
npx nxds-cli@latest add button
```

To give Claude Code the nxds skill, run `/plugin install nxds --marketplace nexuslabs-ai/nxds`.

Storybook hosts the component catalog and runs both visual docs and interaction tests against the real components. The catalog is published from `main` at **<https://storybook.nxds.dev>**.

## Prerequisites

- **Node** ≥ 22 (see `.nvmrc`)
- **pnpm** — pinned via `packageManager: pnpm@10.12.1`
- **Docker Desktop** — for the docs-MCP server (optional)

## Quick start

```bash
make setup        # install deps + the Playwright browser
make dev          # Storybook — the component catalog & dev surface
```

`make help` lists every shortcut. Full setup, the `make` workflow, the testing model, and the docs-MCP are in **[`CONTRIBUTING.md`](CONTRIBUTING.md)**.

## Workspace layout

| Path                | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `packages/core`     | Internal design tokens and theme definitions (not published)  |
| `packages/tailwind` | Tailwind CSS theme with `nx:` prefix                          |
| `packages/react`    | React components built with Radix UI and Tailwind CSS         |
| `packages/cli`      | `nxds-cli`, which installs nxds into an app                   |
| `apps/docs`         | Documentation site (Next.js — IA shell + live theme explorer) |
| `plugins/nxds`      | The nxds skill for Claude Code and other AI agents            |

## Where to learn more

- **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — setup, the `make` workflow, the testing model, story patterns, and the docs-MCP
- [`.claude/rules/`](.claude/rules/) — project conventions (canonical; there is no root `CLAUDE.md`). High-traffic files:
  - [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns for the React package
- [Issue tracker](../../issues) — bugs and feature requests
