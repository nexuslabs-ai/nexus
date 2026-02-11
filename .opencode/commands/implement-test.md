---
description: Implement tests using the Tester agent with focus on result validation
agent: tester
---

Implement tests focusing on result validation over code coverage.

## Context Detection

Based on `$ARGUMENTS`, detect context:

- `*.md` path → Testing plan or spec file
- `NEX-###` → Linear ticket
- `*.ts` or `*.tsx` → Source file to test
- String description → Use as requirements
- No arguments → Use conversation context

## Instructions

1. Read the implement-test skill at `.claude/skills/implement-test/SKILL.md`
2. Understand the code to be tested
3. Design test strategy (fixtures, mocks, assertions)
4. Create test plan with todos
5. Implement tests phase by phase
6. Verify all tests passing

## Testing Philosophy

- Result validation over code coverage
- Real fixtures, not synthetic data (no `foo`, `bar`, `baz`)
- Partial matching on what matters
- Mock only external boundaries
- Determinism is non-negotiable
- One reason to fail per test

## Arguments

$ARGUMENTS
