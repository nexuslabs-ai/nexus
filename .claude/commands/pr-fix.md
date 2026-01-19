# PR Fix

Fix issues identified in PR reviews using the SDE2 agent.

## Agent Used

| Agent                     | Skill                               | Purpose           |
| ------------------------- | ----------------------------------- | ----------------- |
| [SDE2](../agents/sde2.md) | [pr-fix](../skills/pr-fix/SKILL.md) | Fix review issues |

## Required Input

- **PR Number**: $ARGUMENTS (e.g., `8`)

If no PR number provided, ask the user for it.

## Flow

```
┌─────────────────────────────────────────┐
│             /pr-fix 8                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│            Fetch PR Reviews             │
│  • Get PR details                       │
│  • Get review comments                  │
│  • Get inline comments                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Spawn SDE2 Agent               │
│  • Use Task tool with subagent_type     │
│  • Pass PR context in prompt            │
│  • Agent executes pr-fix skill          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          SDE2 Executes pr-fix           │
│  • Categorize issues (blocking/minor)   │
│  • Load context (files, rules)          │
│  • Fix issues one by one                │
│  • Verify fixes                         │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Gather Review Context

1. **Fetch PR details:**

   ```
   mcp__github__get_pull_request(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

2. **Extract Linear issue** from PR title `[NEX-###]` or body `Closes NEX-###`

3. **Get all review feedback:**

   ```
   mcp__github__get_pull_request_reviews(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   mcp__github__get_pull_request_comments(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

4. **Get changed files:**
   ```
   mcp__github__get_pull_request_files(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

### Phase 2: Spawn SDE2 Agent

**IMPORTANT: You MUST use the Task tool to spawn the SDE2 agent. Do NOT execute the skill yourself.**

```
Task(
  subagent_type: "sde2",
  description: "Fix PR review issues",
  prompt: """
  Fix issues identified in PR #{pr_number} review.

  ## PR Details
  - Title: {pr_title}
  - Branch: {branch_name}
  - Linear Issue: {issue_id}

  ## Review Issues to Fix

  ### Blocking Issues (❌)
  {list of blocking issues with file:line references}

  ### Minor Issues (⚠️)
  {list of minor issues with file:line references}

  ## Changed Files
  {list of files changed in PR}

  ## Instructions
  1. Read the pr-fix skill at `.claude/skills/pr-fix/SKILL.md`
  2. Load appropriate rules based on changed files
  3. Fix blocking issues first, then minor issues
  4. Work through one fix at a time with summaries
  5. Verify fixes with typecheck and lint
  """
)
```

The SDE2 agent will:

- Load the pr-fix skill and follow its workflow
- Categorize and prioritize issues
- Fix issues incrementally with user approval
- Verify fixes with typecheck/lint

### Phase 3: Report Completion

After all fixes are complete, output:

```markdown
## ✅ PR Fixes Complete

### PR: #{pr_number} - {title}

### Issues Addressed

| Issue         | File        | Status   |
| ------------- | ----------- | -------- |
| {description} | `file:line` | ✅ Fixed |

### Changes Made

| File           | Change        |
| -------------- | ------------- |
| `path/to/file` | {description} |

### Verification

- [ ] TypeScript: ✅
- [ ] Lint: ✅
- [ ] Tests: ✅
- [ ] All comments addressed: ✅

### Next Steps

1. Review the fixes
2. Commit and push changes
3. Request re-review if needed
```

## Issue Priority

The SDE2 agent fixes issues in this order:

| Priority | Type        | Indicators                          |
| -------- | ----------- | ----------------------------------- |
| 1st      | Blocking ❌ | "must", "required", REQUEST_CHANGES |
| 2nd      | Minor ⚠️    | "consider", "suggestion", "nit"     |

## Error Handling

| Error                             | Action                       |
| --------------------------------- | ---------------------------- |
| PR not found                      | Ask user to verify PR number |
| No reviews found                  | Inform user, nothing to fix  |
| Review comment unclear            | Ask user for clarification   |
| Fix requires architectural change | Ask user (no patches!)       |

## Important Notes

- **No patches:** SDE2 will ask user if proper fix is unclear
- **One at a time:** Fixes are done incrementally with summaries
- **User approval:** Waits for confirmation after each significant fix
