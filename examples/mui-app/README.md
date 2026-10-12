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

The app bar has a toggle for each theme system: MUI's `useColorScheme` and the
Nexus appearance provider. MUI uses `colorSchemeSelector: 'class'`, so both
toggle `.dark` on `<html>`.

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
   `src/components/nexus/`.
2. `npm install tailwindcss @tailwindcss/vite tw-animate-css` and the packages
   the copy prints.
3. `src/nexus.css` imports the token CSS, `tw-animate-css` and the Progress
   keyframes. `src/main.tsx` imports it.
4. `src/main.tsx` wraps the app in the Nexus provider and Nexus's
   `TooltipProvider`. `vite.config.ts` injects the first-paint script, as the
   Theme setup page's Vite section describes.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/mui-app
```

Today: **1,725 host properties** change across the three pages.

| Host change | Cause |
| ----------- | ----- |
| MUI text, spacing and radii shrink (16 → 14px root) | `NexusAppearanceProvider` sets `:root { font-size: 14px }`. MUI sizes in `rem` |
| 378 elements go from `border-style: none` to `solid` | Tailwind Preflight arrives with Nexus. MUI's `CssBaseline` never reset borders |
| Native buttons and inputs switch font | Preflight sets `font: inherit` on form controls |
| Border colours change | Nexus's global `*, ::before, ::after { border-color }` |

## What else it found

| Finding | Where you see it |
| ------- | ---------------- |
| A Nexus Select inside an MUI dialog opens behind it. Nexus popups use z-index 70; MUI's modal layer is 1300 | `/overlays`, first dialog |
| A Nexus dialog's overlay (z-index 50) sits under MUI's AppBar (1201) and Drawer (1200) | `/overlays`, second dialog |
| An MUI menu inside a Nexus dialog opens but cannot be clicked. Radix's modal dialog blocks pointer events outside itself, and MUI portals the menu to `<body>` | `/overlays`, second dialog |
| An MUI Select's floating label is clipped by the Nexus dialog body | `/overlays`, second dialog |
