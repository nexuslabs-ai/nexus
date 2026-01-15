# PR Review

Comprehensive code review using dual-agent analysis. Auto-detects context based on changed files.

## Agents Used

| Agent                                                         | Skill                                                          | Perspective                  |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------- |
| [Principal Architect](../agents/principal-architect/AGENT.md) | [pr-review](../agents/principal-architect/skills/pr-review.md) | Architecture & system design |
| [SDE2](../agents/sde2/AGENT.md)                               | [pr-review](../agents/sde2/skills/pr-review.md)                | Code quality & correctness   |

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

   ```
   mcp__github__get_pull_request(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
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

   ```
   mcp__github__get_pull_request_files(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

2. **For each changed file, read full content** using Read tool

3. **Auto-detect context and load rules:**

   | Files Changed                              | Rules to Load                                                                                                                                                                                             |
   | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `packages/react/src/components/**`         | [components.md](../rules/components.md), [testing.md](../rules/testing.md), [storybook.md](../rules/storybook.md), [figma.md](../rules/figma.md), [shadcn-divergences.md](../rules/shadcn-divergences.md) |
   | `packages/react/src/hooks/**`              | [testing.md](../rules/testing.md)                                                                                                                                                                         |
   | `packages/core/**`, `packages/tailwind/**` | [tokens.md](../rules/tokens.md)                                                                                                                                                                           |
   | `packages/context-engine/**`               | [context-engine.md](../rules/context-engine.md)                                                                                                                                                           |
   | `.claude/**`                               | Review agent/skill structure                                                                                                                                                                              |
   | Any PR                                     | [github.md](../rules/github.md), [linear.md](../rules/linear.md)                                                                                                                                          |

### Phase 3: Principal Architect Review

> **Load agent:** Read `.claude/agents/principal-architect/AGENT.md`
> **Load skill:** Read `.claude/agents/principal-architect/skills/pr-review.md`

Execute the Principal Architect's pr-review skill:

- Focus on system design, scalability, data model
- Use Challenge & Propose format for issues
- Output review in skill's format

### Phase 4: SDE2 Review

> **Load agent:** Read `.claude/agents/sde2/AGENT.md`
> **Load skill:** Read `.claude/agents/sde2/skills/pr-review.md`

Execute the SDE2's pr-review skill:

- Focus on code quality, error handling, testability
- Use Challenge & Propose format for issues
- Output review in skill's format

### Phase 5: Context-Specific Checks

Based on detected context, perform additional checks:

#### If Context Engine files changed:

**AI Consumer Assessment** (from [context-engine.md](../rules/context-engine.md)):

| Aspect                | What to Check                       |
| --------------------- | ----------------------------------- |
| Response Parseability | Is data easy for AI to parse?       |
| Context Completeness  | Enough info for code generation?    |
| Error Guidance        | Do errors help AI recover?          |
| Search Quality        | Will queries find right components? |

#### If Component files changed:

Review against checklist in [components.md](../rules/components.md)

#### If Token files changed:

Review against checklist in [tokens.md](../rules/tokens.md)

### Phase 6: Post Reviews

1. **Post Principal Architect review:**

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "{Principal Architect review from skill}",
     event: "COMMENT",
     comments: [{inline comments}]
   )
   ```

2. **Post SDE2 review:**

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "{SDE2 review from skill}",
     event: "{APPROVE|COMMENT|REQUEST_CHANGES}",
     comments: [{inline comments}]
   )
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

   ```
   mcp__github__get_pull_request_reviews(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

3. **Fetch review comments:**

   ```
   mcp__github__get_pull_request_comments(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

4. **Parse previous review data:**
   - Extract issues raised (blocking ❌ and minor ⚠️)
   - Note which files had comments
   - Get timestamp of last review
   - Check if Architect raised architectural concerns

### Phase F2: Identify Changes Since Last Review

1. **Get commits since last review:**

   ```
   mcp__github__list_commits(owner: "INNOVATIVEGAMER", repo: "ds", sha: "{pr_head_sha}")
   ```

   - Filter to commits after last review timestamp

2. **Get current changed files:**

   ```
   mcp__github__get_pull_request_files(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
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

> **Load agent:** Read `.claude/agents/sde2/AGENT.md`
> **Load skill:** Read `.claude/agents/sde2/skills/pr-review.md` (follow-up mode)

- Review ONLY files modified since last review
- Check if previous issues are fixed
- Look for new issues in the changes
- Don't re-review unchanged code

**Architect Review (If Triggered):**

> **Load agent:** Read `.claude/agents/principal-architect/AGENT.md`
> **Load skill:** Read `.claude/agents/principal-architect/skills/pr-review.md` (follow-up mode)

- Review new files for architectural fit
- Verify previous architectural concerns addressed
- Check structural changes for system impact

### Phase F5: Post Follow-up Review

```
mcp__github__create_pull_request_review(
  owner: "INNOVATIVEGAMER",
  repo: "ds",
  pull_number: {pr_number},
  body: "{Follow-up review}",
  event: "{APPROVE|COMMENT|REQUEST_CHANGES}",
  comments: [{inline comments on new issues only}]
)
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
