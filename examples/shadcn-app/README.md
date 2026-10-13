# shadcn-app

An existing Next.js app built with shadcn/ui, after it copied Nexus in beside
its own components. It shows whether the two design systems work on one page,
and what adding Nexus changes in the app.

| Path | What it is |
| ---- | ---------- |
| `components/ui/` | The app's shadcn components, added with the shadcn CLI |
| `components/nexus/` | Nexus, copied from this repository by `npm run nexus:add`. Committed, like a consumer would |
| `components/nexus-kit.ts` | Re-exports the Nexus components so pages import them as `N.Button` |
| `app/nexus.css` | The Nexus Tailwind entry, separate from `globals.css` |
| `nexus.json` | Which Nexus components to copy, and what `check.mjs` visits |

## Pages

| Route | What it shows |
| ----- | ------------- |
| `/` | Every component from both systems, row by row: buttons, badges, inputs, select, checkbox, switch, radio, tabs, card, alert, avatar, progress, table, tooltip, menu, popover, dialog |
| `/settings` | A shadcn settings page with Nexus sections dropped in: a Nexus notifications card, a Nexus table inside a shadcn card, a Nexus dialog |
| `/overlays` | A shadcn dialog holding Nexus select, popover, menu and tooltip, and the reverse. Toasts from both systems |

The header's theme switch drives both theme systems: the app's `next-themes`
and the Nexus appearance provider.

## Run it

```bash
cd examples/shadcn-app
npm ci
npm run build
npm start
```

After changing Nexus source or tokens, run `npm run nexus:add`. `git diff`
then shows what changed for consumers.

## How the app added Nexus

1. `npm run nexus:add` copies each component's files, the appearance provider
   and the token CSS into `components/nexus/`, and installs `@nexus_ds/core` from
   `packages/core`.
2. `npm install` the packages it prints. Nexus imports single `@radix-ui/*`
   packages; shadcn uses the combined `radix-ui` package.
3. `app/nexus.css` imports the token CSS, `tw-animate-css` and the Progress
   keyframes. `app/layout.tsx` imports it after `globals.css`, which keeps its
   own `@import "tailwindcss"`.
4. `app/layout.tsx` adds `NexusAppearanceScript`, `NexusAppearanceProvider` and
   Nexus's `Toaster`.
5. The header's theme switch sets both `next-themes` and the Nexus provider, so
   they agree on the shared `.dark` class.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/shadcn-app
```

It builds the app with and without Nexus and lists every host style that
changed. Today: **0 host changes** across the three pages.

On Nexus components, the pages use `nx:` classes. An unprefixed class like
`w-48` sets the same property as the component's own `nx:` class, and Nexus's
stylesheet loads later, so it would lose.
