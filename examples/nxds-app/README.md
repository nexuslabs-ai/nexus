# nxds-app

A new Next.js app built entirely on nxds. It follows the
[Install](../../apps/docs/content/getting-started/install.mdx) page step by
step: no other component library, and nxds's token CSS is the app's only
Tailwind entry.

| Path | What it is |
| ---- | ---------- |
| `components/`, `lib/`, `hooks/` | nxds, copied from this repository by `npm run nxds:add`. Committed |
| `styles/nxds/` | The nxds token CSS |
| `app/globals.css` | Imports Tailwind's Preflight, the token CSS, `tw-animate-css` and the Progress keyframes |
| `app/lib/rhf-field.tsx` | The app's own react-hook-form field wrapper around nxds `Label` |
| `nxds.json` | Which nxds components to copy |

## Pages

| Route | What it shows |
| ----- | ------------- |
| `/` | Dashboard: stat cards, a team table with avatars and badges, onboarding progress |
| `/components` | Button variants and sizes, badge fills, checkbox, switch, radio, slider, avatar group, alerts, tabs, accordion |
| `/data` | An invoice table with search and a status filter |
| `/forms` | A react-hook-form profile form with validation and a toast on save |
| `/appearance` | The nxds appearance editor. The palette control in the top bar is the quick version |

The dashboard and components pages are Server Components that render nxds
directly.

## Run it

```bash
cd examples/nxds-app
npm ci
npm run build
npm start
```

After changing nxds source or tokens, run `npm run nxds:add`. `git diff`
then shows what changed for consumers.

## How the app is set up

The same four steps as the Install page:

1. Tailwind 4 through `@tailwindcss/postcss`, with no full `@import
   "tailwindcss"` of the app's own.
2. Tailwind's Preflight and the token CSS from `styles/nxds/`, imported from
   `app/globals.css`. nxds ships no reset, so the app brings one.
3. `NxdsAppearanceScript` in `<head>` and `NxdsAppearanceProvider` around
   the app, sharing one `storageKey`. `<body>` carries
   `nx:typography-body-default`, so page text follows the appearance settings.
4. `lib/utils.ts` for `cn`.

`npm run nxds:add` also installs `@nxds/core` from `packages/core`, so the
app runs this repository's engine.

All of the app's own markup uses `nx:` utilities and nxds tokens, such as
`nx:text-muted-foreground` and `nx:typography-body-small`. Tailwind's default
palette and text scale do not exist here.
