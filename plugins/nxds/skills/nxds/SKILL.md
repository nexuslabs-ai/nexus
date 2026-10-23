---
name: nxds
description: 'Add and use nxds components with nxds-cli. Use when the user asks for nxds or Nexus UI, when the project has an nxds.json, or when code uses nx: classes or @nxds/core.'
---

# nxds

nxds is a design system: React components you copy into the app and own,
themed by one engine, `@nxds/core`. Install everything with `nxds-cli`. It
never prompts, and `--json` prints one object: `{ "ok": true, "exitCode": 0,
"data": … }`, or `{ "ok": false, "exitCode": …, "error": "…" }`.

Exit codes: `0` done, `1` error, `2` usage error (unknown option or item), `3`
done with something left to do (conflicts, manual steps, failed checks).
`npx nxds-cli@latest <command> --help` lists a command's options.

## Before you change anything

1. Run `npx nxds-cli@latest info --json`. It reports the app setup, the nxds folder
   and the installed items.
2. If `initialized` is `false`, run `npx nxds-cli@latest init`. It sets up Next.js
   App Router and Vite + React apps that use TypeScript. For any other setup,
   follow https://nxds.dev/getting-started/install.md by hand.
3. If `init` returns `"ok": false`, do each step in `data.manual` by hand.

## Add components

- Find an item: `npx nxds-cli@latest search <term> --json`. Read one:
  `npx nxds-cli@latest view <name> --json`.
- Add items: `npx nxds-cli@latest add <name...>`. To see the files and packages
  first, add `--dry-run --json`.
- Import from the folder in `nxds.json` `dir`, keeping its layout, such as
  `components/nxds/components/button/button`.
- `add` installs from the version in `nxds.json`. If an item is missing
  there, run `npx nxds-cli@latest update` first.
- `update` merges the release's changes into files the user edited. If it
  exits `3` with `data.conflicted`, resolve the `<<<<<<<` markers in those
  files, keeping the user's intent, then run `doctor`.
- Don't pass `--overwrite` unless the user asks. It replaces files they edited.
- After `init` or `add`, run `npx nxds-cli@latest doctor` and fix every failed
  check.

## Write nxds code

- Every class in nxds code takes the `nx:` prefix, before every modifier:
  `nx:hover:bg-primary-background-hover`, never `hover:nx:…`.
- Use semantic tokens: a family, a role, then an optional state, such as
  `nx:bg-primary-background` or `nx:text-error-subtle-foreground`. A bare
  family like `nx:bg-primary` and raw palette colors like `nx:bg-blue-500`
  don't work.
- Use the `-hover` and `-active` tokens for states, not opacity modifiers like
  `/90`.
- There is no `accent` token. For hover, use `background-hover` on the page,
  `container-hover` on cards and rows, and `popover-hover` in menus.
- Change the theme through the appearance object (`brandColor`,
  `surfaceTone`, `density`, `corners`), not by editing the token CSS. See
  https://nxds.dev/theming/appearance.md.
- Compose with `children`. nxds components take no render-callback props.

## Docs

Every docs page has a Markdown version at its URL plus `.md`. The index is
https://nxds.dev/llms.txt.
