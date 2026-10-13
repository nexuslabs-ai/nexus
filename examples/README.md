# examples

Real apps that adopt Nexus the copy-and-own way: each one copies Nexus source
from this repository and compiles it with its own Tailwind. Together they cover
the ways a frontend team meets Nexus.

> Not part of the pnpm workspace, and excluded from the monorepo's turbo,
> ESLint and Prettier. Each app installs with npm and commits its lockfile.

| Example | The team | Where Nexus lives |
| ------- | -------- | ----------------- |
| [`nexus-app`](nexus-app) | Starts a new Next.js app on Nexus | The app |
| [`shadcn-app`](shadcn-app) | Has a Next.js app built with shadcn/ui | The app, beside `components/ui` |
| [`shadcn-package`](shadcn-package) | Has its own shadcn-based design-system package | The package (`app-via-package`), or the app beside the package (`app-direct`) |
| [`mui-app`](mui-app) | Has a Vite app built with Material UI and no Tailwind | The app |

Each app installs `@nexus_ds/core` from `packages/core` (`file:` with
`install-links`), so the examples always run this repository's engine.

The examples copy Nexus by hand, as the Install page describes. Delivery through
a shadcn registry, and running these examples in CI, are tracked in #798.

## Shared scripts

| Script | What it does |
| ------ | ------------ |
| `scripts/sync-nexus.mjs` | Copies Nexus into an app as the Install page describes, then rebuilds and reinstalls `packages/core`. Each app runs it as `npm run nexus:add`, driven by its `nexus.json` |
| `scripts/check.mjs` | Builds an app with and without Nexus and lists every host style that adding Nexus changed |

After changing Nexus components, tokens or the engine, run `npm run nexus:add`
in each app. `git diff` then shows exactly what changes for a consumer.

```bash
node examples/scripts/check.mjs examples/shadcn-app
```

## What they show

Adding Nexus changes **0** of the host app's own styles in every coexistence
example. Nexus emits only `nx:` utilities and `--nx-*` variables, and each
component resets the browser defaults it relies on.

| App | Host properties changed |
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
| Nexus overlay layers raised above MUI's | `mui-app/src/nexus.css` |
| MUI popups inside a Nexus dialog render in place (`disablePortal`) | `mui-app` `/overlays` |
| A package ships its Tailwind entries with `@source './'` | `shadcn-package/ui` |
| `nx:` classes on Nexus components | Every page |
