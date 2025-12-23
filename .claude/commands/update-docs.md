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

**Question 1: Which package changed?**
- Options: `core`, `react`, `test-utils`, `root`, `multiple`
- Suggested: {based on git diff}

**Question 2: What type of change?**
- Options: `component`, `testing`, `storybook`, `tokens`, `build`, `other`
- Suggested: {based on file types}

**Question 3: What specifically changed?**
- Free text, suggest based on diff

### 3. Determine Affected Documentation

| Change Type | Files to Check |
|-------------|----------------|
| component | `packages/react/CLAUDE.md`, `.claude/rules/components.md` |
| testing | `.claude/rules/testing.md`, `packages/test-utils/CLAUDE.md` |
| storybook | `.claude/rules/storybook.md` |
| tokens | `packages/core/CLAUDE.md`, `.claude/rules/tokens.md` |
| build | `CLAUDE.md` (root) |

### 4. Review and Propose Changes

For each affected file, compare documentation vs actual code and propose updates.

### 5. Confirm and Apply

Ask: "Apply these changes? (all / select / none)"
