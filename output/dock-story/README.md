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

## Preview

Run the prototype from this directory:

```sh
cd output/dock-story
../../node_modules/.bin/vite --config ./vite.config.mjs --port 4188
```

`vite.config.mjs` resolves `@nxds/react` and `@nxds/core` from this repository's
`packages/`. The bar, `PropertySlider` and the compact `ColorField` come from the
Dock checkout at `/Users/temp/.codex/worktrees/nexus-dock/nexus`, which holds
[PR #889](https://github.com/nexuslabs-ai/nxds/pull/889). The retired Dock loads
from that checkout's `output/dock-retired/preview-dock.tsx`.

The server also serves the HeroUI comparison at `/hero-adoption-preview/`. See
`HEROUI-ADOPTION.md` for the experiment, caveats, and verification results.
Baseline directories are historical snapshots. Some still import retired APIs and
don't run.
