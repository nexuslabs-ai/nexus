# shadcn-app

An existing Next.js app built with shadcn/ui, after it copied nxds in beside
its own components. It shows whether the two design systems work on one page,
and what adding nxds changes in the app.

| Path | What it is |
| ---- | ---------- |
| `components/ui/` | The app's shadcn components, added with the shadcn CLI |
| `components/nxds/` | nxds, installed from this repository by `npm run nxds:add`. Committed, like a consumer would |
| `components/nxds-kit.ts` | Re-exports the nxds components so pages import them as `N.Button` |
| `app/nxds.css` | The nxds Tailwind entry, separate from `globals.css` |
| `nxds.json` | Which nxds components to copy, and what `check.mjs` visits |

## Pages

| Route | What it shows |
| ----- | ------------- |
| `/` | Every component from both systems, row by row: buttons, badges, inputs, select, checkbox, switch, radio, tabs, card, alert, avatar, progress, table, tooltip, menu, popover, dialog |
| `/settings` | A shadcn settings page with nxds sections dropped in: an nxds notifications card, an nxds table inside a shadcn card, an nxds dialog |
| `/overlays` | A shadcn dialog holding nxds select, popover, menu and tooltip, and the reverse. Toasts from both systems |

The header's theme switch drives both theme systems: the app's `next-themes`
and the nxds appearance provider.

## Run it

```bash
cd examples/shadcn-app
npm ci
npm run build
npm start
```

After changing nxds source or tokens, run `npm run nxds:add`. `git diff`
then shows what changed for consumers.

## How the app added nxds

1. `npm run nxds:add` runs the local `nxds update`, which copies each
   component's files, the appearance provider and the token CSS into
   `components/nxds/`. It then installs `@nxds/core` from `packages/core`.
2. `npm install` the packages it prints. nxds imports single `@radix-ui/*`
   packages; shadcn uses the combined `radix-ui` package.
3. `app/nxds.css` imports the token CSS, `tw-animate-css` and the Progress
   keyframes. `app/layout.tsx` imports it after `globals.css`, which keeps its
   own `@import "tailwindcss"`.
4. `app/layout.tsx` adds `NxdsAppearanceScript`, `NxdsAppearanceProvider` and
   nxds's `Toaster`.
5. The header's theme switch sets both `next-themes` and the nxds provider, so
   they agree on the shared `.dark` class.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/shadcn-app
```

It builds the app with and without nxds and lists every host style that
changed. Today: **0 host changes** across the three pages.

On nxds components, the pages use `nx:` classes. An unprefixed class like
`w-48` sets the same property as the component's own `nx:` class, and nxds's
stylesheet loads later, so it would lose.
