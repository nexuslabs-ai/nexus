# Nexus docs

The Nexus documentation site. Article routes live in `app/(docs)`; the
full-height workspaces live in `app/(workspace)` and share the docs header but
not the article chrome.

## Run and validate

From the repository root:

- `pnpm --filter @nexus_ds/docs dev`
- `pnpm --filter @nexus_ds/docs typecheck`
- `pnpm --filter @nexus_ds/docs build`
- `pnpm --filter @nexus_ds/docs audit:csp` — after a production build.

## Create

`/create` is a playground for the docs appearance. The controls sit in a side
panel on wide screens and in a sheet below `lg`. The canvas renders a small
product scene built from public Nexus components.

- **One appearance.** Controls write to the docs appearance provider in the root
  layout. That provider is the only store: it persists under
  `nexus-docs-appearance`, and every page, including `/create`, renders with it.
  The example scene renders inline under that same appearance. Its overlays
  portal into the docs document, so they look the same as the canvas.
- **Undo and Reset.** `useAppearanceHistory` (`app/_workspace/appearance-state.ts`)
  keeps up to 100 undo steps. Each edit or reset records the previous values of
  only the keys it changed, and Undo writes those back, so changes made outside
  the panel (such as the top-nav light/dark toggle) survive an Undo. The history
  is per visit and is not persisted.
- **Export.** "Use this theme" shows three files, each with a copy control:
  `nexus-appearance.ts` holds the appearance state to pass as `defaultState`,
  `theme.css` holds the derived light and dark themes, and `preferences.css`
  holds the font and motion preferences. The CSS comes from the same appearance
  snapshot the provider applies to the page.
