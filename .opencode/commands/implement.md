---
description: Implement features and tasks using the SDE2 agent
agent: sde2
---

Implement features and tasks with production-quality code.

## Context Detection

Based on `$ARGUMENTS`, detect context:

- `NEX-###` pattern → Fetch from Linear
- `.md` file path → Read markdown spec
- `--with-architect` or `-a` → Use Principal Architect for planning first
- No arguments → Use conversation context

## Instructions

1. Read the implement skill at `.claude/skills/implement/SKILL.md`
2. Gather requirements from detected context source
3. Explore existing code patterns
4. Research dependencies (MANDATORY for third-party libraries)
5. Create implementation plan with todos
6. Implement phase by phase with summaries
7. Verify with typecheck and lint

## If --with-architect flag

First spawn the principal-architect agent to create a design plan, get user approval, then proceed with implementation.

## Arguments

$ARGUMENTS
