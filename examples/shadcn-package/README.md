# shadcn-package

A company with its own design-system package, built from shadcn, that adds
Nexus. Two apps show the two ways to add it.

| Path | What it is |
| ---- | ---------- |
| `ui/` | `@acme/ui`, the company package: its shadcn kit, plus Nexus copied into `src/nexus/` |
| `app-via-package/` | Gets shadcn **and** Nexus from `@acme/ui` |
| `app-direct/` | Gets shadcn from `@acme/ui`, and copies Nexus into the app itself |

Both apps are Vite + React Router and show the same three pages as
[`shadcn-app`](../shadcn-app): side by side, settings and overlays.

## Run it

Build the package first. The apps install it from `../ui` the way they would
from a registry: `.npmrc` sets `install-links=true`, so npm packs the package
and copies it into `node_modules` instead of linking it.

```bash
cd examples/shadcn-package/ui
npm ci
npm run build

cd ../app-via-package    # or ../app-direct
npm ci
npm run build
npx vite preview
```

After rebuilding `ui/`, delete the app's `node_modules/@acme/ui` and run
`npm install`. npm does not reinstall a `file:` package whose version has not
changed.

## How the package ships Nexus

| Export | What it is |
| ------ | ---------- |
| `@acme/ui` | The shadcn components and `cn` |
| `@acme/ui/nexus` | The Nexus components and the appearance provider |
| `@acme/ui/styles.css` | The shadcn Tailwind entry and tokens |
| `@acme/ui/nexus.css` | The Nexus Tailwind entry |

`tsc` compiles `src/` to `dist/`, keeping each file's `'use client'`. The CSS
ships as source, and the app compiles it. Both entries end with
`@source './'`: Tailwind skips `node_modules` when it scans for classes, so
without that line the package's classes are never generated.

The app imports the two entries from separate CSS files, because each one
starts its own Tailwind build:

```css
/* src/index.css */
@import "@acme/ui/styles.css";

/* src/nexus.css */
@import "@acme/ui/nexus.css";
```

`app-direct` imports `@acme/ui/styles.css` the same way, and its `nexus.css`
points at the Nexus copy in `src/components/nexus/`.

## Check it

From the repository root:

```bash
node examples/scripts/check.mjs examples/shadcn-package/app-via-package
node examples/scripts/check.mjs examples/shadcn-package/app-direct
```

Both report **2,058 host properties** across the three pages, and both build
byte-identical CSS. Delivering Nexus through the package or copying it into the
app makes no difference to what leaks.

| Host change | Cause |
| ----------- | ----- |
| The host font switches to Nexus's system stack on 402 elements | Nexus's Tailwind brings its own Preflight, and its `html { font-family }` loads after the host's. `shadcn-app` escapes this only because `next/font` sets the font with a class on `<html>` |
| Text, padding and radii shrink (16 → 14px root) | `NexusAppearanceProvider` sets `:root { font-size: 14px }` |
| Border colours change | Nexus's global `*, ::before, ::after { border-color }` |
| Body text colour changes | Nexus's `body { color }` base rule |

The rest matches `shadcn-app`: toasts show twice, Nexus's tooltip needs its own
provider, and unprefixed classes on Nexus components lose.
