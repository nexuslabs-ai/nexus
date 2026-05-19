---
name: pr-review-guide
description: Review pull requests for code quality and architecture. Use when reviewing PRs, checking code changes, or evaluating pull requests.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git:*, gh:*)
  - WebSearch
  - WebFetch
user-invocable: false
---

# PR Review

## Purpose

Review pull requests to ensure code quality, architectural soundness, and adherence to project conventions.

## When to Use

- Reviewing any pull request
- Evaluating code changes before merge
- Checking adherence to project standards

## Base Rules

Always load and check the diff against:

| Rule                                                                             | Purpose                                                                            |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [code-quality.md](../../rules/code-quality.md)                                   | Governing principle: favor simplicity over cleverness; index to per-rule files     |
| [ripple-effect.md](../../rules/ripple-effect.md)                                 | Flag callers, callees, or adjacent code left inconsistent after the change         |
| [guard-clauses.md](../../rules/guard-clauses.md)                                 | Flag deeply nested conditionals; require happy path at column 0                    |
| [composition-over-render-props.md](../../rules/composition-over-render-props.md) | Flag `renderItem` / `mode` discriminators; require `children` or per-mode split    |
| [useeffect-escape-hatch.md](../../rules/useeffect-escape-hatch.md)               | Flag effects that orchestrate React state instead of syncing with external systems |
| [logging-proportionality.md](../../rules/logging-proportionality.md)             | Flag noisy incremental logs; require one dense canonical log line                  |
| [code-comments.md](../../rules/code-comments.md)                                 | Flag rationale blocks, unjustified TODOs, comments that restate the code           |
| [no-follow-up-deferral.md](../../rules/no-follow-up-deferral.md)                 | Reject deferral framing unless a tracked issue is cited                            |
| [project-stage.md](../../rules/project-stage.md)                                 | Reject new migration files; flag backcompat shims and feature flags                |

## Review Process

1. **Understand the context**
   - Read PR description and linked GitHub issues
   - Understand what problem is being solved
   - Check the scope of changes

2. **Research third-party dependencies (MANDATORY)**
   - Identify ALL third-party libraries and dependencies in the changed code
   - Use WebSearch to find latest documentation, best practices, and common mistakes
   - Verify the code uses these dependencies correctly and as intended
   - Check for version-specific behavior or configuration options
   - See "External Technology Research" section below for details

3. **Analyze the changes**
   - Review each changed file thoroughly
   - Don't just skim the diff—understand what each function/module does
   - Consider how changes fit into the existing system
   - Compare implementation against researched best practices

4. **Apply your lens**
   - Use your agent's focus areas (architecture vs implementation)
   - Check against your agent's checklist items
   - Apply the Challenge & Propose format for issues

5. **Document findings**
   - Use the output format below
   - Be specific with file:line references
   - Distinguish blocking vs minor issues
   - Include findings from external research

## External Technology Research

**This phase is MANDATORY for any PR that uses third-party dependencies or external technologies.**

### When to Research

Any code using something you didn't write:

- Third-party libraries and frameworks
- Platform or browser APIs
- External services and integrations
- Build tools and configuration
- Any dependency where correct usage matters

### What to Search For

1. **Correct usage** — Is the API being used as intended?
2. **Configuration options** — Are there settings that should be customized?
3. **Common mistakes** — What do people typically get wrong?
4. **Version-specific behavior** — Check `package.json` versions against docs
5. **Performance considerations** — Any known gotchas?

### How to Research

```
"{library/technology} best practices {current year}"
"{library/technology} {version} documentation"
"{library/technology} common mistakes"
"{library/technology} correct usage"
"{library/technology} vs {alternative}"
```

### Research Output

Include a research summary in your review:

```markdown
### 🔍 External Technology Research

| Technology | Findings                | Impact on PR     |
| ---------- | ----------------------- | ---------------- |
| {name}     | {key finding from docs} | {recommendation} |
```

## Common Checklist

These items apply regardless of review perspective:

- [ ] No exposed secrets or API keys
- [ ] No console.log or debugging code left in
- [ ] No commented-out code without explanation
- [ ] Imports organized and minimal
- [ ] Follows existing patterns in codebase
- [ ] Changes are within scope of PR description
- [ ] Third-party dependencies used correctly (verified via research)
- [ ] No common mistakes for libraries/technologies used

## Scope of Findings

Any issue you flag is fixable in this PR. Do not recommend deferring to a follow-up PR unless you can cite an existing tracked issue or milestone that owns the work (e.g. `#295`, `M11.6`).

Avoid deferral framing in comments — "not blocking, monitor post-launch", "flag for later rollout", "worth doing in a follow-up" — unless a tracked issue is cited. See `.claude/rules/no-follow-up-deferral.md`.

## Output Format

The template below **is the entire review body**. There is no preamble paragraph, no trailing summary, no "Findings" / "Observations" / "Notes" section, and no numbered list of concerns in the body. If a concern needs more than the Issues row, it goes in `Architectural Concerns` — subject to the cap.

```markdown
## {Agent Name} Review — Verdict: {VERDICT}

### Issues

| #   | Severity    | File         | Issue                 | Suggestion                   |
| --- | ----------- | ------------ | --------------------- | ---------------------------- |
| 1   | ❌ Blocking | `file.ts:42` | {concise description} | {only if fix is non-obvious} |
| 2   | ⚠️ Minor    | `file.ts:15` | {concise description} | {only if fix is non-obvious} |

### Architectural Concerns

{Only include this section for genuine design-level issues where the fix isn't obvious.
Use: **{Concern title}** (`file.ts:line`) — 1–2 sentences max. Omit section entirely if none.}

### Research Flags

{Only include if third-party dependency research found misuse. Omit section entirely if none.}

| Technology | Issue          | Recommendation |
| ---------- | -------------- | -------------- |
| {name}     | {what's wrong} | {what to do}   |
```

**Rules:**

- Omit `Architectural Concerns` section entirely if there are none
- Omit `Research Flags` section entirely if there are none
- Omit `Issues` table entirely if there are no issues (verdict will be `APPROVED`)
- `Suggestion` column: only populate when the fix isn't obvious from the description
- **No preamble or trailing paragraph.** The verdict line is the only body prose above the Issues table.
- **No "Findings", "Observations", "Notes", "Informational", "What's done well" sections** — banned regardless of heading
- **No praise.** "Cleanly mirrors X", "neatly avoids Y", "sound type plumbing" — cut all of it. The verdict (`APPROVED`/`COMMENT`/`CHANGES REQUIRED`) is how you signal quality
- **No numbered concern lists in the body.** If you have three concerns, they are three rows in `Issues` or three entries in `Architectural Concerns` — not `1. … 2. … 3. …` prose in the body
- No summary status table
- Challenge & Propose format is retired — use `Architectural Concerns` for design discussions only

## Review Writing Style

Keep everything Claude writes in a review **tight and plain**. Long paragraphs and jargon force reviewers to reconstruct reasoning on every skim; reviews that read like essays get ignored.

**Caps apply to every output — review body, Architectural Concerns, and inline comments:**

- **Inline comment body:** ≤50 words. **Count them.** One sentence on the problem, one on the fix. If it needs a file-path reference + rationale, it belongs in `Architectural Concerns`, not inline.
- **Issue table "Issue" column:** ≤15 words. A phrase, not a paragraph.
- **Architectural Concerns entry:** ≤2 sentences. No code references beyond the `file.ts:line` anchor. No alternative-path discussion ("or consider X"). Pick one proposed direction.
- **Plain language.** No downstream-ripple narration, prior-incident history, or design-rationale prose.
- **No multi-paragraph bodies, bullet sub-lists, or quoted code blocks** unless the fix is a literal one-line replacement.

**Shape for inline comments:** `**{Blocking|Minor} — {one-phrase label}:** {what's wrong}. {what to do}.`

If a finding doesn't fit these caps, it's usually two findings — split it. If a finding doesn't fit _split_, it belongs in `Architectural Concerns`.

**Self-check before returning:** re-read your own review body. If any paragraph is longer than two sentences, or any inline comment is longer than three lines, cut or split it.

## Returning Findings

**Do NOT post the review yourself.** The calling command is responsible for posting.

Return your findings in this structured format so the caller can consolidate and post:

```
REVIEW_BODY:
{your review body using the output format above}

INLINE_COMMENTS:
[
  {"path": "src/components/button.tsx", "line": 42, "body": "**Issue:** ..."},
  {"path": "src/utils/format.ts", "line": 15, "body": "**Minor:** ..."}
]

VERDICT: APPROVE | COMMENT | REQUEST_CHANGES
```

### Finding Line Numbers

To get the correct `line` number for inline comments:

1. **From the diff:** Use `gh pr diff {pr_number}` to get file patches
2. **Line numbers:** Use the line number in the **new file** (right side of diff), not the diff position
3. **Only comment on changed lines:** Inline comments must be on lines that appear in the diff

## Verdict Options

| Agent                   | Verdicts                                           | When to Use         |
| ----------------------- | -------------------------------------------------- | ------------------- |
| **Principal Architect** | `APPROVED`, `NEEDS DISCUSSION`, `CHANGES REQUIRED` | Architecture review |
| **SDE2**                | `APPROVED`, `MINOR CHANGES`, `CHANGES REQUIRED`    | Code quality review |

### Verdict Guidelines

| Condition                                          | Verdict                               |
| -------------------------------------------------- | ------------------------------------- |
| No issues found                                    | `APPROVED`                            |
| Only minor style/preference issues                 | `MINOR CHANGES` or `NEEDS DISCUSSION` |
| Bugs, missing error handling, architectural issues | `CHANGES REQUIRED`                    |

## Agent-Specific Focus

Each agent applies their own lens when using this skill:

### Principal Architect Focus

- System design and patterns
- Scalability implications
- Data model correctness
- API contract clarity
- Security boundaries
- Extensibility

### SDE2 Focus

- Type safety
- Error handling
- Code structure and readability
- Naming conventions
- Edge cases
- Testability

See agent files for detailed focus areas and checklists.
