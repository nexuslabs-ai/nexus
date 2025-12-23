---
description: Run pre-PR checklist (typecheck, lint, test, build)
allowed-tools: Bash(yarn typecheck:*), Bash(yarn lint:*), Bash(yarn test:*), Bash(yarn build:*), Bash(git status:*)
---

Run the pre-PR checklist for this project:

1. Run `yarn typecheck` and report any TypeScript errors
2. Run `yarn lint` and report any linting warnings/errors
3. Run `yarn test` and report test results
4. Run `yarn build` and report any build issues
5. Run `git status` to check for uncommitted changes

After all checks complete, provide a summary table:

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript | Pass/Fail | Details |
| Lint | Pass/Fail | Details |
| Tests | Pass/Fail | Details |
| Build | Pass/Fail | Details |
| Git | Clean/Dirty | Details |

If all checks pass, confirm the code is ready for PR.
