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

The header has a toggle for each theme system: the app's `next-themes` and
the Nexus appearance provider.

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
   and the token CSS into `components/nexus/`.
2. `npm install` the packages it prints. Nexus imports single `@radix-ui/*`
   packages; shadcn uses the combined `radix-ui` package.
3. `app/nexus.css` imports the token CSS, `tw-animate-css` and the Progress
   keyframes. `app/layout.tsx` imports it after `globals.css`.
4. `app/layout.tsx` adds `NexusAppearanceScript`, `NexusAppearanceProvider`,
   Nexus's `TooltipProvider` and Nexus's `Toaster`.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/shadcn-app
```

It builds the app with and without Nexus and lists every host style that
changed. Today: **1,647 host properties** across the three pages.

| Host change | Cause |
| ----------- | ----- |
| Text, padding and radii shrink to seven-eighths (16 → 14px root) | `NexusAppearanceProvider` sets `:root { font-size: 14px }`. Every `rem` in the app shrinks |
| Border colours change | Nexus's global `*, ::before, ::after { border-color }` |
| Body text colour changes | Nexus's `body { color }` base rule |
| Button fonts change on some elements | Nexus's Tailwind brings its own Preflight |

## What else it found

| Finding | Where you see it |
| ------- | ---------------- |
| Unprefixed classes on a Nexus component lose. `className="w-48"` on `N.SelectTrigger` does nothing, because Nexus's own `nx:w-full` sets the same property and its CSS loads later. Use `nx:` classes on Nexus components | `/` |
| Nexus's `Tooltip` needs Nexus's `TooltipProvider`. The shadcn provider does not count: the two use different Radix packages | `app/layout.tsx` |
| Every toast shows twice. Both Toasters render on the same `sonner` store, so mount one | `/overlays` |
| Nexus controls overflow a shadcn dialog. The dialog's `rem` width shrank with the 14px root; Nexus's pixel sizes did not | `/overlays`, first dialog |
| Nexus cannot follow the Install page's layout here. It puts `lib/utils.ts` at the app root, which is shadcn's `cn` | `components/nexus/` |
