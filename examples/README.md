# examples

Real apps that adopt nxds the copy-and-own way: each one copies nxds source
from this repository and compiles it with its own Tailwind. Together they cover
the ways a frontend team meets nxds.

> Not part of the pnpm workspace, and excluded from the monorepo's turbo,
> ESLint and Prettier. Each app installs with npm and commits its lockfile.

| Example | The team | Where nxds lives |
| ------- | -------- | ----------------- |
| [`nxds-app`](nxds-app) | Starts a new Next.js app on nxds | The app |
| [`shadcn-app`](shadcn-app) | Has a Next.js app built with shadcn/ui | The app, beside `components/ui` |
| [`shadcn-package`](shadcn-package) | Has its own shadcn-based design-system package | The package (`app-via-package`), or the app beside the package (`app-direct`) |
| [`mui-app`](mui-app) | Has a Vite app built with Material UI and no Tailwind | The app |
| [`react18-app`](react18-app) | Has a Vite app on React 18.3 | The app, as the React 18 files |

Each app installs `@nxds/core` from `packages/core` (`file:` with
`install-links`), so the examples always run this repository's engine.

The examples get nxds through the local `nxds` CLI, as a consumer would.
Each app's `nxds.json` is the CLI's config, plus the `check` settings
`scripts/check.mjs` reads.

## Shared scripts

| Script | What it does |
| ------ | ------------ |
| `scripts/sync-nxds.mjs` | Runs the local `nxds update` for the items in the app's `nxds.json`, then rebuilds and reinstalls `packages/core`. Each app runs it as `npm run nxds:add` |
| `scripts/check.mjs` | Builds an app with and without nxds and lists every host style that adding nxds changed |

After changing nxds components, tokens or the engine, run `npm run nxds:add`
in each app. `git diff` then shows exactly what changes for a consumer.

```bash
node examples/scripts/check.mjs examples/shadcn-app
```

## What they show

Adding nxds changes **0** of the host app's own styles in every coexistence
example. nxds emits only `nx:` utilities and `--nx-*` variables, and each
component resets the browser defaults it relies on.

| App | Host changes |
| --- | ----------------------- |
| `shadcn-app` | 0 |
| `mui-app` | 0 |
| `shadcn-package/app-via-package` | 0 |
| `shadcn-package/app-direct` | 0 |

The appearance provider's reduce motion, pointer cursor and font smoothing
toggles are off by default. When a user turns one on, it applies to the whole
page, host included.

The apps also show the integration points a team has to wire:

| Point | Where |
| ----- | ----- |
| One theme switch sets both systems, since they share the `.dark` class | Every coexistence app's header |
| Each Toaster shows only its own system's toasts | `/overlays` |
| nxds overlay layers raised above MUI's | `mui-app/src/nxds.css` |
| MUI popups inside an nxds dialog render in place (`disablePortal`) | `mui-app` `/overlays` |
| A package ships its Tailwind entries with `@source './'` | `shadcn-package/ui` |
| `nx:` classes on nxds components | Every page |
