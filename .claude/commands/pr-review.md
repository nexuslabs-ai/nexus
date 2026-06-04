# PR Review

Comprehensive code review using dual-agent analysis. Auto-detects context based on changed files.

## Agents Used

| Agent                                                   | Skill                                                 | Perspective                  |
| ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------- |
| [Principal Architect](../agents/principal-architect.md) | [pr-review-guide](../skills/pr-review-guide/SKILL.md) | Architecture & system design |
| [SDE2](../agents/sde2.md)                               | [pr-review-guide](../skills/pr-review-guide/SKILL.md) | Code quality & correctness   |

## Required Input

- **PR Number**: $ARGUMENTS (e.g., `5`)
- **Optional flag**: `--follow-up` or `-f` for re-review after changes

```
Examples:
  /pr-review 5                → Full review by PR number
  /pr-review 5 --follow-up    → Follow-up review (after changes pushed)
  /pr-review 5 -f             → Follow-up (short flag)
```

If no input provided, ask the user for the PR number.

## Mode Detection

| Flag                 | Mode             | Behavior                              |
| -------------------- | ---------------- | ------------------------------------- |
| (none)               | Full Review      | Both agents review all changed files  |
| `--follow-up` / `-f` | Follow-up Review | SDE2 always, Architect only if needed |

## Non-negotiable: agents do the review, not you

Every `/pr-review` run MUST spawn both agents via the Agent tool — full or follow-up, big diff or small. If you catch yourself thinking "I can verify this directly," that's the trigger to spawn, not a reason to skip. Reaching the end without an Agent call = spec violation; re-run from Phase 3 / F4.

---

## Full Review Mode (Default)

### Phase 1: Get PR Context

1. **Fetch PR details:**

   ```bash
   gh pr view {pr_number} --json number,title,body,headRefName,baseRefName,author,url,mergedAt
   ```

2. **Extract:**
   - PR title and description
   - Base and head branches
   - Linked GitHub issue (from body `Closes #123`)
   - PR author

3. **If GitHub issue linked, fetch it:**

   ```bash
   gh issue view {issue_number} --json number,title,body,labels,state,url
   ```

   - Understand what was requested
   - Note acceptance criteria

### Phase 2: Read Changed Files & Detect Context

1. **Get list of changed files:**

   ```bash
   gh pr diff {pr_number}
   ```

2. **For each changed file, read full content** using Read tool

3. **Auto-detect context and load rules:**

   Check `.claude/rules/` for any rule files relevant to the changed files. Load and follow all applicable rules. Always load [github.md](../rules/github.md).

### Phase 3: Spawn Both Review Agents in Parallel

**IMPORTANT: Spawn both agents simultaneously using the Agent tool. Do NOT execute the reviews yourself and do NOT wait for one to finish before spawning the other.**

Each agent has a distinct focus lane — keep to it to avoid duplicate inline comments.

```
// Spawn both at the same time:

Agent(
  subagent_type: "principal-architect",
  description: "Architecture review for PR",
  prompt: """
  Review PR #{pr_number} from an architectural perspective.

  ## PR Details
  - Title: {pr_title}
  - Description: {pr_description}
  - GitHub Issue: #{issue_number}

  ## Changed Files
  {list of changed files with patches}

  ## Context
  - Loaded rules: {rules loaded based on files changed}
  - Issue requirements: {from GitHub issue if available}

  ## Your Focus (ONLY these areas — do not overlap with SDE2)
  - Module boundaries and folder structure
  - Data model design and type system decisions
  - Security boundaries (auth patterns, server-only access)
  - Scalability concerns (N+1 queries, computed fields, caching)
  - API contract design (route structure, response shapes)
  - Stub/placeholder routes and their production readiness

  ## Out of Scope for You
  Do NOT flag: deprecated library APIs, code style, naming, redundant code patterns.
  Those are SDE2's lane.

  ## Output Caps (strict — enforced; see pr-review-guide skill for full rules)
  - **Review body = verdict line + template sections ONLY.** No preamble paragraph, no trailing summary.
  - **No "Findings", "Observations", "Notes", "What's done well" sections** (banned regardless of heading).
  - **No praise.** "Cleanly mirrors X", "sound type plumbing", "neatly avoids Y" — cut all of it.
  - **No numbered concern lists in the body.** Three concerns = three table rows or three Architectural Concerns entries, not `1. … 2. … 3. …` prose.
  - **Inline comment ≤50 words.** Count them. If it needs file refs + rationale, surface in Architectural Concerns instead.
  - **Architectural Concerns entry ≤2 sentences.** No alternative-path discussion; pick one direction.

  ## Instructions
  1. Focus exclusively on your lane above
  2. Output review following the skill's format AND the output caps above
  3. Self-check: re-read your review body. Any paragraph >2 sentences or inline comment >3 lines → cut or split.
  4. Return the review body and any inline comments — DO NOT post to GitHub yourself
  """
)

Agent(
  subagent_type: "sde2",
  description: "Code quality review for PR",
  prompt: """
  Review PR #{pr_number} for code quality and correctness.

  ## PR Details
  - Title: {pr_title}
  - Description: {pr_description}
  - GitHub Issue: #{issue_number}

  ## Changed Files
  {list of changed files with patches}

  ## Context
  - Loaded rules: {rules loaded based on files changed}
  - Issue requirements: {from GitHub issue if available}

  ## Your Focus (ONLY these areas — do not overlap with Architect)
  - Type safety and TypeScript correctness
  - Deprecated or incorrect library API usage (Zod, Next.js, etc.)
  - Error handling completeness
  - Redundant or overly complex code patterns
  - Naming and readability for the target audience (design-system maintainers)
  - Edge cases and potential runtime bugs

  ## Out of Scope for You
  Do NOT flag: folder structure, data model design, scalability, auth patterns.
  Those are the Architect's lane.

  ## Output Caps (strict — enforced; see pr-review-guide skill for full rules)
  - **Review body = verdict line + template sections ONLY.** No preamble paragraph, no trailing summary.
  - **No "Findings", "Observations", "Notes", "What's done well" sections** (banned regardless of heading).
  - **No praise.** "Cleanly mirrors X", "sound type plumbing", "neatly avoids Y" — cut all of it.
  - **No numbered concern lists in the body.** Three concerns = three table rows, not `1. … 2. … 3. …` prose.
  - **Inline comment ≤50 words.** Count them. If it needs file refs + rationale, surface in Architectural Concerns instead.
  - **Architectural Concerns entry ≤2 sentences.** No alternative-path discussion; pick one direction.

  ## Instructions
  1. Focus exclusively on your lane above
  2. Output review following the skill's format AND the output caps above
  3. Self-check: re-read your review body. Any paragraph >2 sentences or inline comment >3 lines → cut or split.
  4. Return the review body and any inline comments — DO NOT post to GitHub yourself
  """
)
```

Wait for both to return, then proceed to Phase 4.

### Phase 4: Consolidate Inline Comments

Before posting, deduplicate inline comments across both agent results to prevent the same file:line from getting two comments.

**Steps:**

1. Collect all inline comments from both agents into a flat list, tagged by source:

   ```
   architect_comments = [{path, line, body}, ...]
   sde2_comments      = [{path, line, body}, ...]
   ```

2. Find overlapping comments — where both agents commented on the same `path:line`.

3. For each overlap, **keep only one**:
   - If the comments cover different aspects, merge them into a single comment body (e.g. "**Architecture:** ... \n\n**Code quality:** ...")
   - If one is more specific/actionable, keep that one and discard the other
   - Assign the merged/kept comment to whichever agent's review body it fits best

4. The result is two non-overlapping comment sets:
   - `architect_final_comments` — Architect inline comments with no duplicates
   - `sde2_final_comments` — SDE2 inline comments with no duplicates

5. Proceed to Phase 5 with these deduplicated sets.

### Phase 5: Context-Specific Checks

Based on detected context, perform additional checks:

#### If `.claude/**` files changed:

**Check Claude Code Documentation for latest capabilities:**

```
WebFetch(url: "https://code.claude.com/docs/en/", prompt: "What are the current best practices for Claude Code agents, skills, and commands? What capabilities are available?")
```

Review against:

| Aspect                 | What to Check                                           |
| ---------------------- | ------------------------------------------------------- |
| Agent Structure        | Does agent file follow current Claude Code conventions? |
| Skill Format           | Are skills using correct YAML frontmatter format?       |
| Command Structure      | Do commands follow current patterns?                    |
| Available Capabilities | Are we using latest Claude Code features appropriately? |
| Deprecated Patterns    | Are there any deprecated patterns being used?           |

**Documentation sections to check:**

- Agent configuration and best practices
- Skill auto-discovery and invocation
- Command patterns and arguments
- Tool permissions and security
- Any new features or deprecations

### Phase 6: Post Reviews

Use `architect_final_comments` and `sde2_final_comments` from Phase 4 — never the raw agent output directly.

**Reviews are posted from the `nexuslabs-ai-bot` bot account.** Prefix every `gh api .../reviews --method POST` call with `GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot)`. This keeps review comments attributed to the bot and avoids GitHub's self-authored-PR rejection of `APPROVE` / `REQUEST_CHANGES` (since the bot is never the PR author).

1. **Post Principal Architect review:**

   ```bash
   GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot) \
     gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews \
     --method POST \
     --input - <<'EOF'
   {
   "body": "{Principal Architect review from skill}",
   "event": "COMMENT",
   "comments": {architect_final_comments}
   }
   EOF
   ```

2. **Post SDE2 review:**

   ```bash
   GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot) \
     gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews \
     --method POST \
     --input - <<'EOF'
   {
   "body": "{SDE2 review from skill}",
   "event": "{APPROVE|COMMENT|REQUEST_CHANGES}",
   "comments": {sde2_final_comments}
   }
   EOF
   ```

   **Verdict logic** (based on combined findings from both agents):
   | Condition | Event |
   |-----------|-------|
   | No blocking issues in either review | `APPROVE` |
   | Only minor issues (⚠️) | `COMMENT` |
   | Any blocking issues (❌) | `REQUEST_CHANGES` |

---

## Follow-up Review Mode (`--follow-up`)

When developer pushes changes after initial review, use follow-up mode to focus on what changed.

Both agents always run. Each agent covers the same focus lane as in the full review — Architect owns structure and architecture, SDE2 owns code quality and correctness.

### Phase F1: Get PR & Previous Reviews

1. **Fetch PR details** (same as full review)

2. **Fetch previous reviews:**

   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews
   ```

3. **Fetch review comments:**

   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/comments
   ```

4. **Parse previous review data:**
   - Extract issues raised (blocking ❌ and minor ⚠️), separated by agent (Architect vs SDE2)
   - Note which files had comments
   - Get timestamp of last review

### Phase F2: Identify Changes Since Last Review

1. **Get commits since last review:**

   ```bash
   gh api repos/{owner}/{repo}/pulls/{pr_number}/commits
   ```

   - Filter to commits after last review timestamp

2. **Get current changed files:**

   ```bash
   gh pr diff {pr_number}
   ```

3. **Read files that were:**
   - Mentioned in previous review comments
   - Modified in commits since last review

### Phase F3: Verify Previous Issues

For each issue from the previous review:

1. **Read the current state** of the file/line mentioned
2. **Determine status:**

   | Status             | Meaning                           |
   | ------------------ | --------------------------------- |
   | ✅ Fixed           | Issue has been addressed          |
   | ❌ Still Present   | Issue remains unchanged           |
   | ⚠️ Partially Fixed | Attempted but incomplete          |
   | 🔄 Changed         | Code changed, needs re-evaluation |

### Phase F4: Spawn Both Agents in Parallel

**IMPORTANT: Spawn both agents simultaneously. Do NOT execute the reviews yourself and do NOT wait for one before spawning the other.**

Each agent covers the same focus lane as the full review.

```
Agent(
  subagent_type: "principal-architect",
  description: "Follow-up architecture review for PR",
  prompt: """
  Follow-up architecture review for PR #{pr_number} after changes.

  ## PR Details
  - Title: {pr_title}
  - Commits since last review: {commit list}

  ## Previous Architectural Issues
  {list of Architect issues from previous review with file:line}

  ## Files Modified Since Last Review
  {list of changed files}

  ## Your Focus (same as full review — ONLY these areas)
  - Module boundaries and folder structure
  - Data model design and type system decisions
  - Security boundaries (auth patterns, server-only access)
  - Scalability concerns (N+1 queries, computed fields, caching)
  - API contract design (route structure, response shapes)
  - Stub/placeholder routes and their production readiness

  ## Output Caps (strict — enforced; see pr-review-follow-up skill for full rules)
  - **Review body = verdict line + template sections ONLY.** No preamble, no trailing summary.
  - **No "Findings", "Observations", "Notes", "What's done well" sections.**
  - **No praise.** Verdict signals quality; prose doesn't.
  - **No numbered concern lists in the body** — use table rows.
  - **Inline comment ≤50 words.** Count them.
  - **Unresolved Issues "Notes" column ≤15 words.**

  ## Instructions
  1. Review ONLY files modified since last review
  2. Check if previous architectural issues are fixed
  3. Look for new architectural issues in the changes
  4. Don't re-review unchanged code
  5. Self-check: re-read your review. Any paragraph >2 sentences or inline comment >3 lines → cut or split.
  6. Return findings — DO NOT post to GitHub yourself
  """
)

Agent(
  subagent_type: "sde2",
  description: "Follow-up code quality review for PR",
  prompt: """
  Follow-up code quality review for PR #{pr_number} after changes.

  ## PR Details
  - Title: {pr_title}
  - Commits since last review: {commit list}

  ## Previous SDE2 Issues
  {list of SDE2 issues from previous review with file:line}

  ## Files Modified Since Last Review
  {list of changed files}

  ## Your Focus (same as full review — ONLY these areas)
  - Type safety and TypeScript correctness
  - Deprecated or incorrect library API usage (Zod, Next.js, etc.)
  - Error handling completeness
  - Redundant or overly complex code patterns
  - Naming and readability for the target audience (design-system maintainers)
  - Edge cases and potential runtime bugs

  ## Output Caps (strict — enforced; see pr-review-follow-up skill for full rules)
  - **Review body = verdict line + template sections ONLY.** No preamble, no trailing summary.
  - **No "Findings", "Observations", "Notes", "What's done well" sections.**
  - **No praise.** Verdict signals quality; prose doesn't.
  - **No numbered concern lists in the body** — use table rows.
  - **Inline comment ≤50 words.** Count them.
  - **Unresolved Issues "Notes" column ≤15 words.**

  ## Instructions
  1. Review ONLY files modified since last review
  2. Check if previous SDE2 issues are fixed
  3. Look for new code quality issues in the changes
  4. Don't re-review unchanged code
  5. Self-check: re-read your review. Any paragraph >2 sentences or inline comment >3 lines → cut or split.
  6. Return findings — DO NOT post to GitHub yourself
  """
)
```

Wait for both to return, then proceed to Phase F5.

### Phase F5: Consolidate & Post Follow-up Reviews

Deduplicate inline comments across both agents (same as Phase 4 in full review mode), then post two separate reviews:

1. **Post Principal Architect follow-up review**
2. **Post SDE2 follow-up review**

### Phase F6: Post Follow-up Review

Post from the `nexuslabs-ai-bot` bot account (same pattern as Phase 6):

```bash
GH_TOKEN=$(gh auth token --user nexuslabs-ai-bot) \
  gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews \
  --method POST \
  --input - <<'EOF'
{
  "body": "{Follow-up review}",
  "event": "{APPROVE|COMMENT|REQUEST_CHANGES}",
  "comments": [
    {"path": "path/to/file", "line": 42, "body": "New issue or still present"}
  ]
}
EOF
```

**Verdict logic for follow-up:**

| Condition                                            | Event             |
| ---------------------------------------------------- | ----------------- |
| All blocking issues fixed, no new issues             | `APPROVE`         |
| Some issues fixed, only minor remaining              | `COMMENT`         |
| Blocking issues still present OR new blocking issues | `REQUEST_CHANGES` |

---

## Output Formats

### Full Review Output

```markdown
## PR Review — #{pr_number} {title}

**Principal Architect:** {APPROVED|NEEDS DISCUSSION|CHANGES REQUIRED}
**SDE2:** {APPROVED|MINOR CHANGES|CHANGES REQUIRED}

### Issues

| #   | Agent     | Severity    | File         | Issue         |
| --- | --------- | ----------- | ------------ | ------------- |
| 1   | Architect | ❌ Blocking | `file.ts:42` | {description} |
| 2   | SDE2      | ⚠️ Minor    | `file.ts:15` | {description} |

{Omit Issues table entirely if no issues found.}

### Links

- **PR:** {pr_url}
- **GitHub Issue:** #{issue_number}
```

### Follow-up Review Output

```markdown
## Follow-up Review — #{pr_number} {title}

**SDE2:** {APPROVED|MINOR CHANGES|CHANGES REQUIRED}
**Architect:** {APPROVED|NEEDS DISCUSSION|CHANGES REQUIRED|⏭️ Skipped}

### Unresolved Issues

| #   | Original Issue | File         | Status           | Notes                |
| --- | -------------- | ------------ | ---------------- | -------------------- |
| 1   | {description}  | `file.ts:42` | ❌ Still Present | {what's still wrong} |
| 2   | {description}  | `file.ts:15` | ⚠️ Partial       | {what's missing}     |

{If all resolved: "All previous issues resolved."}

### New Issues

| #   | Agent | Severity    | File         | Issue         |
| --- | ----- | ----------- | ------------ | ------------- |
| 1   | SDE2  | ❌ Blocking | `file.ts:10` | {description} |

{Omit New Issues table entirely if none.}

### Links

- **PR:** {pr_url}
- **GitHub Issue:** #{issue_number}
```

---

## Review Principles

1. **Be objective** - Review as if you didn't write the code
2. **Be specific** - Point to exact lines, suggest fixes
3. **Be constructive** - Explain why, not just what
4. **Prioritize** - Blocking issues vs nice-to-haves
5. **Follow loaded rules** - Rules files are source of truth
6. **Consider context** - Understand the issue's goals
7. **In follow-up mode** - Focus on changes, don't repeat old feedback
8. **No deferral framing** - Anything worth flagging is fixable in this PR. Do not recommend deferring to a follow-up PR unless you cite an existing tracked issue or milestone. See `.claude/rules/no-follow-up-deferral.md`.
