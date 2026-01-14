# Post-Merge Cleanup

Handles cleanup tasks after a PR is merged: updates Linear ticket, switches to main, and deletes the feature branch.

## Required Input

- **PR Number**: The GitHub PR number (e.g., `6`)
- **Linear Issue ID**: Optional - will attempt to extract from PR body if not provided

If no PR number provided, ask the user for it.

## Execution Steps

### Step 1: Verify PR is Merged

1. **Fetch PR details** (see `.claude/rules/github.md` for MCP usage):

   ```
   mcp__github__get_pull_request(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

2. **Check merge status:**
   - If `merged_at` is null → PR not merged, inform user and stop
   - If `merged_at` has value → Continue with cleanup

3. **Extract Linear issue ID** using patterns from `.claude/rules/linear.md`:
   - Check PR title and body for issue ID patterns
   - If not found and not provided, ask user

### Step 2: Update Linear Ticket

1. **Verify/ensure status is Done** (see `.claude/rules/linear.md` for auto-update behavior):

   ```
   mcp__linear__update_issue(id: "{issue_id}", state: "Done")
   ```

   > This acts as a fallback - Linear may have auto-updated if PR had proper linking.

2. **Get current issue details** to read existing description (per `.claude/rules/linear.md`):

   ```
   mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
   ```

3. **Update description** to mark completed tasks:
   - Find checklist items (`- [ ]`) and mark them as done (`- [x]`)
   - Add a "## Completion Notes" section at the end with:
     - PR link
     - Merge date
     - Brief summary of what was implemented
     - Any deviations from original plan

4. **Add completion comment** (use emoji conventions from `.claude/rules/linear.md`):
   ```
   mcp__linear__create_comment(issueId: "{issue_id}", body: "✅ PR merged and ticket completed...")
   ```

### Step 3: Git Cleanup

1. **Get current branch name:**

   ```bash
   git branch --show-current
   ```

2. **Checkout main:**

   ```bash
   git checkout main
   ```

3. **Fetch and pull latest:**

   ```bash
   git fetch origin && git pull origin main
   ```

4. **Delete the feature branch locally:**

   ```bash
   git branch -d {branch_name}
   ```

5. **Delete remote branch** (optional, ask user first):
   ```bash
   git push origin --delete {branch_name}
   ```

## Output Summary

Provide a summary table:

```markdown
## ✅ Post-Merge Cleanup Complete

| Task                  | Status                  |
| --------------------- | ----------------------- |
| PR Merged             | ✅ Verified             |
| Linear Status         | ✅ Done (auto/verified) |
| Linear Description    | ✅ Updated              |
| Switched to main      | ✅                      |
| Pulled latest         | ✅                      |
| Local branch deleted  | ✅                      |
| Remote branch deleted | ✅/⏭️ Skipped           |

**Cleaned up:** `{branch_name}`
**Linear:** {linear_url}
```

## Error Handling

| Error                  | Action                                |
| ---------------------- | ------------------------------------- |
| PR not found           | Ask user to verify PR number          |
| PR not merged          | Inform user, stop execution           |
| Linear issue not found | Ask user for correct issue ID         |
| Branch deletion fails  | Warn user, continue with other tasks  |
| Not on feature branch  | Skip branch deletion, just fetch main |

## Example Usage

```
/post-merge 6
/post-merge 6 NEX-140
```
