---
'nxds': minor
---

New package: the `nxds` CLI installs nxds into an app.

- `npx nxds@latest init` sets up a Next.js App Router or Vite + React app: the
  token CSS, the appearance provider, the `cn` helper and their packages, and
  the layout wiring. It installs Tailwind 4 and adds the `@/` alias when the
  app has neither.
- `npx nxds@latest add <item...>` adds components and blocks with every item and
  package they need.
- `update`, `diff`, `doctor`, `list`, `search`, `view` and `info` keep the
  install current and checkable.

Every command takes `--json` and `--dry-run` and never prompts, so AI agents
can run it. `--json` prints `{ ok, data }`, or `{ ok, error }` on failure.

The CLI fetches each release from https://nxds.dev/r, so a new component
release needs no new CLI. `nxds.json` records the app's nxds version: `add`
installs from it, and `update` replaces only the files that still match it, so
your edits are never overwritten without `--overwrite`.
