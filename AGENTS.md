# Agent Instructions

Repo conventions live in `.claude/rules/`. That directory is the source of
truth — read the relevant file before changing code in its area rather than
inferring a convention from nearby code.

Start at [`.claude/rules/code-quality.md`](.claude/rules/code-quality.md): it is
the governing principle and indexes every per-rule file. The domain rules it
does not index:

| Area                            | Rule                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| Testing scope and philosophy    | [`testing.md`](.claude/rules/testing.md)                       |
| Stories as tests                | [`testing-react.md`](.claude/rules/testing-react.md)           |
| Branches, commits, PRs, reviews | [`github.md`](.claude/rules/github.md)                         |
| shadcn/ui adaptation            | [`shadcn-divergences.md`](.claude/rules/shadcn-divergences.md) |
| Third-party API lookups         | [`docs-mcp.md`](.claude/rules/docs-mcp.md)                     |

Workspace layout, setup, and the full command reference are in
[`CONTRIBUTING.md`](CONTRIBUTING.md). Day to day:

```bash
pnpm dev
pnpm storybook
pnpm lint
pnpm typecheck
pnpm test
```

Claude-specific workflow assets — commands, skills, agent definitions, and
permissions — live in `.claude/`. Other agents should read a
`.claude/commands/*.md` or `.claude/skills/*/SKILL.md` for process guidance
rather than trying to execute it.
