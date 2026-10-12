# examples

Real apps that adopt Nexus the copy-and-own way: each one copies Nexus source
from this repository and compiles it with its own Tailwind. Together they cover
the ways a frontend team meets Nexus.

> Not part of the pnpm workspace, and excluded from the monorepo's turbo,
> ESLint and Prettier. Each app installs with npm and commits its lockfile.

| Example | The team | Where Nexus lives |
| ------- | -------- | ----------------- |
| [`nexus-app`](nexus-app) | Starts a new app on Nexus. Next.js, no other component library | The app |
| [`shadcn-app`](shadcn-app) | Has a Next.js app built with shadcn/ui | The app, beside `components/ui` |
| [`shadcn-package`](shadcn-package) | Has its own shadcn-based design-system package | The package (`app-via-package`), or the app beside the package (`app-direct`) |
| [`mui-app`](mui-app) | Has a Vite app built with Material UI and no Tailwind | The app |

Each coexistence example shows the same three pages: every component from both
systems side by side, a settings page that mixes them, and each system's dialog
holding the other's overlays.

## Shared scripts

| Script | What it does |
| ------ | ------------ |
| `scripts/sync-nexus.mjs` | Copies Nexus into an app, as the Install page describes. Each app runs it as `npm run nexus:add`, driven by its `nexus.json` |
| `scripts/check.mjs` | Builds an app with and without Nexus and lists every host style that adding Nexus changed |

After changing Nexus components or tokens, run `npm run nexus:add` in each app.
`git diff` then shows exactly what changes for a consumer.

```bash
node examples/scripts/check.mjs examples/shadcn-app
```

## What the coexistence examples find

| Finding | Seen in |
| ------- | ------- |
| `NexusAppearanceProvider` sets `:root { font-size: 14px }`, so every host `rem` shrinks by an eighth | All three |
| Nexus's global `border-color`, `body { color }` and Preflight restyle host elements; Preflight replaces the host font unless a class on `<html>` sets it | All three |
| Nexus controls overflow a shadcn dialog, whose `rem` width shrank with the 14px root | `shadcn-app`, `shadcn-package` |
| Unprefixed classes on a Nexus component lose to its own `nx:` classes | `shadcn-app`, `shadcn-package` |
| Nexus's Tooltip needs Nexus's `TooltipProvider`; both Toasters render every toast | `shadcn-app`, `shadcn-package` |
| Nexus popups (z-index 70) open behind an MUI dialog (1300); a Nexus dialog sits under MUI's AppBar; MUI menus inside a Nexus dialog cannot be clicked | `mui-app` |
| A package must ship its Tailwind entries with `@source`, because Tailwind skips `node_modules` | `shadcn-package` |

Each example's README has its numbers and where to look.
