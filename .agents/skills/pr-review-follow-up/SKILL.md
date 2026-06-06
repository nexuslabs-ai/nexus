---
name: pr-review-follow-up
description: Follow-up PR review to verify fixes after changes are pushed. Use when re-reviewing a PR after initial review feedback has been addressed.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git:*, gh:*)
  - WebSearch
  - WebFetch
user-invocable: false
---

# PR Review Follow-up

## Purpose

Re-review a pull request after the author has pushed changes in response to initial review feedback. Verify that previous issues are fixed and check for any new issues introduced.

## When to Use

- After initial PR review when changes have been pushed
- When verifying review feedback has been addressed
- When re-evaluating a PR after modifications

## Base Rules

Always load and check the new diff against:

| Rule                                                                                        | Purpose                                                                            |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [code-quality.md](../../../.claude/rules/code-quality.md)                                   | Governing principle: favor simplicity over cleverness; index to per-rule files     |
| [ripple-effect.md](../../../.claude/rules/ripple-effect.md)                                 | Flag callers, callees, or adjacent code left inconsistent after the change         |
| [guard-clauses.md](../../../.claude/rules/guard-clauses.md)                                 | Flag deeply nested conditionals; require happy path at column 0                    |
| [composition-over-render-props.md](../../../.claude/rules/composition-over-render-props.md) | Flag `renderItem` / `mode` discriminators; require `children` or per-mode split    |
| [useeffect-escape-hatch.md](../../../.claude/rules/useeffect-escape-hatch.md)               | Flag effects that orchestrate React state instead of syncing with external systems |
| [logging-proportionality.md](../../../.claude/rules/logging-proportionality.md)             | Flag noisy incremental logs; require one dense canonical log line                  |
| [code-comments.md](../../../.claude/rules/code-comments.md)                                 | Flag rationale blocks, unjustified TODOs, comments that restate the code           |
| [no-follow-up-deferral.md](../../../.claude/rules/no-follow-up-deferral.md)                 | Reject deferral framing unless a tracked issue is cited                            |
| [project-stage.md](../../../.claude/rules/project-stage.md)                                 | Reject new migration files; flag backcompat shims and feature flags                |
| [docs-mcp.md](../../../.claude/rules/docs-mcp.md)                                           | Verify third-party API usage via nexus-docs-mcp before approving                   |

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

3. **Research dependencies (if applicable)**
   - If fixes involve third-party libraries, verify against latest documentation
   - Use WebSearch to confirm fixes align with correct usage patterns
   - Check for any new recommendations since initial review
   - This is especially important if initial review raised concerns about library usage

4. **Verify previous issues**
   - For each previous issue, check if it's addressed
   - Mark status using indicators below
   - For API-related fixes, verify against researched best practices

5. **Review new changes only**
   - Don't re-review unchanged code
   - Focus on files modified since last review
   - Check for new issues introduced by fixes

6. **Apply verdict logic**
   - Use follow-up verdict guidelines below

## Status Indicators

| Status             | Meaning                           | When to Use                    |
| ------------------ | --------------------------------- | ------------------------------ |
| ✅ Fixed           | Issue has been addressed          | Code changed correctly         |
| ❌ Still Present   | Issue remains unchanged           | No change or wrong change      |
| ⚠️ Partially Fixed | Attempted but incomplete          | Some aspects fixed, others not |
| 🔄 Changed         | Code changed, needs re-evaluation | Different approach taken       |

## Dependency Research in Follow-ups

Research is required in follow-up reviews when:

| Condition                                      | Research Action                     |
| ---------------------------------------------- | ----------------------------------- |
| Initial review flagged incorrect library usage | Verify fix against latest docs      |
| Fix changed how a dependency is used           | Confirm usage is correct per docs   |
| New dependency added in the fix                | Full research on new dependency     |
| Fix involves library configuration             | Verify configuration is appropriate |

### Verification Checklist

When fixes involve third-party dependencies:

- [ ] Fix aligns with current official documentation
- [ ] Library is being used as intended
- [ ] No common mistakes introduced in the fix
- [ ] Any new usage patterns are correct

## Agent Selection

Both agents always run in follow-up reviews. Each covers the same focus lane as the full review — Architect owns structure and architecture, SDE2 owns code quality and correctness.

## Scope of Findings

Any new issue you flag is fixable in this PR. Do not recommend deferring to a follow-up PR unless you can cite an existing tracked issue or milestone that owns the work. Avoid deferral framing ("not blocking, monitor post-launch", "flag for later rollout") unless a tracked issue is cited. See `.claude/rules/no-follow-up-deferral.md`.

## Output Format

The template below **is the entire review body**. No preamble, no trailing summary, no "Findings" / "Observations" / "Notes" sections, no numbered concern lists in the body.

```markdown
## {Agent Name} Follow-up — Verdict: {VERDICT}

### Unresolved Issues

| #   | Original Issue | File         | Status           | Notes                |
| --- | -------------- | ------------ | ---------------- | -------------------- |
| 1   | {description}  | `file.ts:42` | ❌ Still Present | {what's still wrong} |
| 2   | {description}  | `file.ts:15` | ⚠️ Partial       | {what's missing}     |

### New Issues

| #   | Severity    | File         | Issue         | Suggestion                   |
| --- | ----------- | ------------ | ------------- | ---------------------------- |
| 1   | ❌ Blocking | `file.ts:10` | {description} | {only if fix is non-obvious} |
```

**Rules:**

- `Unresolved Issues`: only include rows for issues that are ❌ Still Present or ⚠️ Partial. No ✅ Fixed rows.
- If all previous issues are resolved, replace the table with: _All previous issues resolved._
- `New Issues`: omit section entirely if no new issues found
- **No preamble or trailing paragraph.** The verdict line is the only body prose above the Unresolved Issues table
- **No "Findings", "Observations", "Notes", "What's done well" sections** — banned regardless of heading
- **No praise.** Verdict signals quality; prose doesn't
- **No numbered concern lists in the body.** Concerns go in table rows, not `1. … 2. … 3. …` narrative
- No Issue Resolution Summary counters
- No New Changes Assessment table (only surface problems, not a file-by-file audit)

## Review Writing Style

Same caps as `pr-review-guide` — apply to every output: review body, `Unresolved Issues` notes, `New Issues` table, inline comments.

- **Inline comment body:** ≤50 words. **Count them.** One sentence on the problem, one on the fix. If it needs file-path references + rationale, split or surface in `Unresolved Issues` notes
- **Unresolved Issues "Notes" column:** ≤15 words
- **New Issues "Issue" column:** ≤15 words
- **Plain language.** No downstream-ripple narration, prior-incident history, or code blocks unless the fix is one line
- **Shape for inline comments:** `**{✅ Fixed|❌ Still Present|⚠️ Partial|⚠️ New}:** {what's wrong}. {what to do}.`

If a finding doesn't fit these caps, split it into two findings.

**Self-check before returning:** re-read your own review body. If any paragraph is longer than two sentences, or any inline comment is longer than three lines, cut or split it.

## Returning Findings

**Do NOT post the review yourself.** The calling command is responsible for posting.

Return your findings in this structured format so the caller can post:

```
REVIEW_BODY:
{your follow-up review body using the output format above}

INLINE_COMMENTS:
[
  {"path": "src/utils/format.ts", "line": 15, "body": "❌ **Still Present:** The null check is still missing."},
  {"path": "src/components/button.tsx", "line": 42, "body": "⚠️ **New Issue:** Consider using optional chaining here."}
]

VERDICT: APPROVE | COMMENT | REQUEST_CHANGES
```

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
