# Contributing to Nexus Design System

Project overview lives in [`README.md`](README.md). This is the day-to-day handbook — how to set up, run the dev servers, test, and ship.

**Everything routes through `make`.** Run `make help` for the full list. Prefer the `make` targets over raw `pnpm` / `turbo`: they wrap the flags everyone should be using (turbo filters, the docs-MCP lifecycle, the pre-push gate) so the workflow stays consistent across the team.

## Prerequisites

- **Node** ≥ 20.19.0 (see `.nvmrc`)
- **pnpm** — pinned via `packageManager` in `package.json` (`pnpm@10.12.1`)
- **Docker Desktop** — for the docs-MCP server only (recommended, not required to build the library)

## Setup

```bash
make setup        # install all workspace deps + the Playwright browser (for story tests)
```

That's the whole first-time setup. It also wires the Husky pre-commit hook, which formats and `nx:`-lints your staged files on every commit.

## Day-to-day

Pick the surface you're working on — each is one `make` command that turbo orchestrates (parallel servers, prefixed logs, one Ctrl-C stops all):

| Command        | Brings up                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------- |
| `make dev`     | **Storybook** — the component catalog + interaction tests. The 90% surface.                 |
| `make console` | the console app **+ a live `@nexus_ds/react` watcher** (component edits show up in the app) |
| `make docs`    | the docs site **+ live `@nexus_ds/react`**                                                  |
| `make dev-all` | everything: console + docs + storybook + all package watchers                               |

> **The docs site's generated inputs come from the turbo graph**, not from its package scripts: `apps/docs/turbo.json` puts `generate:manifest` (the page manifest and its loader map) and `generate:props` (the per-component props JSON that `PropsTable` reads) ahead of both `build` and `dev`. `make build` and `make docs` get both. `PropsTable` reads the props JSON on each request, so after changing a component's props or JSDoc during `make docs`, rerun `pnpm --filter @nexus_ds/docs generate:props` and reload — no restart. A bare `pnpm --filter @nexus_ds/docs dev` runs neither: it serves whatever `app/_lib/*.generated.ts` is committed, and whatever `generated/props/` a previous run left behind — absent on a clean checkout, stale after that.

Leave **`make up`** running in another terminal so the docs-MCP is available to Claude Code (see [AI Documentation MCP](#ai-documentation-mcp-nexus-docs-mcp)).

## Before you push

```bash
make verify       # the full gate: lint + format check + typecheck + tests + token/a11y/browser audits
```

`make verify` is what CI gates on, run locally. For the fast inner loop:

- `make lint` — ESLint (cheap; run it constantly)
- `make typecheck` — `tsc` across the packages
- `pnpm test:unit` — just the unit tests (core engine, `cn` merge, ESLint rules)
- `pnpm test:storybook:ui` — the interactive debugger when a story's `play` function fails

The pre-commit hook already formats and `nx:`-lints staged files, so you rarely format by hand (`pnpm format` does a full-tree pass if you want one).

## Make targets

`make help` prints these with descriptions. The full set:

| Group        | Targets                                                         |
| ------------ | --------------------------------------------------------------- |
| **Setup**    | `setup` · `fresh` (clean + install + build) · `clean`           |
| **Dev**      | `dev` · `console` · `docs` · `dev-all`                          |
| **Build**    | `build` · `tokens` (regenerate token CSS from `@nexus_ds/core`) |
| **Quality**  | `lint` · `typecheck` · `audit` · `verify`                       |
| **Docs MCP** | `up` · `down` · `serve` · `publish`                             |

Anything not wrapped is still a plain pnpm script (`pnpm test`, `pnpm test:storybook:ui`, the per-package `audit:*`).

---

## Testing

A single `*.stories.tsx` file does four jobs: autodocs renders it as visual
documentation, `argTypes` makes it an interactive playground, its `play`
function runs as a behaviour test in real Chromium, and addon-a11y runs
axe-core against it with `test: 'error'` so any violation fails.

You don't write a separate `*.test.tsx` for a component. That's not a stylistic
preference — the `unit` project's `include` list in `vitest.config.ts` is one
glob per non-story row of [`.claude/rules/testing.md`](.claude/rules/testing.md)
§ Scope, and a component test file matches none of them.

Outside stories, three kinds of unit test exist, all under the `unit` project
(jsdom): the core engine's behaviour (`packages/core/src/lib`), the Nexus `cn`
merge (`packages/react/src/lib/utils.test.ts`), and the ESLint plugin's rules
(`packages/eslint-plugin-nexus/__tests__`). Apps, repo scripts and hooks have no
tests of their own, and nothing uses snapshots.

The spec lives in the rules, not here — what earns a test and what is
deliberately out of scope in
[`testing.md`](.claude/rules/testing.md), and the stories a component ships plus
the play-function patterns in
[`testing-react.md`](.claude/rules/testing-react.md). Read those before adding
coverage; this section is orientation only.

### Running tests

`make verify` runs the whole suite (plus lint / typecheck / audits). To run or debug tests directly:

| Command                  | What it does                                                      |
| ------------------------ | ----------------------------------------------------------------- |
| `pnpm test`              | both vitest projects — `unit` (jsdom) + `storybook` (Chromium)    |
| `pnpm test:unit`         | unit only — core engine, `cn` merge, ESLint rules                 |
| `pnpm test:storybook`    | every story's play function in a real browser                     |
| `pnpm test:storybook:ui` | **debugger** — Vitest's interactive UI when a play function fails |

The first storybook-project run launches Storybook in the background — the cold start takes a few extra seconds.

---

## AI Documentation MCP (nexus-docs-mcp)

A local documentation server keeps Claude Code on the exact library versions used here (Tailwind v4, Storybook 10, Vitest 4, Radix, recharts 3, zod 4, …) instead of stale training data. It ships as a pre-indexed Docker image, so there's nothing to scrape locally.

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

---

## Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets) and the [`Release`](.github/workflows/release.yml) workflow. Only the two runtime packages publish to npm; everything else is either internal or copy/own.

| Package                   | Published? | Why                                                                     |
| ------------------------- | ---------- | ----------------------------------------------------------------------- |
| `@nexus_ds/core`          | **npm**    | Framework-agnostic runtime engine; copied component code imports it     |
| `@nexus_ds/eslint-plugin` | **npm**    | Lint guardrails consumers install and use                               |
| `@nexus_ds/tailwind`      | copy/own   | Generated token CSS — consumers regenerate with their own token choices |
| `@nexus_ds/react`         | copy/own   | Components are copied and owned; delivered by the export tool (#541)    |
| `@nexus_ds/console/docs`  | private    | Apps                                                                    |

Everything lives under the `@nexus_ds` scope — the published packages on npm and the ESLint plugin's **rule namespace** (rules are referenced as `@nexus_ds/*`, e.g. `@nexus_ds/no-render-prop-types`). The rule namespace is a flat-config key the plugin registers, independent of the npm package name; it is kept in lockstep with the scope so the repo reads consistently.

### Publishing setup (trusted publishing — no token)

The packages authenticate to npm with **trusted publishing** (OIDC): GitHub Actions mints a short-lived credential at publish time, so there is **no `NPM_TOKEN` secret** in the repo. This is already configured:

1. Both packages were bootstrapped with an initial manual `npm publish` — trusted publishing can't be configured until a package exists on npm.
2. Each package has a **trusted publisher** registered on npmjs.com (_Settings → Trusted Publisher → GitHub Actions_) pointing at `nexuslabs-ai/nexus` and the `release.yml` workflow.
3. A repo secret **`RELEASE_TOKEN`** — a fine-grained PAT from `nexuslabs-ai-bot` with **contents: read/write** and **pull requests: read/write** on this repo — authenticates the "Version Packages" PR. The default `GITHUB_TOKEN` can't be used here: PRs it opens don't fire `pull_request`, so the required `CI Status` check would never run on the version PR and it couldn't merge. Rotate the PAT before it expires.

The workflow grants `id-token: write` for the OIDC exchange, upgrades npm to a trusted-publishing-capable version (≥ 11.5.1) on Node ≥ 22.14.0, and uses `RELEASE_TOKEN` for the release PR and tags. There is **no npm token** — publish auth is OIDC. Provenance attestations are emitted automatically.

### Day-to-day: adding a changeset

Any PR that changes `@nexus_ds/core` or `@nexus_ds/eslint-plugin` includes a changeset describing the bump:

```bash
pnpm changeset        # pick packages + semver bump, write a summary
```

Commit the generated `.changeset/*.md` file with your PR. Semver is a contract: `major` for a breaking change to core's runtime surface or the plugin's rule API, `minor` for additive, `patch` for fixes.

### Cutting a release

The `Release` workflow runs on every push to `main`:

1. **Collect** — with unreleased changesets present, it opens/updates a **"Version Packages"** PR that bumps versions and writes `CHANGELOG.md`s.
2. **Publish** — when you merge that PR (changesets consumed), the next run builds the packages and runs `changeset publish`, pushing `@nexus_ds/core` and `@nexus_ds/eslint-plugin` to npm with provenance. Private packages are skipped automatically.

`@nexus_ds/core` and `@nexus_ds/eslint-plugin` were bootstrapped at `0.0.1` by the initial manual publish. The staged initial changeset cuts the first **trusted-publishing** release: merging the Version Packages PR the workflow opens publishes both at `0.1.0`. Verify any release with a fresh external install:

```bash
npm install @nexus_ds/core @nexus_ds/eslint-plugin
```

To version locally without publishing (e.g. to preview the bump): `pnpm version-packages`.

---

## Authoritative specs

This handbook is the on-ramp. The canonical conventions live in [`.claude/rules/`](.claude/rules/) — there is no root `CLAUDE.md`. When this doc and a rule file disagree, the rule file wins.

- [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns and required stories
- [`github.md`](.claude/rules/github.md) — branch naming, PR title/body conventions, the review-bot flow
