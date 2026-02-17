---
description: Review pull requests with dual-agent analysis (Architecture + Code Quality)
agent: build
---

Comprehensive code review using dual-agent analysis. Auto-detects context based on changed files.

## Required Input

- **PR Number or Linear Issue ID**: $ARGUMENTS (e.g., `5` or `NEX-140`)
- **Optional flag**: `--follow-up` or `-f` for re-review after changes

## Mode Detection

| Flag                 | Mode             | Behavior                              |
| -------------------- | ---------------- | ------------------------------------- |
| (none)               | Full Review      | Both agents review all changed files  |
| `--follow-up` / `-f` | Follow-up Review | SDE2 always, Architect only if needed |

## Instructions

1. Read the pr-review skill at `.claude/skills/pr-review/SKILL.md`
2. Fetch PR details using `gh pr view $ARGUMENTS`
3. Get changed files and read their content
4. Auto-detect context and load relevant rules based on files changed
5. Spawn **principal-architect** agent for architecture review
6. Spawn **sde2** agent for code quality review
7. Post reviews to GitHub with appropriate verdict

## Full Review Flow

1. Get PR context (title, description, linked Linear issue)
2. Read all changed files
3. Load rules based on detected context (components, tokens, etc.)
4. Principal Architect reviews: system design, scalability, data model, security
5. SDE2 reviews: type safety, error handling, code structure, testability
6. Post reviews with inline comments at specific lines
7. Add Linear comment summarizing review

## Follow-up Mode

Only review files modified since last review. Check if previous issues are fixed.
SDE2 always runs. Architect only if new files or structural changes detected.

## Arguments

$ARGUMENTS
