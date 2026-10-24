# Dock-story prototype archive

This directory preserves the standalone homepage exploration shown at
`http://127.0.0.1:4187/dock-story/`. It is a prototype source archive, not a new
Next.js docs route. The existing docs homepage remains in
`apps/docs/app/_components/home-hero/` and `home-page/`.

## Included work

- Scroll chapters, component and block showcases, shared appearance controls,
  framework diagrams, and story demonstrations.
- DialKit comparison iterations, including the previous dock presentations.
- Coexistence diagrams, real library comparisons, the MUI theme-matching study,
  and the HeroUI incremental-adoption experiment.
- Historical source snapshots, screenshots, source-ownership audits, and
  measured browser evidence. Baseline directories are retained verbatim.

## Preview dependencies

The review server runs in a separate local Vite workspace. Its existing aliases
use the older `@nexus_ds` homepage checkout and the separate reusable Dock
checkout; newer source snapshots use `@nxds`. See `DOCK.md`, `APPEARANCE.md`, and
`SHARED-APPEARANCE.md` for the exact boundaries. This archive does not supply a
standalone server for every historical iteration.

The reusable Dock and compact property-control package work belongs to
[PR #889](https://github.com/nexuslabs-ai/nxds/pull/889). The homepage PR preserves
its consumers and comparison snapshots without duplicating those package edits.

The newest HeroUI comparison has an independent build configuration:

```sh
pnpm exec vite build --config output/dock-story/hero-adoption-preview/vite.config.mjs
```

Serve the resulting `hero-adoption-built/` directory at
`/hero-adoption-preview/` in the review server. Generated bundles are excluded
from Git; their source and runtime evidence are retained. See
`HEROUI-ADOPTION.md` for the experiment, caveats, and verification results.
