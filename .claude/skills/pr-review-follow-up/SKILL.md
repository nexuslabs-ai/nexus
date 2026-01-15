---
name: pr-review-follow-up
description: Follow-up PR review to verify fixes after changes are pushed. Use when re-reviewing a PR after initial review feedback has been addressed.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git:*, gh:*)
user-invocable: true
---

# PR Review Follow-up

## Purpose

Re-review a pull request after the author has pushed changes in response to initial review feedback. Verify that previous issues are fixed and check for any new issues introduced.

## When to Use

- After initial PR review when changes have been pushed
- When verifying review feedback has been addressed
- When re-evaluating a PR after modifications

## Prerequisites

- Previous review must exist (from pr-review skill)
- Get previous issues from PR comments, review thread, or conversation history

## Follow-up Process

1. **Gather previous issues**
   - List all blocking and minor issues from previous review
   - Note the file:line locations

2. **Identify changed files**
   - Get commits since last review
   - List files modified since last review

3. **Verify previous issues**
   - For each previous issue, check if it's addressed
   - Mark status using indicators below

4. **Review new changes only**
   - Don't re-review unchanged code
   - Focus on files modified since last review
   - Check for new issues introduced by fixes

5. **Apply verdict logic**
   - Use follow-up verdict guidelines below

## Status Indicators

| Status             | Meaning                           | When to Use                    |
| ------------------ | --------------------------------- | ------------------------------ |
| ✅ Fixed           | Issue has been addressed          | Code changed correctly         |
| ❌ Still Present   | Issue remains unchanged           | No change or wrong change      |
| ⚠️ Partially Fixed | Attempted but incomplete          | Some aspects fixed, others not |
| 🔄 Changed         | Code changed, needs re-evaluation | Different approach taken       |

## Smart Agent Selection

For follow-up reviews, not all agents need to re-review:

| Condition                                  | Agents Used                |
| ------------------------------------------ | -------------------------- |
| Only code fixes (same files modified)      | SDE2 only                  |
| New files added                            | SDE2 + Principal Architect |
| Significant structural changes             | SDE2 + Principal Architect |
| Previous review had architectural concerns | SDE2 + Principal Architect |

## Output Format

### SDE2 Follow-up Output

```markdown
## SDE2 Follow-up Review

### Previous Issues Status

| Issue         | File        | Status           | Notes            |
| ------------- | ----------- | ---------------- | ---------------- |
| {description} | {file:line} | ✅ Fixed         | {verification}   |
| {description} | {file:line} | ❌ Still Present | {what's wrong}   |
| {description} | {file:line} | ⚠️ Partial       | {what's missing} |

### Issue Resolution Summary

- **Fixed:** {count}
- **Still Present:** {count}
- **Partially Fixed:** {count}

### New Changes Assessment

Files modified since last review:

| File   | Changes        | Assessment       |
| ------ | -------------- | ---------------- |
| {file} | {what changed} | ✅/⚠️/❌ {notes} |

### New Issues Found

#### Blocking ❌

- {new issue with file:line}

#### Minor ⚠️

- {new issue with file:line}

### Verdict: {VERDICT}

{Summary of overall status}

---

_Follow-up review - focused on changes since last review_
```

### Principal Architect Follow-up Output

```markdown
## Principal Architect Follow-up Review

### Scope

Reviewing: {new files / structural changes / previous concerns}

### Previous Concerns Status

| Concern   | Status           | Notes   |
| --------- | ---------------- | ------- |
| {concern} | ✅ Addressed     | {how}   |
| {concern} | ❌ Still Present | {issue} |

### New Architectural Assessment

| Area               | Status   | Notes        |
| ------------------ | -------- | ------------ |
| New Files          | ✅/⚠️/❌ | {assessment} |
| Structural Changes | ✅/⚠️/❌ | {assessment} |

### New Concerns (if any)

{Any new architectural issues in the changes}

### Verdict: {VERDICT}

---

_Follow-up review - focused on changes since last review_
```

## Posting the Review

When posting via `mcp__github__create_pull_request_review`, use **both** the body and inline comments:

### Review Body (`body` parameter)

Use the output format above for the overall follow-up summary.

### Inline Comments (`comments` parameter)

Add inline comments for:

- **Still present issues:** Comment on the same line explaining what's still wrong
- **New issues found:** Comment on the specific line with the new issue

```json
{
  "comments": [
    {
      "path": "src/utils/format.ts",
      "line": 15,
      "body": "❌ **Still Present:** This issue from the previous review hasn't been addressed. The null check is still missing."
    },
    {
      "path": "src/components/button.tsx",
      "line": 42,
      "body": "⚠️ **New Issue:** This was introduced in the fix - consider using optional chaining here."
    }
  ]
}
```

### Review Event

| Condition                              | Event             |
| -------------------------------------- | ----------------- |
| All issues fixed, no new issues        | `APPROVE`         |
| Issues fixed, only minor new issues    | `COMMENT`         |
| Blocking issues remain OR new blockers | `REQUEST_CHANGES` |

## Follow-up Verdict Guidelines

### SDE2 Verdict Logic

| Condition                                            | Verdict            |
| ---------------------------------------------------- | ------------------ |
| All previous blocking issues fixed, no new issues    | `APPROVED`         |
| Previous issues fixed, only minor new issues         | `MINOR CHANGES`    |
| Blocking issues still present OR new blocking issues | `CHANGES REQUIRED` |

### Principal Architect Verdict Logic

| Condition                                 | Verdict            |
| ----------------------------------------- | ------------------ |
| Previous architectural concerns addressed | `APPROVED`         |
| Minor questions remain, non-blocking      | `NEEDS DISCUSSION` |
| Significant architectural issues remain   | `CHANGES REQUIRED` |

## When Principal Architect Skips Follow-up

Principal Architect only needs to re-review when:

- New files were added since last review
- Significant structural changes detected
- Previous review had architectural concerns

If none of these apply, SDE2 handles the follow-up alone.
