# mui-app

An existing Vite app built with Material UI, after it copied Nexus in beside
its own components. MUI styles with CSS-in-JS and has no Tailwind, so adding
Nexus brings Tailwind into the app for the first time.

| Path | What it is |
| ---- | ---------- |
| `src/components/nexus/` | Nexus, copied from this repository by `npm run nexus:add`. Committed |
| `src/components/nexus-kit.ts` | Re-exports the Nexus components so pages import them as `N.Button` |
| `src/nexus.css` | The Nexus Tailwind entry, the app's only CSS file |
| `src/appearance-state.ts` | The default Nexus appearance, shared by the provider and the first-paint script |
| `vite.config.ts` | Adds `@tailwindcss/vite` and injects the first-paint script with `transformIndexHtml` |
| `nexus.json` | Which Nexus components to copy, and what `check.mjs` visits |

## Pages

| Route | What it shows |
| ----- | ------------- |
| `/` | Every component from both systems, row by row |
| `/settings` | An MUI settings page with Nexus sections dropped in |
| `/overlays` | An MUI dialog holding Nexus select, popover, menu and tooltip, and the reverse. MUI's Snackbar beside Nexus's toast |

The app bar's theme switch drives both theme systems: MUI's `useColorScheme`
and the Nexus appearance provider. MUI uses `colorSchemeSelector: 'class'`, so
both share the `.dark` class on `<html>`.

## Run it

```bash
cd examples/mui-app
npm ci
npm run build
npx vite preview
```

After changing Nexus source or tokens, run `npm run nexus:add`.

## How the app added Nexus

1. `npm run nexus:add` copies the components, provider and token CSS into
   `src/components/nexus/`, and installs `@nexus_ds/core` from `packages/core`.
2. `npm install tailwindcss @tailwindcss/vite tw-animate-css` and the packages
   the copy prints. MUI's `CssBaseline` stays the app's reset; Nexus brings no
   Preflight.
3. `src/nexus.css` imports the token CSS, `tw-animate-css` and the Progress
   keyframes, and raises Nexus's overlay layers above MUI's.
   `src/main.tsx` imports it.
4. `src/main.tsx` wraps the app in the Nexus provider. `vite.config.ts` injects
   the first-paint script, as the Theme setup page's Vite section describes.
5. MUI popups opened from inside a Nexus dialog use `disablePortal`. A Nexus
   dialog blocks pointer events outside itself, so a popup portalled to
   `<body>` could not be clicked.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/mui-app
```

Today: **0 host changes** across the three pages.
