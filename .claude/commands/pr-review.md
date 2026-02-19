# PR Review

Comprehensive code review using dual-agent analysis. Auto-detects context based on changed files.

## Agents Used

| Agent                                                   | Skill                                     | Perspective                  |
| ------------------------------------------------------- | ----------------------------------------- | ---------------------------- |
| [Principal Architect](../agents/principal-architect.md) | [pr-review](../skills/pr-review/SKILL.md) | Architecture & system design |
| [SDE2](../agents/sde2.md)                               | [pr-review](../skills/pr-review/SKILL.md) | Code quality & correctness   |

## Required Input

- **PR Number or Linear Issue ID**: $ARGUMENTS (e.g., `5` or `NEX-140`)
- **Optional flag**: `--follow-up` or `-f` for re-review after changes

```
Examples:
  /pr-review 5                → Full review (first time)
  /pr-review 5 --follow-up    → Follow-up review (after changes pushed)
  /pr-review NEX-140 -f       → Follow-up using Linear issue
```

If no input provided, ask the user for PR number.

## Mode Detection

| Flag                 | Mode             | Behavior                              |
| -------------------- | ---------------- | ------------------------------------- |
| (none)               | Full Review      | Both agents review all changed files  |
| `--follow-up` / `-f` | Follow-up Review | SDE2 always, Architect only if needed |

---

## Full Review Mode (Default)

### Phase 1: Get PR Context

1. **Determine input type:**
   - If numeric only → PR number
   - If contains `NEX-` → Linear issue ID

2. **If Linear issue ID provided:**

   ```
   mcp__linear__get_issue(id: "{issue_id}")
   ```

   - Look for PR link in attachments/links
   - If no PR found, ask user for PR number

3. **Fetch PR details:**

   ```bash
   gh pr view {pr_number} --json number,title,body,headRefName,baseRefName,author,url,mergedAt
   ```

4. **Extract:**
   - PR title and description
   - Base and head branches
   - Linked Linear issue (from title `[NEX-###]` or body)
   - PR author

5. **If Linear issue linked, fetch ticket:**

   ```
   mcp__linear__get_issue(id: "{issue_id}")
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

   | Files Changed                              | Rules to Load                                                                                                                                                                                             |
   | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `packages/react/src/components/**`         | [components.md](../rules/components.md), [testing.md](../rules/testing.md), [storybook.md](../rules/storybook.md), [figma.md](../rules/figma.md), [shadcn-divergences.md](../rules/shadcn-divergences.md) |
   | `packages/react/src/hooks/**`              | [testing.md](../rules/testing.md)                                                                                                                                                                         |
   | `packages/core/**`, `packages/tailwind/**` | [tokens.md](../rules/tokens.md)                                                                                                                                                                           |
   | `.claude/**`                               | Check [Claude Code docs](https://code.claude.com/docs/en/) for latest capabilities                                                                                                                        |
   | Any PR                                     | [github.md](../rules/github.md), [linear.md](../rules/linear.md)                                                                                                                                          |

### Phase 3: Principal Architect Review

**IMPORTANT: You MUST use the Task tool to spawn the Principal Architect agent. Do NOT execute the review yourself.**

```
Task(
  subagent_type: "principal-architect",
  description: "Architecture review for PR",
  prompt: """
  Review PR #{pr_number} from an architectural perspective.

  ## PR Details
  - Title: {pr_title}
  - Description: {pr_description}
  - Linear Issue: {issue_id}

  ## Changed Files
  {list of changed files with patches}

  ## Context
  - Loaded rules: {rules loaded based on files changed}
  - Ticket requirements: {from Linear issue if available}

  ## Instructions
  1. Read the pr-review skill at `.claude/skills/pr-review/SKILL.md`
  2. Focus on: system design, scalability, data model, security boundaries
  3. Use Challenge & Propose format for issues
  4. Output review following the skill's format
  5. Return the review body and any inline comments
  """
)
```

### Phase 4: SDE2 Review

**IMPORTANT: You MUST use the Task tool to spawn the SDE2 agent. Do NOT execute the review yourself.**

```
Task(
  subagent_type: "sde2",
  description: "Code quality review for PR",
  prompt: """
  Review PR #{pr_number} for code quality and correctness.

  ## PR Details
  - Title: {pr_title}
  - Description: {pr_description}
  - Linear Issue: {issue_id}

  ## Changed Files
  {list of changed files with patches}

  ## Context
  - Loaded rules: {rules loaded based on files changed}
  - Ticket requirements: {from Linear issue if available}

  ## Instructions
  1. Read the pr-review skill at `.claude/skills/pr-review/SKILL.md`
  2. Focus on: type safety, error handling, code structure, testability
  3. Use Challenge & Propose format for issues
  4. Output review following the skill's format
  5. Return the review body and any inline comments
  """
)
```

### Phase 5: Context-Specific Checks

Based on detected context, perform additional checks:

#### If Component files changed:

Review against checklist in [components.md](../rules/components.md)

#### If Token files changed:

Review against checklist in [tokens.md](../rules/tokens.md)

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

1. **Post Principal Architect review:**

   ```bash
   gh api repos/INNOVATIVEGAMER/ds/pulls/{pr_number}/reviews \
     --method POST \
     -f body="{Principal Architect review from skill}" \
     -f event="COMMENT" \
     -F comments='[{inline comments}]'
   ```

2. **Post SDE2 review:**

   ```bash
   gh api repos/INNOVATIVEGAMER/ds/pulls/{pr_number}/reviews \
     --method POST \
     -f body="{SDE2 review from skill}" \
     -f event="{APPROVE|COMMENT|REQUEST_CHANGES}" \
     -F comments='[{inline comments}]'
   ```

   **Verdict logic:**
   | Condition | Event |
   |-----------|-------|
   | No blocking issues in either review | `APPROVE` |
   | Only minor issues (⚠️) | `COMMENT` |
   | Any blocking issues (❌) | `REQUEST_CHANGES` |

3. **If Linear ticket linked:**
   ```
   mcp__linear__create_comment(
     issueId: "{issue_id}",
     body: "📋 **PR Review Complete**\n\n🏛️ Architect: {verdict}\n👨‍💻 SDE2: {verdict}\n\nSee PR for details: {pr_url}"
   )
   ```

---

## Follow-up Review Mode (`--follow-up`)

When developer pushes changes after initial review, use follow-up mode to focus on what changed.

### Agent Selection (Smart)

| Condition                                  | Agents Used      |
| ------------------------------------------ | ---------------- |
| Only code fixes (same files modified)      | SDE2 only        |
| New files added                            | SDE2 + Architect |
| Significant structural changes             | SDE2 + Architect |
| Previous review had architectural concerns | SDE2 + Architect |

### Phase F1: Get PR & Previous Reviews

1. **Fetch PR details** (same as full review)

2. **Fetch previous reviews:**

   ```bash
   gh api repos/INNOVATIVEGAMER/ds/pulls/{pr_number}/reviews
   ```

3. **Fetch review comments:**

   ```bash
   gh api repos/INNOVATIVEGAMER/ds/pulls/{pr_number}/comments
   ```

4. **Parse previous review data:**
   - Extract issues raised (blocking ❌ and minor ⚠️)
   - Note which files had comments
   - Get timestamp of last review
   - Check if Architect raised architectural concerns

### Phase F2: Identify Changes Since Last Review

1. **Get commits since last review:**

   ```bash
   gh api repos/INNOVATIVEGAMER/ds/pulls/{pr_number}/commits
   ```

   - Filter to commits after last review timestamp

2. **Get current changed files:**

   ```bash
   gh pr diff {pr_number}
   ```

3. **Determine if Architect review needed:**
   - Check for new files (not in previous review)
   - Check for significant structural changes (new exports, renamed files)
   - Check if previous Architect review had concerns

4. **Read files that were:**
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

### Phase F4: Review New Changes

**SDE2 Review (Always):**

**IMPORTANT: You MUST use the Task tool to spawn the SDE2 agent. Do NOT execute the review yourself.**

```
Task(
  subagent_type: "sde2",
  description: "Follow-up review for PR",
  prompt: """
  Follow-up review for PR #{pr_number} after changes.

  ## PR Details
  - Title: {pr_title}
  - Commits since last review: {commit list}

  ## Previous Issues
  {list of issues from previous review with file:line}

  ## Files Modified Since Last Review
  {list of changed files}

  ## Instructions
  1. Read the pr-review-follow-up skill at `.claude/skills/pr-review-follow-up/SKILL.md`
  2. Review ONLY files modified since last review
  3. Check if previous issues are fixed
  4. Look for new issues in the changes
  5. Don't re-review unchanged code
  """
)
```

**Architect Review (If Triggered):**

Only spawn if: new files added, significant structural changes, or previous Architect review had concerns.

```
Task(
  subagent_type: "principal-architect",
  description: "Follow-up architecture review",
  prompt: """
  Follow-up architecture review for PR #{pr_number}.

  ## Why Architect Review Triggered
  {reason: new files / structural changes / previous concerns}

  ## Previous Architectural Concerns
  {list from previous Architect review if any}

  ## New/Changed Files
  {list of new or structurally changed files}

  ## Instructions
  1. Read the pr-review-follow-up skill at `.claude/skills/pr-review-follow-up/SKILL.md`
  2. Review new files for architectural fit
  3. Verify previous architectural concerns addressed
  4. Check structural changes for system impact
  """
)
```

### Phase F5: Post Follow-up Review

```bash
gh api repos/INNOVATIVEGAMER/ds/pulls/{pr_number}/reviews \
  --method POST \
  -f body="{Follow-up review}" \
  -f event="{APPROVE|COMMENT|REQUEST_CHANGES}" \
  -F comments='[{inline comments on new issues only}]'
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
## PR Review Complete

### PR: #{pr_number} - {title}

### Context Detected

{packages/areas affected}

### Rules Loaded

{list of rule files used}

### Principal Architect Review

**Verdict:** {APPROVED|NEEDS DISCUSSION|CHANGES REQUIRED}

| Area          | Status  |
| ------------- | ------- |
| System Design | {emoji} |
| Scalability   | {emoji} |
| Data Model    | {emoji} |
| Security      | {emoji} |

**Challenges Raised:** {count}

### SDE2 Review

**Verdict:** {APPROVED|MINOR CHANGES|CHANGES REQUIRED}

| Area           | Status  |
| -------------- | ------- |
| Type Safety    | {emoji} |
| Error Handling | {emoji} |
| Code Structure | {emoji} |

**Issues:** {blocking} blocking, {minor} minor

### Top Items to Address

1. {Most critical from either review}
2. {Second priority}
3. {Third priority}

### Links

- **PR:** {pr_url}
- **Linear:** {linear_url}
```

### Follow-up Review Output

```markdown
## Follow-up PR Review

### PR: #{pr_number} - {title}

### Review Scope

- **SDE2:** ✅ Reviewing changes
- **Architect:** {✅ Reviewing | ⏭️ Skipped (no structural changes)}

### Previous Issues Status

| Issue         | File        | Status           | Notes           |
| ------------- | ----------- | ---------------- | --------------- |
| {description} | {file:line} | ✅ Fixed         | {how fixed}     |
| {description} | {file:line} | ❌ Still Present | {what's wrong}  |
| {description} | {file:line} | ⚠️ Partial       | {what's needed} |

### Summary

- **Fixed:** {count} issues
- **Still Present:** {count} issues
- **New Issues:** {count} issues

### New Changes Review

| File   | Change         | Assessment       |
| ------ | -------------- | ---------------- |
| {file} | {what changed} | ✅/⚠️/❌ {notes} |

### New Issues Found (if any)

#### Blocking ❌

- {new issue with file:line}

#### Minor ⚠️

- {new issue with file:line}

### Verdict: {APPROVED|CHANGES REQUESTED}

{Summary message}

### Links

- **PR:** {pr_url}
- **Linear:** {linear_url}
```

---

## Review Principles

1. **Be objective** - Review as if you didn't write the code
2. **Be specific** - Point to exact lines, suggest fixes
3. **Be constructive** - Explain why, not just what
4. **Prioritize** - Blocking issues vs nice-to-haves
5. **Follow loaded rules** - Rules files are source of truth
6. **Consider context** - Understand the ticket's goals
7. **In follow-up mode** - Focus on changes, don't repeat old feedback
