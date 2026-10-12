# nexus-app

A new Next.js app built entirely on Nexus. It follows the
[Install](../../apps/docs/content/getting-started/install.mdx) page step by
step: no other component library, and Nexus's token CSS is the app's only
Tailwind entry.

| Path | What it is |
| ---- | ---------- |
| `components/`, `lib/`, `hooks/` | Nexus, copied from this repository by `npm run nexus:add`. Committed |
| `styles/nexus/` | The Nexus token CSS |
| `app/globals.css` | Imports Tailwind's Preflight, the token CSS, `tw-animate-css` and the Progress keyframes |
| `app/lib/rhf-field.tsx` | The app's own react-hook-form field wrapper around Nexus `Label` |
| `nexus.json` | Which Nexus components to copy |

## Pages

| Route | What it shows |
| ----- | ------------- |
| `/` | Dashboard: stat cards, a team table with avatars and badges, onboarding progress |
| `/components` | Button variants and sizes, badge fills, checkbox, switch, radio, slider, avatar group, alerts, tabs, accordion |
| `/data` | An invoice table with search and a status filter |
| `/forms` | A react-hook-form profile form with validation and a toast on save |
| `/appearance` | The Nexus appearance editor. The palette control in the top bar is the quick version |

The dashboard and components pages are Server Components that render Nexus
directly.

## Run it

```bash
cd examples/nexus-app
npm ci
npm run build
npm start
```

After changing Nexus source or tokens, run `npm run nexus:add`. `git diff`
then shows what changed for consumers.

## How the app is set up

The same four steps as the Install page:

1. Tailwind 4 through `@tailwindcss/postcss`, with no full `@import
   "tailwindcss"` of the app's own.
2. Tailwind's Preflight and the token CSS from `styles/nexus/`, imported from
   `app/globals.css`. Nexus ships no reset, so the app brings one.
3. `NexusAppearanceScript` in `<head>` and `NexusAppearanceProvider` around
   the app, sharing one `storageKey`. `<body>` carries
   `nx:typography-body-default`, so page text follows the appearance settings.
4. `lib/utils.ts` for `cn`.

`npm run nexus:add` also installs `@nexus_ds/core` from `packages/core`, so the
app runs this repository's engine.

All of the app's own markup uses `nx:` utilities and Nexus tokens, such as
`nx:text-muted-foreground` and `nx:typography-body-small`. Tailwind's default
palette and text scale do not exist here.
