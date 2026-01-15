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
│             Load SDE2 Agent             │
│  • Read AGENT.md (persona, base rules)  │
│  • Read pr-fix.md skill                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Execute pr-fix skill           │
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

### Phase 2: Load Agent & Execute

1. **Load SDE2 agent:**
   - Read `.claude/agents/sde2.md`
   - Read `.claude/skills/pr-fix/SKILL.md`

2. **Execute pr-fix skill:**
   - The skill handles categorization, context loading, and fixing
   - Follow the workflow defined in the skill file

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
