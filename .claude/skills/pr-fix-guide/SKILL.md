---
name: pr-fix-guide
description: Fix PR review issues directly without agent delegation. Combines root cause analysis and fixing into a single-agent flow.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
  - WebSearch
  - WebFetch
user-invocable: false
---

# PR Fix Guide

## Purpose

Fix issues identified in PR reviews by combining root cause analysis (normally done by Principal Architect) and fixing (normally done by SDE2) into a single direct flow.

## Rules

The full ruleset lives in `.claude/rules/*.md` — those files are the spec. Don't try to keep all of them in working memory.

The **Reflex Check** lives in [`implement-guide/SKILL.md`](../implement-guide/SKILL.md) (Part 2 → Step 3). It names the actions that should evoke a rule mid-write and points at the relevant file. The same triggers fire when writing a fix patch as when writing fresh code — read it before each fix; open a full rule file only when a reflex actually fires.

Two reflexes specific to fixing (root-cause and don't-over-fix) live below in Part 2 → Fix Process.

## Part 1: Root Cause Analysis

### Step 1: Gather Review Context

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

### Step 2: Categorize Issues

Extract all issues from reviews and categorize:

| Category | Indicator                                       | Priority   |
| -------- | ----------------------------------------------- | ---------- |
| Blocking | "must", "required", "blocking", REQUEST_CHANGES | Fix first  |
| Minor    | "consider", "suggestion", "nit", COMMENT        | Fix second |

### Step 3: Analyze Root Causes

For EACH issue:

1. **Read the relevant file(s)** and surrounding code context -- not just the flagged line
2. **Understand** what the reviewer is pointing at
3. **Research the root cause** -- is it the line they flagged, or something deeper? What's the real shape of the problem?
4. **Decide what you'll actually do** -- this may agree with, improve on, or differ from the reviewer's suggestion
5. **Everything is in scope.** Do not carve out a "deferred" bucket. Reviewer framing like "not blocking", "follow-up", or "post-launch monitor" is not a license to skip — it is still a fix in this PR unless the finding maps to a cited, existing issue number. See `no-follow-up-deferral.md`.

Do NOT blindly accept the reviewer's suggested fix. Research and reason from the code.

Keep the reasoning in your head. The user verifies by reading the code, not prose — do NOT dump root-cause analysis into chat.

### Plan Output Format

Emit a single one-line-per-fix table, then proceed to fixing directly:

```markdown
## Plan: #{pr_number}

| #   | File:line    | Fix                         |
| --- | ------------ | --------------------------- |
| 1   | `file.ts:42` | {what you'll do — one line} |
| 2   | `file.ts:78` | {what you'll do — one line} |

Proceeding.
```

Do **not** wait for explicit approval. The plan is a preview so the user can interrupt if needed, not an approval gate. Pause only for a specific fix that is genuinely ambiguous or needs an architectural call.

---

## Part 2: Fixing

After user approves the analysis, fix all issues.

### Fix Process

**Before each change, run the Reflex Check from [`implement-guide/SKILL.md`](../implement-guide/SKILL.md) (Part 2 → Step 3).** Same triggers fire here — the reviewer comment is the _occasion_ for the edit, but the edit itself can still smuggle in a `useEffect` that orchestrates React state, a defensive existence check the schema already guarantees, a callback / mode-discriminator prop, a `// fix for X` comment, or a ripple gap downstream.

Two reflexes specific to fixing:

- _The reviewer flagged a symptom — is the symptom the root cause, or is the cause upstream?_
  -> Read enough surrounding code to find the cause, not just the flagged line. Fix the cause; the symptom resolves itself. The reviewer's suggested fix is **input, not instruction** — you may agree with it, improve on it, or differ.

- _About to fix the flagged line, plus "improve a few things while I'm here"?_
  -> Don't. Make the smallest correct change that addresses the comment. Out-of-scope cleanup belongs in its own PR.

1. **Fix all blocking issues first, then all minor issues**
2. **For each fix:**
   - Read the specific comment / inline-review thread fully — including any reviewer back-and-forth
   - Run the Reflex Check (above) at the moment of writing the change — same triggers, plus the two fix-specific ones

3. **Fix autonomously** -- do NOT stop for user confirmation between individual fixes

4. **Only pause if:**
   - The fix is genuinely ambiguous (the reviewer's intent is unclear)
   - The fix requires an architectural decision beyond the scope of the comment
   - A fix introduces a conflict with another pending fix

### Verify Fixes

1. **Run checks:**

   ```bash
   npm run typecheck
   npm run lint
   ```

2. **Review against original comments:**
   - Does each fix address the feedback?
   - Any unintended side effects?

3. **Fix any new issues introduced**

### Fix Output Format

Single one-line-per-fix table. No "Changes Made", no code snippets, no "Next Steps". Verification is one trailing line.

```markdown
## Done: #{pr_number}

| #   | File:line    | Fix                        |
| --- | ------------ | -------------------------- |
| 1   | `file.ts:42` | {what was done — one line} |
| 2   | `file.ts:78` | {what was done — one line} |

Typecheck + lint: clean.
```

If something is genuinely not clean, say so on that trailing line — don't pad the output with a verification section.

---

## Principles

1. **Architect-first thinking** -- understand root causes before fixing; reviewer suggestions are input, not instructions
2. **Address the actual feedback** -- read carefully, don't assume
3. **Follow loaded rules** -- `.claude/rules/` files are source of truth
4. **Terse output** -- plan and completion are one-line-per-fix tables; no root-cause prose, no rationale, no "issues addressed" narrative. The user verifies via the code
5. **Plan is a preview, not a gate** -- emit the plan table and proceed directly. Pause only on a specific fix that is genuinely ambiguous
6. **No patches** -- proper solutions only
7. **Don't over-fix** -- only change what was requested
8. **Research before fixing** -- if a fix involves a third-party library, verify correct usage via WebSearch
