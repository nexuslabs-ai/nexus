# examples — consuming a Nexus-exported design system

A **live integration bed** for the external-consumer story: it publishes an
exported design system to a local registry and consumes it from a stock
Next.js 15 + Tailwind 4 app. It's the thing `apps/console` (all-in on Nexus via
workspace links) can't prove, and it's the reference for **how a real downstream
app adopts the design system incrementally**.

> Not part of the pnpm workspace; excluded from the monorepo's turbo / eslint /
> prettier. Each folder is a self-contained downstream repo.

## Layout

| Path | What it is |
| ---- | ---------- |
| `verdaccio.yaml` | Local npm registry — proxies real npm, hosts the exported `@acme/*` packages. |
| `scripts/setup.mjs` | Orchestrates: Verdaccio → `pnpm export` → publish `@acme/*` → `npm install` the app → generate the IntelliSense file. |
| `nextjs-consumer/` | Stock Next.js 15 (App Router) + Tailwind 4 app consuming `@acme/react`. |
| `.generated/` | The exported `@acme` design system (gitignored — regenerated each run). |

## Run it

```bash
node examples/scripts/setup.mjs
cd examples/nextjs-consumer && npm run dev   # → http://localhost:3000
```

`setup.mjs` starts Verdaccio, exports the design system into `.generated/`,
publishes `@acme/tailwind` then `@acme/react` (order matters — react depends on
tailwind), installs the app against the local registry, and generates the editor
IntelliSense file. After that the app runs offline.

## The three ways to consume it

The app's five feature screens use **mode 1**; two extra screens demonstrate
**modes 2 and 3**.

### 1. Components (the 90% case) — `Dashboard`, `Components`, `Data`, `Forms`, `Appearance`

Import components from `@acme/react`, their precompiled styles, and wrap the app
in the appearance provider. **Your own Tailwind is never touched.**

```tsx
// app/layout.tsx
import './globals.css';            // your own Tailwind
import '@acme/react/styles.css';   // precompiled nx: component CSS (side-effect import)

import { NexusAppearanceScript } from '@acme/react/appearance/server'; // no-FOUC first paint
// providers.tsx: 'use client' → <NexusAppearanceProvider> injects the --nx-* tokens
```

Components are precompiled and namespaced under `nx:` with `--nx-*` variables, so
they never collide with your utilities. Tokens come from the provider at runtime
(the server `<NexusAppearanceScript>` sets them before first paint), so you never
run `@acme/tailwind`'s `@theme` through your own build.

### 2. Author `nx:` utilities yourself (`Incremental`)

Load the design system's `nx:` theme as a **separate Tailwind entry** so you can
write `nx:bg-primary-background` in your own markup alongside `bg-slate-100`:

```tsx
// app/layout.tsx
import './globals.css';   // your own Tailwind (unprefixed)
import './nexus.css';     // the DS nx: theme — a SEPARATE compilation
```
```css
/* app/nexus.css */
@import '@acme/tailwind';
```

**Why separate?** Tailwind v4's prefix is global _per compilation_. Putting
`@import '@acme/tailwind'` (which is `@import 'tailwindcss' prefix(nx)`) into
`globals.css` alongside your own `@import 'tailwindcss'` flips the whole build to
the `nx` prefix and kills your `bg-slate-*`. As its **own** CSS entry it's an
independent compilation, so both sets generate. See the `Incremental` screen for
the full coexistence lab.

### 3. Raw Tailwind, no design system (`Raw Tailwind`)

Plain app markup, the app's own Tailwind only, zero `@acme/react`. Proves the app
Tailwind works fully and independently (this screen's First Load JS is ~220 kB
lighter than the `@acme` screens — that gap _is_ the design system).

## Editor autocomplete (`nx:` IntelliSense)

The runtime uses two separate Tailwind entries (mode 2), but the Tailwind
IntelliSense extension builds completions from **one design system per file** and
can't merge two entries ([tailwindcss-intellisense#665]) — and two prefixes
collapse to one, so a combined `@import` loses your `bg-slate-*`.

The fix is editor-only: `scripts/gen-intellisense-css.mjs` generates
`tailwind.intellisense.css` — a single combined design system (app default
Tailwind + a **no-op `nx` variant** + the DS tokens/utilities) that is **never
imported at runtime**. `.vscode/settings.json` points IntelliSense at it:

```jsonc
{ "tailwindCSS.experimental.configFile": { "tailwind.intellisense.css": "app/**" } }
```

Open `examples/nextjs-consumer` **as the workspace root** (a consumer opens their
own repo), reload, and both `bg-slate-*` and the full `nx:` vocabulary
autocomplete. Requires Tailwind CSS IntelliSense ≥ v0.14.3. The file is generated
+ gitignored (`setup.mjs` regenerates it), so it stays in sync with the tokens.

[tailwindcss-intellisense#665]: https://github.com/tailwindlabs/tailwindcss-intellisense/issues/665

## Coexistence rules & gotchas

- **Namespace isolation.** `nx:*` classes and `--nx-*` variables never collide
  with your own `bg-slate-*` / `--color-*`. This is what makes adoption
  incremental.
- **⚠️ Same property, one element.** `bg-slate-200 nx:bg-primary-background` on one
  node both set `background-color` — the winner is CSS **source order** (which
  stylesheet loads last), _not_ the className order. Rule: don't set the same
  property from both namespaces on one element; pick one.
- **Shared-name scales.** `rounded-lg`/`shadow-lg` (yours) and
  `nx:rounded-lg`/`nx:shadow-lg` (DS) are different classes and can render
  differently — that's fine at runtime, but it's why the single-build "preset"
  approach was rejected (it produced conflicting duplicate rules).
- **Dark mode.** The DS toggles dark via the `.dark` class; your app's default
  `dark:` uses the OS setting unless you point your dark variant at `.dark` too.
  Align them to share one switch.
- **Optional peers.** Components with heavy optional peers (Chart→`recharts`,
  Drawer→`vaul`, Carousel→`embla-carousel-react`, DatePicker→`react-day-picker`,
  Resizable→`react-resizable-panels`) aren't installed here; add the peer if you
  use those components. Everything else works out of the box.
- **Badge variants.** Badge uses status variants (`success`/`warning`/`error`),
  not Button's `outline`/`destructive` — a real API divergence.

## Publishing the exported design system

The generated `.generated/acme-design-system` is itself a publishable monorepo;
its own `README.md` documents the `pnpm --filter @acme/tailwind publish` →
`@acme/react publish` order. This bed publishes it to Verdaccio instead of real
npm via `setup.mjs`.
