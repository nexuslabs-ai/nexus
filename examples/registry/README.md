# Copy-and-own fixtures — contract and findings (#795, #796)

Two disposable host apps prove that Nexus source can be copied into a
project someone else owns, through a shadcn registry or by hand, and still
compile, build and leave the host alone. This file is the contract those
fixtures pin and the evidence behind it. #795 recorded the findings; #796
scoped Nexus to a root element and fixed the host leaks; #797 (core release)
and #798 (catalog + CI) build on it.

| Fixture | Host shape |
| ------- | ---------- |
| [`../copy-vite`](../copy-vite) | An existing app: Vite 8, shadcn `radix-nova`, its own Button, Card and `cn`, a `~/` alias, and non-inline host `@theme` tokens |
| [`../copy-next`](../copy-next) | A fresh app: Next 16 App Router, default `@/` alias, `rsc: true` |

Pinned: Node 24.12.0, npm 11.6.2, shadcn 4.21.0, Tailwind 4.3.3, Vite 8.3.1,
Next 16.3.6. `@nexus_ds/core` installs from a pack of the local package
(`registry/.generated/nexus_ds-core-<version>.tgz`), so the fixtures test
the current source; `node examples/registry/build.mjs --npm-core` pins the
published version instead. Both fixtures install with npm and commit their
lockfile. Run them only from a copy **outside the repository**: the root
`.npmrc` sets `node-linker=hoisted`, so an in-tree fixture silently
resolves any package it lacks from the monorepo's `node_modules` (and
copy-next picks up the root `@types`). The findings were recorded against
`main` at `a5176e306`; the recipe probe (Findings 5 and 6) used the #809
tree at `466db93b6`.

## Run it

```bash
node examples/registry/build.mjs
python3 -m http.server 4400 -d examples/registry/.generated
```

Then copy each fixture out of the repository, next to a copy of the
registry output so the core pack's `../registry/.generated/` path still
resolves, and run it there:

```bash
mkdir -p "$TMPDIR/nexus-fixtures/registry"
cp -R examples/registry/.generated "$TMPDIR/nexus-fixtures/registry/"
cp -R examples/copy-vite "$TMPDIR/nexus-fixtures/"
cd "$TMPDIR/nexus-fixtures/copy-vite"
npm ci
npm run nexus:add
npm run typecheck
npm run build
```

`build.mjs` clears `.generated/`, regenerates the docs dependency
closures, packs the local core, writes the copied stylesheet entry and runs
`shadcn build`. `nexus:add` deletes the installed `components/nexus/` tree
(gitignored) and installs every item from the registry without
`--overwrite`, so a file dropped from a closure disappears instead of
lingering. It also runs `npm install` for the closures' dependencies: while
the committed ranges cover them, `package.json` and `package-lock.json`
stay unchanged (hashes match in both fixtures); a closure that adds or
raises a dependency rewrites both. #798's CI lockfile check owns catching
that.

## Contract

### Nexus root

Nexus styles apply only inside an element marked `data-nexus-root`:

- **Embedded** (both fixtures): `NexusRoot` renders the root element with
  `data-nexus-root="<key>"`, `data-nx-mode` and `data-nx-density` /
  `-radius` / `-shadow` / `-borderwidth`, plus a `<style>` scoped to that key.
  The host passes the appearance with `mode` already resolved to `light` or
  `dark`; the root writes nothing to `<html>`, storage, cookies or meta.
  `copy-next` renders it on the server from a host-owned cookie, so the first
  paint is already in the right mode.
- **Standalone** (the docs site): `NexusAppearanceProvider` and its
  bootstrap script make `<html>` the root, keyed `document`.
- Portalled surfaces (Dialog, Popover, menus, tooltips, Sonner's toaster)
  copy the nearest root's attributes, so they keep its tokens and mode.
- A root without runtime CSS still renders: the generated CSS declares
  `--nx-default-color-*` on every root, light and dark, and utilities read
  `var(--nx-color-X, var(--nx-default-color-X))`.

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
- **Inline closures; `@nexus/styles` is the only registry dependency.**
  Each item carries every file it imports; shared files such as
  `lib/utils.ts` arrive identical from every item and are skipped. Every
  item declares `registryDependencies: ["@nexus/styles"]` (#798), so
  installing any item brings the stylesheet. Dependencies are always
  namespaced: a bare name (`registryDependencies: ["utils"]`) resolves to
  the default shadcn registry and targets the host's own `lib/utils.ts`
  (item `button-bare-dependency`).
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
| Differs, `--yes` without `--overwrite` | Prompts anyway; non-TTY stdin answers No, the edit is kept, and **files earlier in the item have already been written**. `nexus:add` clears the tree first, so the fixtures never reach this path |
| Differs, `--overwrite` | Replaced silently |
| Host files outside `components/nexus/` | Never touched (hashes before and after match in both fixtures) |

### Stylesheet

The `styles` item delivers `components/nexus/nexus.css`: the generated
theme, which already imports only Tailwind's theme and utilities with
`prefix(nx)` (no Preflight), with the utilities import narrowed to the copied
tree:

```css
@import 'tailwindcss/utilities.css' layer(utilities) prefix(nx) source(none);
@source './';
```

plus `tw-animate-css` and the co-located CSS from every closure's
`styles` (today `progress.css`), because a fixed entry cannot `@import` a
file the host may not have installed. The tailwind parts come from
`nexus.css`'s own `@import` list. The host imports it after its own stylesheet.
Result:

- Two CSS chunks, each emitted once. The Nexus chunk has no Preflight and
  no host classes; every one of the 187 `nx:` classes the copied tree uses
  is emitted, in both fixtures (`probe/class-completeness.mjs`). Removing
  `@source` drops them; pointing the check at the host chunk reports them
  missing (negative controls).
- `nx:` classes written **outside** `components/nexus/` are not emitted.
  Host code styles its own layout with host utilities.
- The host must load Tailwind 4 Preflight (every Tailwind or shadcn app
  does). The `nx:` prefix keeps class names apart, but Nexus relies on
  Preflight to remove the browser's element defaults.
- Never use the registry `css` / `cssVars` fields: they write into the
  host's stylesheet, which is a different Tailwind compilation without
  `prefix(nx)`.

### Variable names under `prefix(nx)`

`prefix(nx)` renames every `@theme` variable, so Nexus's static scales land
in the same `--nx-*` namespace as its runtime blocks. Compiled with the
fixtures' Tailwind 4.3.3 (`vite build` output):

| Scale | Declaration in `nexus.css` | Emitted in `@layer theme` (`:root, :host`) | Utility | Runtime writer |
| ----- | -------------------------- | ------------------------------------------ | ------- | -------------- |
| Spacing | `@theme { --spacing-4: 16px }` | `--nx-spacing-4: 16px` | `nx:px-4` → `padding-inline: var(--nx-spacing-4)` | unlayered `:root, [data-density=…] { --nx-spacing-4 }`, same name |
| Radius | `@theme { --radius-md: var(--nx-radius-md) }` | `--nx-radius-md: var(--nx-radius-md)`, a self-reference | `nx:rounded-md` → `border-radius: var(--nx-radius-md)` | unlayered `:root, [data-radius=…] { --nx-radius-md }`, same name |
| Text | `@theme { --text-*: initial }`, nothing declared | nothing | `nx:typography-*` read `--nx-typography-*` | unlayered `:root` in `variables.css` |
| Easing | `@theme { --ease-enter: var(--nx-motion-ease-enter) }` | `--nx-ease-enter: var(--nx-motion-ease-enter)` | `nx:ease-enter` → `var(--nx-ease-enter)` | none; resolves at `:root` |

**Decision: one `--nx-*` namespace.** The collision is what makes runtime
density and corners work: the runtime blocks are unlayered, so they beat
the `@layer theme` declaration of the same name, and utilities read the
winner. The spacing `@theme` values equal the `default` density, so they
are only a static fallback. The radius entry is a cycle that is harmless
only while the unlayered block matches `:root`; once #796 scopes runtime
blocks to a root element, entries that reference another variable
(radius, easing) move to `@theme inline` so utilities read the runtime
variable directly. Host `@theme` names are unprefixed (`--spacing-gutter`,
`--radius-panel`) and never meet `--nx-*`; the only host collision is
Finding 1.

### `'use client'`

#795 found that importing Nexus straight into a Server Component failed at
prerender in `button.tsx`, `button-group-context.ts` and `dialog.tsx`. #796
added the directive to those three and to every overlay that now reads the
root context, so `copy-next` imports Nexus straight into its Server
Component page.

## Findings

Probed with `getComputedStyle` on production builds (`vite preview`,
`next start`) against a `?no-nexus` baseline; `copy-vite` has
`?nexus-first`, `?nexus-only` and `?provider` modes for the rows below.
`probe/compare-styles.mjs` reads 17 properties on `<html>`, `<body>` and
every `[data-probe]` element, opening Dialog and Popover for their
portalled probes. Against `?no-nexus`, copy-vite changes 30 host
properties with Nexus loaded after the host, 16 with `?nexus-first` and 70
with `?provider`.

| # | Finding | Owner |
| - | ------- | ----- |
| 1 | **Unprefixed `--color-*` aliases clobber host tokens.** Nexus declares 107 `--color-*` on `:root`, unlayered. A host with non-inline `@theme` tokens of the same name (`--color-success-foreground`) loses them in either load order — the host's "Saved" text turns white. Only three Nexus rules read the aliases (the base border, body color, body background); utilities read `--nx-color-*` with inline fallbacks. | Fixed in #796 |
| 2 | **Global base rules leak by load order.** Nexus's `*, ::before, ::after { border-color }` and `body { color; background }` share `@layer base` with the host's; whichever stylesheet loads last wins. Nexus last: every host border and the host body text change. | Fixed in #796 |
| 3 | **`color-scheme` is global.** `:root:not(.dark) { color-scheme: light }` switches a host that declares none from `normal` to `light`, which restyles its form controls and scrollbars. | Fixed in #796 |
| 4 | **The appearance provider rewrites the host document.** It sets `data-density` / `data-radius` / `data-shadow` / `data-borderwidth` and an inline `color-scheme` on `<html>`, adds two `<style>` tags and a `color-scheme` meta, toggles `html.dark`, and its prefs style sets `:root { font-size: 14px }` — which rescales every host `rem` (host text 16 → 14px, padding 20 → 17.5px, radii shrink). | Fixed in #796 |
| 5 | **Shared files skew across revisions.** An item built from #809's tree ships a `lib/utils.ts` that differs from main's (a pre-#765 token name), so installing it next to main's items stops at an overwrite prompt. | #798 |
| 6 | **Skew between the stylesheet and components fails silently.** #809-era checkbox styles use `nx:…border-border-error`, which main's stylesheet no longer emits. Typecheck and build pass; the error borders vanish. Only a class-completeness check catches it — run `audit:class-refs` (#790) over the installed fixture trees in CI. | #798 |
| 7 | **Nexus follows a host `.dark` ancestor.** The `.dark` token block and `@custom-variant dark (&:is(.dark *))` match any host `.dark`, so Nexus surfaces go dark with the host. Without the provider, the primary Button stays near-black in dark (its `--nx-color-primary-background` default exists only as a self-reference plus `.dark`). | Fixed in #796 |
| 8 | **Portals inherit from the host `<body>`.** Dialog and Popover render into `document.body`, so they take the host's font, size and line-height. Nexus also mixes fonts: Button sets its own family, Card text inherits the host's. | Fixed in #796 |
| 9 | **Nexus needs Preflight.** With host CSS removed (`?nexus-only`), CardTitle (`<h3>`) gains 18px UA margins, `box-sizing` falls back to `content-box`, text falls back to Times and Progress loses its border style. **Decision (2026-09-29): hosts must have Tailwind 4 Preflight**; Nexus ships none. Both fixtures have it. | Contract |
| 10 | **shadcn 4.21.0 ships `cn` as an npm package** (`shadcn-ui/cn`); host `lib/utils.ts` is `export { cn } from "cn"`. Nexus's `cn` is a custom `tailwind-merge` config that knows `nx:`, so Nexus ships its own `lib/utils.ts` and never imports the host's. | Contract |
| 11 | **Runtime appearance reaches `nx:` utilities.** Under `?provider`, the `appearance-mode` control changes 42 Nexus probe properties (every surface, text and border colour, including the open Dialog and Popover) and `appearance-density` changes 8 (button padding 12 → 10px, Dialog and Popover padding). Both also carry Finding 4's host side effects. | Contract |

### Verified after #796

Probed with `getComputedStyle` on the production builds:

- **Host leaks: 27 → 0.** `copy-vite` with Nexus CSS loaded after the
  host's and before it: every host property matches the `?no-nexus`
  baseline.
- **Nexus is load-order independent.** All 19 Nexus probes, including the
  open Dialog and Popover and their borders, match between the two orders.
- **Portals keep the root.** The Dialog carries the panel's key and mode,
  and follows a mode change while open.
- **Defaults without runtime CSS.** A bare `data-nexus-root` /
  `data-nx-mode="dark"` element renders the primary Button with the dark
  default (#795 Finding 7 found it near-black).
- **Host themes are ignored.** A host `.dark` ancestor or
  `<html data-theme="dark">` (`?data-theme`) leaves Nexus light.
- **Server-rendered appearance.** `copy-next` with a `dark` cookie serves
  `data-nx-mode="dark"` and the root's scoped `<style>` in the HTML, hydrates
  with no console warnings, and paints dark again after a reload.
- **Class completeness.** Every `nx:` class the copied tree uses is emitted.
