---
description: Fix issues identified in PR reviews
agent: sde2
---

Fix issues identified in PR reviews using the SDE2 agent.

## Required Input

- **PR Number**: $ARGUMENTS (e.g., `8`)

If no PR number provided, ask the user for it.

## Instructions

1. Read the pr-fix skill at `.claude/skills/pr-fix/SKILL.md`
2. Fetch PR reviews and comments using `gh pr view $ARGUMENTS --comments`
3. Categorize issues:
   - **Blocking (❌)**: "must", "required", REQUEST_CHANGES
   - **Minor (⚠️)**: "consider", "suggestion", "nit"
4. Load appropriate rules based on changed files
5. Fix blocking issues first, then minor issues
6. Work through one fix at a time with summaries
7. Verify fixes with typecheck and lint

## Important

- **No patches:** Ask user if proper fix is unclear
- **One at a time:** Fix issues incrementally with summaries
- **User approval:** Wait for confirmation after each significant fix

## Arguments

$ARGUMENTS
