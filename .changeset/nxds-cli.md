---
'nxds': minor
---

New package: the `nxds` CLI installs nxds into an app.

- `npx nxds init` sets up a Next.js App Router or Vite + React app: the
  token CSS, the appearance provider, the `cn` helper and their packages, and
  the layout wiring. It installs Tailwind 4 and adds the `@/` alias when the
  app has neither.
- `npx nxds add <item...>` adds components and blocks with every item and
  package they need.
- `update`, `diff`, `doctor`, `list`, `search`, `view` and `info` keep the
  install current and checkable.

Every command takes `--json` and `--dry-run` and never prompts, so AI agents
can run it. `--json` prints `{ ok, data }`, or `{ ok, error }` on failure. Files
you edit are never overwritten without `--overwrite`, and `nxds.json` records
the catalog revision, so `add` never mixes two releases in one app.
