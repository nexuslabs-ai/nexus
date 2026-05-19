# PR Fix

Fix issues identified in PR reviews directly without agent delegation. You handle both root cause analysis and fixing yourself, following the pr-fix skill.

## Skill Used

| Skill                                                                  | Purpose                         |
| ---------------------------------------------------------------------- | ------------------------------- |
| [pr-fix-guide](../skills/pr-fix-guide/SKILL.md)                        | Root cause analysis + fix guide |
| [principal-architect.md](../agents/principal-architect.md) (reference) | Architectural thinking lens     |
| [sde2.md](../agents/sde2.md) (reference)                               | Code quality lens               |

## Required Input

- **PR Number**: $ARGUMENTS (e.g., `8`)

If no PR number provided, ask the user for it.

## Flow

```
+---------------------------------------+
|             /pr-fix 8                 |
+-----------------+---------------------+
                  |
                  v
+---------------------------------------+
|          Fetch PR Reviews             |
|  - Get PR details                     |
|  - Get review comments                |
|  - Get inline comments                |
+-----------------+---------------------+
                  |
                  v
+---------------------------------------+
|       Show Raw Issues to User         |
|  - List raw reviewer comments as-is   |
|  - No interpretation yet              |
|  - Blocking vs minor categorization   |
+-----------------+---------------------+
                  |
                  v
+---------------------------------------+
|      Root Cause Analysis (yourself)   |
|  - Read the actual code/files         |
|  - Research root causes               |
|  - Decide what you'll actually do     |
+-----------------+---------------------+
                  |
                  v
+---------------------------------------+
|    Show Plan Table to User            |
|  - One-line-per-fix table             |
|  - No wait — proceed directly         |
|  - Pause ONLY if genuinely ambiguous  |
+-----------------+---------------------+
                  |
                  v
+---------------------------------------+
|        Fix Issues (yourself)          |
|  - Follow the plan                    |
|  - Blocking first, then minor         |
|  - Verify fixes                       |
+-----------------+---------------------+
                  |
                  v
+---------------------------------------+
|   Report Completion (one-line table)  |
+-----------------+---------------------+
```

---

## Execution

### Phase 1: Gather Review Context

**Do this yourself. Do NOT spawn any agents.**

1. **Fetch PR details:**

   ```bash
   gh pr view {pr_number} --json number,title,body,headRefName,baseRefName,author,url
   ```

2. **Extract GitHub issue** from PR body (`Closes #123`)

3. **Get all review feedback:**

   ```bash
   # Resolve owner/repo
   gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"'

   gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews
   gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
   ```

4. **Get changed files:**

   ```bash
   gh pr diff {pr_number}
   ```

### Phase 2: Show Raw Issues

Present the reviewer's comments verbatim -- no interpretation, no proposed fixes yet:

```markdown
## Raw Review Comments: #{pr_number} -- {title}

### Blocking Issues

1. `{file:line}` -- "{exact reviewer comment}"
2. `{file:line}` -- "{exact reviewer comment}"

### Minor Issues

1. `{file:line}` -- "{exact reviewer comment}"

---

Running root cause analysis...
```

Do NOT wait for user input here -- immediately proceed to Phase 3.

### Phase 3: Root Cause Analysis

**Do this yourself. Do NOT spawn any agents.**

Read the pr-fix skill at `.claude/skills/pr-fix-guide/SKILL.md` and follow Part 1 (Root Cause Analysis):

For EACH issue:

1. Read the relevant file(s) and surrounding code context
2. Understand what the reviewer is pointing at
3. **Research the root cause** — is it the line they flagged, or something deeper? What's the real shape of the problem?
4. Decide what you'll actually do — agree with the reviewer, improve on their suggestion, or take a different tack

Do NOT blindly accept the reviewer's suggested fix. Research and reason from the code.

Keep this reasoning in your head — do NOT dump root-cause prose into chat. The user verifies by reading the code, not a written analysis.

### Phase 4: Show Plan Table

Present the plan as a single one-line-per-fix table. No root-cause prose, no rationale, no "does this look right":

```markdown
## Plan: #{pr_number}

| #   | File:line    | Fix                         |
| --- | ------------ | --------------------------- |
| 1   | `file.ts:42` | {what you'll do — one line} |
| 2   | `file.ts:78` | {what you'll do — one line} |

Proceeding.
```

Then **proceed directly to Phase 5**. Do not wait for approval. The user will interrupt if they disagree with an entry.

**Pause only if** a fix is genuinely ambiguous or requires a new architectural decision the user has not weighed in on — in that specific case, ask before proceeding (not for the whole plan, just for the ambiguous line).

### Phase 5: Fix Issues

**Do this yourself. Do NOT spawn any agents.**

Follow Part 2 (Fixing) of the skill:

1. Create TodoWrite from the plan table
2. Fix all blocking issues first, then all minor issues
3. Follow the plan
4. Fix issues one at a time but do NOT stop for user confirmation between fixes
5. Only pause if a fix is genuinely ambiguous or requires a new architectural decision
6. Verify all fixes with typecheck and lint at the end

### Phase 6: Report Completion

After all fixes are complete, output a single one-line-per-fix table. No "Changes Made", no "Verification" section, no "Next Steps". Verification results go in one trailing line.

```markdown
## Done: #{pr_number}

| #   | File:line    | Fix                        |
| --- | ------------ | -------------------------- |
| 1   | `file.ts:42` | {what was done — one line} |
| 2   | `file.ts:78` | {what was done — one line} |

Typecheck + lint: clean.
```

If typecheck or lint surfaced an issue that was then fixed, that's fine — report the final state (`clean`). If something is genuinely not clean, say so on that trailing line.

---

## Issue Priority

Fix issues in this order:

| Priority | Type     | Indicators                          |
| -------- | -------- | ----------------------------------- |
| 1st      | Blocking | "must", "required", REQUEST_CHANGES |
| 2nd      | Minor    | "consider", "suggestion", "nit"     |

## Error Handling

| Error                            | Action                               |
| -------------------------------- | ------------------------------------ |
| PR not found                     | Ask user to verify PR number         |
| No reviews found                 | Inform user, nothing to fix          |
| Analysis disagrees with reviewer | Surface disagreement clearly to user |
| Fix requires new arch decision   | Ask user (no patches!)               |

## Important Notes

- **Architect-first thinking:** Read the actual code and reason from first principles -- reviewer suggestions are input, not instructions
- **Plan surface, not approval gate:** The plan table is a preview so the user can interrupt if needed — it is not a wait-for-approval step
- **Terse output:** No root-cause prose, no rationale, no "issues addressed" prose. Plan and completion are one-line-per-fix tables
- **No patches:** Follow the plan; if a specific fix becomes ambiguous mid-flight, pause on that fix and ask
- **One at a time:** Fixes are applied incrementally (blocking first, then minor), but without stopping between them
- **No follow-up deferrals:** Every flagged issue is fixed in this PR. Reviewer framing like "not blocking", "follow-up PR", or "post-launch monitor" is not a license to skip — it is still in scope unless the finding maps to a cited, existing issue number. See `.claude/rules/no-follow-up-deferral.md`.
