# Copy-and-own fixtures — contract and findings (#795)

Two disposable host apps prove that Nexus source can be copied into a
project someone else owns, through a shadcn registry or by hand, and still
compile, build and leave the host alone. This file is the contract those
fixtures pin and the evidence behind it. #796 (CSS scoping), #797 (core
release) and #798 (catalog + CI) build on it.

| Fixture | Host shape |
| ------- | ---------- |
| [`../copy-vite`](../copy-vite) | An existing app: Vite 8, shadcn `radix-nova`, its own Button, Card and `cn`, a `~/` alias, and non-inline host `@theme` tokens |
| [`../copy-next`](../copy-next) | A fresh app: Next 16 App Router, default `@/` alias, `rsc: true` |

Pinned: Node 24.12.0, npm 11.6.2, shadcn 4.21.0, Tailwind 4.3.3, Vite 8.3.1,
Next 16.3.6, `@nexus_ds/core` 0.4.0 from npm. Both fixtures install with npm
and commit their lockfile, so neither resolves the pnpm workspace. The
findings were recorded against `main` at `a5176e306`; the recipe probe
(Findings 5 and 6) used the #809 tree at `466db93b6`.

## Run it

```bash
node examples/registry/build.mjs
python3 -m http.server 4400 -d examples/registry/.generated
```

Then, in `examples/copy-vite` or `examples/copy-next`:

```bash
npm install
npm run nexus:add
npm run build
```

`build.mjs` regenerates the docs dependency closures, writes the
no-Preflight stylesheet entry and runs `shadcn build`. The installed
`components/nexus/` tree is gitignored: every run reinstalls from the
current source, so the fixtures never hold a second copy that drifts.

## Contract

### Item shape

- Every Nexus file ships as **`registry:file`** with an explicit target.
  The CLI copies it byte for byte. `registry:component` runs source
  transforms instead: it rewrites `@/` imports to the host alias and drops
  a leading file comment when the first statement is not a directive
  (seen on `lib/icons.ts` and `progress.css`).
- Target rule: **`@components/nexus/` + the path relative to
  `packages/react/src`**. The tree keeps its shape, so Nexus's relative
  imports (`../../lib/utils`) resolve unchanged in any host alias. Never
  `@ui/`, `@lib/` or `@hooks/`: those land in folders the host already
  owns.
- Nexus source uses **relative imports only**. A `registry:file` with an
  `@/` import fails to typecheck in a `~/` host (probe item
  `transform-probe`).
- **Inline closures, no `registryDependencies`.** Each item carries every
  file it imports; shared files such as `lib/utils.ts` arrive identical
  from every item and are skipped. A bare name
  (`registryDependencies: ["utils"]`) resolves to the default shadcn
  registry and targets the host's own `lib/utils.ts` (item
  `button-bare-dependency`). Namespaced `@nexus/…` dependencies would
  work but add a second resolution path with no benefit while closures
  are small.
- npm dependencies come from the closure with `@nexus_ds/react`'s declared
  ranges. `@nexus_ds/core` is the only Nexus package a copied tree
  installs; `@nexus_ds/react` never resolves in either fixture.
- **One catalog, one revision.** Items built from different revisions
  collide on shared files. See Findings 5 and 6.

### Manual route

Copy the same files to `<components dir>/nexus/<path relative to
packages/react/src>` and install the listed npm dependencies. With
`registry:file` the two routes produce byte-identical trees. The registry
is a convenience, not a requirement; if it is unavailable the manual route
is the fallback.

### Collisions

| Situation | CLI behaviour (4.21.0) |
| --------- | ---------------------- |
| Incoming file identical to the installed one | Skipped silently |
| Differs, `--yes` without `--overwrite` | Prompts anyway; non-TTY stdin answers No, the edit is kept, and **files earlier in the item have already been written** |
| Differs, `--overwrite` | Replaced silently |
| Host files outside `components/nexus/` | Never touched (hashes before and after match in both fixtures) |

### Stylesheet

The `styles` item delivers `components/nexus/nexus.css`: the generated
theme with `@import 'tailwindcss' prefix(nx)` replaced by

```css
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme) prefix(nx);
@import 'tailwindcss/utilities.css' layer(utilities) prefix(nx) source(none);
@source './';
```

plus `tw-animate-css` and every component's co-located CSS
(`progress.css`), because a fixed entry cannot `@import` a file the host
may not have installed. The host imports it after its own stylesheet.
Result:

- Two CSS chunks, each emitted once. The Nexus chunk has no Preflight and
  no host classes; every one of the 187 `nx:` classes the copied tree uses is emitted.
  Removing `@source` drops them (negative control).
- `nx:` classes written **outside** `components/nexus/` are not emitted.
  Host code styles its own layout with host utilities.
- The host must load Tailwind 4 Preflight (every Tailwind or shadcn app
  does). The `nx:` prefix keeps class names apart, but Nexus relies on
  Preflight to remove the browser's element defaults.
- Never use the registry `css` / `cssVars` fields: they write into the
  host's stylesheet, which is a different Tailwind compilation without
  `prefix(nx)`.

### `'use client'`

Importing Nexus straight into a Server Component fails at prerender in
`components/button/button.tsx`, `components/button-group/button-group-context.ts`
and `components/dialog/dialog.tsx`. Adding the directive to those three
makes a Server Component page build and run (Dialog and Popover open,
Progress animates). Card, Popover and Progress are server-safe because
Radix ships its own directives. `copy-next` keeps a client boundary
(`app/nexus-demo.tsx`) until #796 adds them.

## Findings

Probed with `getComputedStyle` on production builds (`vite preview`,
`next start`) against a `?no-nexus` baseline; `copy-vite` has
`?nexus-first`, `?nexus-only` and `?provider` modes for the rows below.

| # | Finding | Owner |
| - | ------- | ----- |
| 1 | **Unprefixed `--color-*` aliases clobber host tokens.** Nexus declares 107 `--color-*` on `:root`, unlayered. A host with non-inline `@theme` tokens of the same name (`--color-success-foreground`) loses them in either load order — the host's "Saved" text turns white. Only three Nexus rules read the aliases (the base border, body color, body background); utilities read `--nx-color-*` with inline fallbacks. | #796 |
| 2 | **Global base rules leak by load order.** Nexus's `*, ::before, ::after { border-color }` and `body { color; background }` share `@layer base` with the host's; whichever stylesheet loads last wins. Nexus last: every host border and the host body text change. | #796 |
| 3 | **`color-scheme` is global.** `:root:not(.dark) { color-scheme: light }` switches a host that declares none from `normal` to `light`, which restyles its form controls and scrollbars. | #796 |
| 4 | **The appearance provider rewrites the host document.** It sets `data-density` / `data-radius` / `data-shadow` / `data-borderwidth` and an inline `color-scheme` on `<html>`, adds two `<style>` tags and a `color-scheme` meta, toggles `html.dark`, and its prefs style sets `:root { font-size: 14px }` — which rescales every host `rem` (host text 16 → 14px, padding 20 → 17.5px, radii shrink). | #796 |
| 5 | **Shared files skew across revisions.** An item built from #809's tree ships a `lib/utils.ts` that differs from main's (a pre-#765 token name), so installing it next to main's items stops at an overwrite prompt. | #798 |
| 6 | **Skew between the stylesheet and components fails silently.** #809-era checkbox styles use `nx:…border-border-error`, which main's stylesheet no longer emits. Typecheck and build pass; the error borders vanish. Only a class-completeness check catches it — run `audit:class-refs` (#790) over the installed fixture trees in CI. | #798 |
| 7 | **Nexus follows a host `.dark` ancestor.** The `.dark` token block and `@custom-variant dark (&:is(.dark *))` match any host `.dark`, so Nexus surfaces go dark with the host. Without the provider, the primary Button stays near-black in dark (its `--nx-color-primary-background` default exists only as a self-reference plus `.dark`). | #796 |
| 8 | **Portals inherit from the host `<body>`.** Dialog and Popover render into `document.body`, so they take the host's font, size and line-height. Nexus also mixes fonts: Button sets its own family, Card text inherits the host's. | #796 |
| 9 | **Nexus needs Preflight.** With host CSS removed (`?nexus-only`), CardTitle (`<h3>`) gains 18px UA margins, `box-sizing` falls back to `content-box`, text falls back to Times and Progress loses its border style. **Decision (2026-09-29): hosts must have Tailwind 4 Preflight**; Nexus ships none. Both fixtures have it. | Contract |
| 10 | **shadcn 4.21.0 ships `cn` as an npm package** (`shadcn-ui/cn`); host `lib/utils.ts` is `export { cn } from "cn"`. Nexus's `cn` is a custom `tailwind-merge` config that knows `nx:`, so Nexus ships its own `lib/utils.ts` and never imports the host's. | Contract |

### Scoped-root prototype

Hand-editing the installed `nexus.css` in `copy-vite` removed every host
leak from Findings 1–3 (27 changed host properties → 0) with no change to
Nexus rendering:

- delete the unprefixed `--color-*` alias block;
- scope the base rules to `:where([data-nexus-root], [data-nexus-root] *, …)`
  and `color-scheme` to `[data-nexus-root]`;
- give the base rules an explicit default: `--nx-color-border-default` is
  declared nowhere, because Nexus defaults exist only as inline fallbacks.
  #796 needs a Nexus-owned default namespace, so utilities read
  `var(--nx-color-X, var(--nx-default-color-X))` and the provider's
  `:root` overrides still win. Declaring `--nx-color-*` on the root
  element instead would shadow them;
- put `data-nexus-root` on portal content (Dialog, Popover); otherwise
  portalled surfaces lose Nexus text color and `color-scheme`.

Finding 4 (the provider) and Finding 7 (dark coupling) need component and
provider changes, not stylesheet edits.
