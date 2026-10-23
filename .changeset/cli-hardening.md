---
'nxds-cli': minor
---

Harden the CLI:

- The command is `nxds-cli`, matching the package name. A global install no longer adds an `nxds` command.
- `update` merges a release's changes into files you edited. Where you and the release changed the same lines, it writes conflict markers and exits `3`. `doctor` flags markers left in the nxds folder.
- Line endings and trailing whitespace no longer count as edits, so a CRLF checkout or a formatter no longer stops `update` from replacing files.
- Exit codes: `0` done, `1` error, `2` usage error, `3` done with something left to do. `--json` output adds `exitCode`.
- Each command takes only its own options, and `<command> --help` shows them. An unknown option fails with exit code `2`.
- Registry fetches time out after 30 seconds and honour `HTTPS_PROXY`, `HTTP_PROXY` and `NO_PROXY`. `NXDS_REGISTRY_URL` sets the registry when `--registry` isn't passed.
- An invalid release or `nxds.json` names each field that's wrong.
