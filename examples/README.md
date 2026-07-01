# examples — consuming a Nexus-exported design system

This directory is a **live integration bed** for the external-consumer story: it
publishes an exported design system to a local registry and consumes it from a
stock Next.js + Tailwind 4 app — the thing `apps/console` (all-in on Nexus via
workspace links) can't prove.

> These folders are **not** part of the pnpm workspace and are excluded from the
> monorepo's turbo / eslint / prettier. Each is a self-contained downstream repo.

## Layout

| Path | What it is |
| ---- | ---------- |
| `verdaccio.yaml` | Local npm registry — proxies real npm, hosts the exported `@acme/*` packages. |
| `scripts/setup.mjs` | Orchestrates: Verdaccio → `pnpm export` → publish `@acme/*` → install the app. |
| `nextjs-consumer/` | Stock Next.js 15 (App Router) + Tailwind 4 app consuming `@acme/react`. |
| `.generated/` | The exported `@acme` design system (gitignored — regenerated each run). |

## Run it

```bash
node examples/scripts/setup.mjs
cd examples/nextjs-consumer && npm run dev
```

`setup.mjs` starts Verdaccio, exports the design system into `.generated/`,
publishes `@acme/tailwind` then `@acme/react` to the local registry, and installs
the app against it. After that the app runs offline.

## How the consumer wires it (Path A — components + runtime tokens)

The safe, non-invasive path: the app's **own Tailwind is never touched**. The
design-system utilities are precompiled and namespaced under `nx:`, and tokens
arrive at runtime from the appearance provider.

_Finalized in Phase 3 from the working app — see `nextjs-consumer/` for the real
wiring (globals.css import order, provider + first-paint script in `layout.tsx`)._

## Gotchas this bed exists to surface

- **`nx:` prefix isolation** — `@acme/react`'s classes are `nx:*` and its vars are
  `--nx-*`, so they never collide with the app's own Tailwind utilities/`@theme`.
- **Preflight** — `@acme/react/styles.css` ships Tailwind's base reset; this bed
  shows whether it double-applies alongside the app's own preflight.
- **Tokens without touching the app's Tailwind** — provided at runtime by
  `NexusAppearanceProvider` (+ the server first-paint script for no-FOUC), so the
  app never has to run `@acme/tailwind`'s `@theme` through its own build.
