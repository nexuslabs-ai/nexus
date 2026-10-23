# nxds-cli

## 0.2.0

### Minor Changes

- 046ec45: Harden the CLI:
  - The command is `nxds-cli`, matching the package name. A global install no longer adds an `nxds` command.
  - `update` merges a release's changes into files you edited. Where you and the release changed the same lines, it writes conflict markers and exits `3`. `doctor` flags markers left in the nxds folder.
  - Line endings and trailing whitespace no longer count as edits, so a CRLF checkout or a formatter no longer stops `update` from replacing files.
  - Exit codes: `0` done, `1` error, `2` usage error, `3` done with something left to do. `--json` output adds `exitCode`.
  - Each command takes only its own options, and `<command> --help` shows them. An unknown option fails with exit code `2`.
  - Registry fetches time out after 30 seconds and honour `HTTPS_PROXY`, `HTTP_PROXY` and `NO_PROXY`. `NXDS_REGISTRY_URL` sets the registry when `--registry` isn't passed.
  - An invalid release or `nxds.json` names each field that's wrong.

## 0.1.0

### Minor Changes

- a87db64: New package: the `nxds` CLI installs nxds into an app.
  - `npx nxds-cli@latest init` sets up a Next.js App Router or Vite + React app: the
    token CSS, the appearance provider, the `cn` helper and their packages, and
    the layout wiring. It installs Tailwind 4 and adds the `@/` alias when the
    app has neither.
  - `npx nxds-cli@latest add <item...>` adds components and blocks with every item and
    package they need.
  - `update`, `diff`, `doctor`, `list`, `search`, `view` and `info` keep the
    install current and checkable.

  Every command takes `--json` and `--dry-run` and never prompts, so AI agents
  can run it. `--json` prints `{ ok, data }`, or `{ ok, error }` on failure.

  The CLI fetches each release from https://nxds.dev/r, so a new component
  release needs no new CLI. `nxds.json` records the app's nxds version: `add`
  installs from it, and `update` replaces only the files that still match it, so
  your edits are never overwritten without `--overwrite`.
