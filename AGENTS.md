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

**Browser Support:** Nexus implements no feature-detection or environment
fallbacks. [`no-environment-branching.md`](.claude/rules/no-environment-branching.md)
is authoritative over any guide's fallback advice; `prefers-color-scheme` is the
one exception.

**Modern Web Guidance:** for substantive UI and browser-platform decisions,
search and retrieve guidance with the
[`modern-web-guidance`](.agents/skills/modern-web-guidance/SKILL.md) skill, then
record the guide source, the decision, and how it was verified in the plan or
PR. The skill's Nexus integration section covers the offline fallback and when
prior guidance can be reused.

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
