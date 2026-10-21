# mui-app

An existing Vite app built with Material UI, after it copied nxds in beside
its own components. MUI styles with CSS-in-JS and has no Tailwind, so adding
nxds brings Tailwind into the app for the first time.

| Path | What it is |
| ---- | ---------- |
| `src/components/nxds/` | nxds, copied from this repository by `npm run nxds:add`. Committed |
| `src/components/nxds-kit.ts` | Re-exports the nxds components so pages import them as `N.Button` |
| `src/nxds.css` | The nxds Tailwind entry, the app's only CSS file |
| `src/appearance-state.ts` | The default nxds appearance, shared by the provider and the first-paint script |
| `vite.config.ts` | Adds `@tailwindcss/vite` and injects the first-paint script with `transformIndexHtml` |
| `nxds.json` | Which nxds components to copy, and what `check.mjs` visits |

## Pages

| Route | What it shows |
| ----- | ------------- |
| `/` | Every component from both systems, row by row |
| `/settings` | An MUI settings page with nxds sections dropped in |
| `/overlays` | An MUI dialog holding nxds select, popover, menu and tooltip, and the reverse. MUI's Snackbar beside nxds's toast |

The app bar's theme switch drives both theme systems: MUI's `useColorScheme`
and the nxds appearance provider. MUI uses `colorSchemeSelector: 'class'`, so
both share the `.dark` class on `<html>`.

## Run it

```bash
cd examples/mui-app
npm ci
npm run build
npx vite preview
```

After changing nxds source or tokens, run `npm run nxds:add`.

## How the app added nxds

1. `npm run nxds:add` copies the components, provider and token CSS into
   `src/components/nxds/`, and installs `@nxds/core` from `packages/core`.
2. `npm install tailwindcss @tailwindcss/vite tw-animate-css` and the packages
   the copy prints. MUI's `CssBaseline` stays the app's reset; nxds brings no
   Preflight.
3. `src/nxds.css` imports the token CSS, `tw-animate-css` and the Progress
   keyframes, and raises nxds's overlay layers above MUI's.
   `src/main.tsx` imports it.
4. `src/main.tsx` wraps the app in the nxds provider. `vite.config.ts` injects
   the first-paint script, as Install → Set up Vite describes.
5. MUI popups opened from inside an nxds dialog use `disablePortal`. An nxds
   dialog blocks pointer events outside itself, so a popup portalled to
   `<body>` could not be clicked.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/mui-app
```

Today: **0 host changes** across the three pages.
