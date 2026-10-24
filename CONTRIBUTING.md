# Contributing to nxds design system

Project overview lives in [`README.md`](README.md). This is the day-to-day handbook — how to set up, run the dev servers, test, and ship.

**Everything routes through `make`.** Run `make help` for the full list. Prefer the `make` targets over raw `pnpm` / `turbo`: they wrap the flags everyone should be using (turbo filters, the docs-MCP lifecycle, the pre-push gate) so the workflow stays consistent across the team.

## Prerequisites

- **Node** ≥ 22.18 (see `.nvmrc`)
- **pnpm** — pinned via `packageManager` in `package.json` (`pnpm@10.12.1`)
- **Docker Desktop** — for the docs-MCP server only (recommended, not required to build the library)

## Setup

```bash
make setup        # install all workspace deps + the Playwright browser (for story tests)
```

That's the whole first-time setup. It also wires the Husky pre-commit hook, which formats and `nx:`-lints your staged files on every commit.

## Day-to-day

Pick the surface you're working on — each is one `make` command that turbo orchestrates (parallel servers, prefixed logs, one Ctrl-C stops all):

| Command        | Brings up                                                                   |
| -------------- | --------------------------------------------------------------------------- |
| `make dev`     | **Storybook** — the component catalog + interaction tests. The 90% surface. |
| `make dev-vue` | the **`@nxds/vue`** Storybook, on port 6007                                 |
| `make docs`    | the docs site **+ live `@nxds/react`**                                      |
| `make dev-all` | everything: docs + storybook + all package watchers                         |

> **The docs site's generated inputs come from the turbo graph**, not from its package scripts, and none of them are committed: `apps/docs/turbo.json` puts `generate:manifest` (the page manifest and its loader map), `generate:demos` (the docs code generated from every story tagged `docs`, under `__generated__/`), `@nxds/catalog#generate:catalog` (the install catalog the docs and the `nxds` CLI share) and `generate:props` (the per-component props JSON that `PropsTable` reads) ahead of both `build` and `dev`, and the two the TypeScript graph imports — `generate:manifest` and `generate:demos` — ahead of `typecheck`. `make build`, `make docs` and `make typecheck` get them. `PropsTable` reads the props JSON on each request, so after changing a component's props or JSDoc during `make docs`, rerun `pnpm --filter @nxds/docs generate:props` and reload — no restart. A bare `pnpm --filter @nxds/docs dev` runs only the docs-story watcher: on a clean checkout there is no page manifest, demo index or install catalog, so start the docs with `make docs`.

Leave **`make up`** running in another terminal so the docs-MCP is available to Claude Code (see [AI Documentation MCP](#ai-documentation-mcp-nxds-docs-mcp)).

## Before you push

```bash
make verify       # the full gate: lint + format check + typecheck + tests + token/a11y/browser audits
```

`make verify` is what CI gates on, run locally. For the fast inner loop:

- `make lint` — ESLint (cheap; run it constantly)
- `make typecheck` — `tsc` across the packages
- `pnpm test:unit` — just the unit tests (core engine, `cn` merge, ESLint rules, parity, CLI)
- `pnpm test:storybook:ui` — the interactive debugger when a story's `play` function fails

The pre-commit hook already formats and `nx:`-lints staged files, so you rarely format by hand (`pnpm format` does a full-tree pass if you want one).

## Make targets

`make help` prints these with descriptions. The full set:

| Group        | Targets                                                     |
| ------------ | ----------------------------------------------------------- |
| **Setup**    | `setup` · `fresh` (clean + install + build) · `clean`       |
| **Dev**      | `dev` · `dev-vue` · `docs` · `dev-all`                      |
| **Build**    | `build` · `tokens` (regenerate token CSS from `@nxds/core`) |
| **Quality**  | `lint` · `typecheck` · `audit` · `verify`                   |
| **Docs MCP** | `up` · `down` · `serve` · `publish`                         |

Anything not wrapped is still a plain pnpm script (`pnpm test`, `pnpm test:storybook:ui`, the per-package `audit:*`).

---

## Testing

A single story file (`*.stories.tsx` in `@nxds/react`, `*.stories.ts` in
`@nxds/vue`) does four jobs: autodocs renders it as visual
documentation, `argTypes` makes it an interactive playground, its `play`
function runs as a behaviour test in real Chromium, and addon-a11y runs
axe-core against it with `test: 'error'` so any violation fails.

You don't write a separate `*.test.tsx` for a component. That's not a stylistic
preference — the `unit` project's `include` list in `vitest.config.ts` is one
glob per non-story row of [`.claude/rules/testing.md`](.claude/rules/testing.md)
§ Scope, and a component test file matches none of them.

Outside stories, five kinds of unit test exist, all under the `unit` project
(jsdom): the core engine's behaviour (`packages/core/src/lib`), the nxds `cn`
merge (`packages/react/src/lib/utils.test.ts`), the ESLint plugin's rules
(`packages/eslint-plugin/__tests__`), and cross-framework parity (`parity/`,
see [`cross-stack-parity.md`](.claude/rules/cross-stack-parity.md)), and `nxds-cli`
run against a throwaway app (`packages/cli/__tests__`). Apps, repo scripts and hooks have no
tests of their own, and nothing uses snapshots.

The spec lives in the rules, not here — what earns a test and what is
deliberately out of scope in
[`testing.md`](.claude/rules/testing.md), and the stories a component ships plus
the play-function patterns in
[`testing-react.md`](.claude/rules/testing-react.md). Read those before adding
coverage; this section is orientation only.

### Running tests

`make verify` runs the whole suite (plus lint / typecheck / audits). To run or debug tests directly:

| Command                  | What it does                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `pnpm test`              | every vitest project — `unit` (jsdom) + `storybook` + `storybook-vue` + `parity` (Chromium) |
| `pnpm test:unit`         | unit only — core engine, `cn` merge, ESLint rules, parity                                   |
| `pnpm test:storybook`    | every React and Vue story's play function, and rendered parity, in a real browser           |
| `pnpm test:storybook:ui` | **debugger** — Vitest's interactive UI when a play function fails                           |

The first storybook-project run launches Storybook in the background — the cold start takes a few extra seconds.

---

## AI Documentation MCP (nxds-docs-mcp)

A local documentation server keeps Claude Code on the exact library versions used here (React 19, Tailwind v4, Storybook 10, Vitest 4, Radix, recharts 3, TanStack Form, …) instead of stale training data. It ships as a pre-indexed Docker image, so there's nothing to scrape locally.

### Teammates — use it

Requires Docker. One command brings it up:

```bash
make up           # pull the published image + run it at http://localhost:6282
```

`.mcp.json` connects Claude Code automatically — no further setup. Stop it with `make down`. After a maintainer publishes an update: `make down && make up`.

> The image is public (read-only), so `make up` pulls it anonymously — no auth needed. Registry login (`pnpm docs:login`, with the bot credentials) is only for maintainers **publishing** an update; see below.

### Maintainers — update it

```bash
make serve        # local docs-mcp server + web dashboard at :6282 for indexing
# add/refresh libraries via the dashboard or the scrape_docs tool, then:
make publish      # login → export DB → build image → push to GHCR
```

The index DB ships **inside** the image, never in git — the live index is the source of truth, and `list_libraries` shows what's in it.

### Lifecycle reference

| make           | wraps                                                 | role                               |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| `make up`      | `docs:pull` + `docs:start`                            | teammate — run the published index |
| `make down`    | `docs:stop`                                           | teammate — stop it                 |
| `make serve`   | `docs:serve`                                          | maintainer — local indexing server |
| `make publish` | `docs:login` + `docs:publish` (export → build → push) | maintainer — ship an update        |

The rule that mandates querying it lives in [`.claude/rules/docs-mcp.md`](.claude/rules/docs-mcp.md).

## Browser MCP (chrome-devtools)

`.mcp.json` and `.codex/config.toml` start `chrome-devtools-mcp`, which launches Google Chrome stable. If you don't have Chrome, or want another Chromium browser, point the server at it in its own config file. On macOS, for Brave:

```json
{
  "executablePath": "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
}
```

| OS            | Config file                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| macOS / Linux | `$XDG_CONFIG_HOME/cd4a/config.json`, else `~/.config/cd4a/config.json`      |
| Windows       | `%LOCALAPPDATA%\Google\cd4a\config.json`, else `~/.config/cd4a/config.json` |

The file applies in every MCP client, so you don't edit the repo config. A user-level `chrome-devtools` entry in Claude Code or Codex doesn't work, because the project config wins. Make the file and its folder read-only to agents. An agent that edits the file controls the browser, its flags and the URLs it may open.

---

## Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets) and the [`Release`](.github/workflows/release.yml) workflow. Three packages publish to npm; everything else is either internal or copy/own.

| Package               | Published? | Why                                                                      |
| --------------------- | ---------- | ------------------------------------------------------------------------ |
| `@nxds/core`          | **npm**    | Framework-agnostic runtime engine; copied component code imports it      |
| `@nxds/eslint-plugin` | **npm**    | Lint guardrails consumers install and use                                |
| `nxds-cli`            | **npm**    | The `nxds` CLI that installs nxds into an app from the nxds.dev registry |
| `@nxds/tailwind`      | copy/own   | Generated token CSS — consumers regenerate with their own token choices  |
| `@nxds/react`         | copy/own   | Components are copied and owned; delivered by the `nxds` CLI             |
| `@nxds/catalog`       | private    | Builds the install catalog and commits one per `@nxds/react` release     |
| `@nxds/docs`          | private    | App                                                                      |
| `@nxds/source-model`  | private    | Reads component sources for the docs generators and the parity tests     |

Everything lives under the `@nxds` scope — the published packages on npm and the ESLint plugin's **rule namespace** (rules are referenced as `@nxds/*`, e.g. `@nxds/no-render-prop-types`). The rule namespace is a flat-config key the plugin registers, independent of the npm package name; it is kept in lockstep with the scope so the repo reads consistently.

### Publishing setup (trusted publishing — no token)

The packages authenticate to npm with **trusted publishing** (OIDC): GitHub Actions mints a short-lived credential at publish time, so there is **no `NPM_TOKEN` secret** in the repo. A new package is bootstrapped once, by hand:

1. Publish it manually with `npm publish` from the branch that introduces it. Trusted publishing can't be configured until a package exists on npm.
2. Register a **trusted publisher** on npmjs.com (_Settings → Trusted Publisher → GitHub Actions_) pointing at `nexuslabs-ai/nxds` and the `release.yml` workflow.
3. Lock the package to OIDC: _Settings → Publishing access → Require two-factor authentication and disallow tokens_. Then revoke the token used for the manual publish.

The release workflow also needs a repo secret, **`RELEASE_TOKEN`**. It is a fine-grained PAT from `nexuslabs-ai-bot` with **contents: read/write** and **pull requests: read/write** on this repo. It authenticates the "Version Packages" PR. The default `GITHUB_TOKEN` can't be used here: PRs it opens don't fire `pull_request`, so the required `CI Status` check would never run on the version PR and it couldn't merge. Rotate the PAT before it expires.

The workflow grants `id-token: write` for the OIDC exchange, upgrades npm to a trusted-publishing-capable version (≥ 11.5.1) on the `.nvmrc` Node, and uses `RELEASE_TOKEN` for the release PR and tags. There is **no npm token** — publish auth is OIDC. Provenance attestations are emitted automatically.

### Day-to-day: adding a changeset

Any PR that changes `@nxds/core`, `@nxds/eslint-plugin`, `nxds-cli` or what `@nxds/react` installs includes a changeset describing the bump. An `@nxds/react` bump is what gives apps a new release to `nxds update` to:

```bash
pnpm changeset        # pick packages + semver bump, write a summary
```

Commit the generated `.changeset/*.md` file with your PR. Semver is a contract: `major` for a breaking change to core's runtime surface or the plugin's rule API, `minor` for additive, `patch` for fixes.

### Cutting a release

The `Release` workflow runs on every push to `main`:

1. **Collect** — with unreleased changesets present, it opens/updates a **"Version Packages"** PR that bumps versions and writes `CHANGELOG.md`s. `pnpm version-packages` also commits `packages/catalog/releases/<version>.json` for a new `@nxds/react` version. The docs site serves it at `nxds.dev/r/<version>.json` and as `nxds.dev/r/latest.json`, which is what the `nxds` CLI installs. A release catalog never changes once committed.
2. **Publish** — when you merge that PR (changesets consumed), the next run builds the packages and runs `changeset publish`, pushing `@nxds/core`, `@nxds/eslint-plugin` and `nxds-cli` to npm with provenance. Private packages are skipped automatically.

`@nxds/core` and `@nxds/eslint-plugin` were bootstrapped at `0.7.2` and `0.4.0` by the manual publish, so those two versions carry no provenance. Provenance starts with the first release the workflow publishes. Verify any release with a fresh external install:

```bash
npm install @nxds/core @nxds/eslint-plugin
```

To version locally without publishing (e.g. to preview the bump): `pnpm version-packages`.

---

## Authoritative specs

This handbook is the on-ramp. The canonical conventions live in [`.claude/rules/`](.claude/rules/) — there is no root `CLAUDE.md`. When this doc and a rule file disagree, the rule file wins.

- [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns and required stories
- [`github.md`](.claude/rules/github.md) — branch naming, PR title/body conventions, the review-bot flow
