---
description: Update documentation after codebase changes
---

Interactively update Claude Code documentation based on codebase changes.

## Flow

### 1. Analyze Git Diff

```bash
git diff --name-only HEAD~5
git diff --stat
```

Use this to prepare suggestions for the questions below.

### 2. Ask Questions

**Question 1: Which area changed?**

- Options: `core`, `tailwind`, `react`, `test-utils`, `playground`, `claude-config`, `root`, `multiple`
- Suggested: {based on git diff}

**Question 2: What type of change?**

- Options: `component`, `testing`, `storybook`, `tokens`, `build`, `commands`, `rules`, `skills`, `agents`, `other`
- Suggested: {based on file types}

**Question 3: What specifically changed?**

- Free text, suggest based on diff

### 3. Determine Affected Documentation

#### Package Documentation

| Package Changed | Files to Check                                                                  |
| --------------- | ------------------------------------------------------------------------------- |
| core            | `packages/core/CLAUDE.md`, `packages/core/README.md`, `.claude/rules/tokens.md` |
| tailwind        | `packages/tailwind/CLAUDE.md`, `.claude/rules/tokens.md`                        |
| react           | `packages/react/CLAUDE.md`, `.claude/rules/components.md`                       |
| test-utils      | `packages/test-utils/CLAUDE.md`, `.claude/rules/testing.md`                     |
| playground      | `apps/playground/CLAUDE.md`                                                     |

#### Change Type Documentation

| Change Type | Files to Check                                                                             |
| ----------- | ------------------------------------------------------------------------------------------ |
| component   | `packages/react/CLAUDE.md`, `.claude/rules/components.md`, `.claude/commands/component.md` |
| testing     | `.claude/rules/testing.md`, `packages/test-utils/CLAUDE.md`                                |
| storybook   | `.claude/rules/storybook.md`                                                               |
| tokens      | `packages/core/CLAUDE.md`, `packages/tailwind/CLAUDE.md`, `.claude/rules/tokens.md`        |
| build       | `CLAUDE.md` (root), package.json scripts                                                   |
| commands    | `.claude/commands/*.md`, `CLAUDE.md` (slash commands table)                                |
| rules       | `.claude/rules/*.md`, `CLAUDE.md` (convention rules table)                                 |
| skills      | `.claude/skills/*/SKILL.md`, `.claude/rules/skills-agents.md`                              |
| agents      | `.claude/agents/*.md`, `.claude/rules/skills-agents.md`                                    |

#### Cross-Reference Checks

When updating any file, also check for references in:

- `CLAUDE.md` (root) - project structure, package table, command table
- Other package CLAUDE.md files that may import/reference the changed package
- `.claude/commands/*.md` - may reference paths or patterns

### 4. Review and Propose Changes

For each affected file, compare documentation vs actual code and propose updates.

### 5. Confirm and Apply

Ask: "Apply these changes? (all / select / none)"
