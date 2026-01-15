# PR Review - Context Engine

Comprehensive code review for Context Engine pull requests with dual-perspective analysis.

## Agents Used

| Agent                                                                 | Skill                                                                  | Purpose                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| [Principal Architect](../.claude/agents/principal-architect/AGENT.md) | [pr-review](../.claude/agents/principal-architect/skills/pr-review.md) | Architecture & system design |
| [SDE2](../.claude/agents/sde2/AGENT.md)                               | [pr-review](../.claude/agents/sde2/skills/pr-review.md)                | Code quality & correctness   |

## Context Engine Overview

**What it is:** A SaaS platform that makes design system components AI-accessible through semantic search and intelligent code assistance.

**The problem it solves:** AI coding assistants (Claude, Cursor, Copilot) don't understand custom design system components — they hallucinate props, miss variants, and can't recommend the right component for a task.

**How it works:**

1. CLI extracts component code (props, variants, dependencies) from customer repos
2. Server generates semantic metadata (descriptions, usage guidance) via LLM
3. Components become searchable via natural language
4. AI assistants query via MCP to get accurate component context

**Core principle:** Code is the source of truth. Automated extraction for accuracy, AI generation for semantic richness.

**Key outputs:**

- **MCP Gateway** — AI assistants query components in real-time
- **A2UI Catalog** — Runtime generative UI for the GenUI Platform

**Architecture:** Server-owns-data SaaS model with multi-org isolation. Customers run CLI → Server stores manifests → AI assistants connect via WebSocket MCP.

**Tech:** Node.js + Hono, PostgreSQL + pgvector, Voyage AI embeddings, react-docgen-typescript for parsing.

---

## Required Input

- **PR Number**: $ARGUMENTS (e.g., `8`)

If no input provided, ask the user for PR number.

## Phase 1: Get PR Context

1. **Fetch PR details** (per `.claude/rules/github.md`):

   ```
   mcp__github__get_pull_request(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

2. **Extract:**
   - PR title and description
   - Base and head branches
   - Linked Linear issue (from title `[NEX-###]` or description)
   - PR author

3. **If Linear issue linked, fetch ticket:**
   ```
   mcp__linear__get_issue(id: "{issue_id}")
   ```

   - Understand what was requested
   - Note acceptance criteria

## Phase 2: Read Changed Files

1. **Get list of changed files:**

   ```
   mcp__github__get_pull_request_files(owner: "INNOVATIVEGAMER", repo: "ds", pull_number: {pr_number})
   ```

2. **For each changed file in `packages/context-engine/`:**
   - Read full file content using Read tool
   - Understand how changes fit into existing code
   - Note the package (`core`, `db`, `api`, etc.)

3. **Categorize files:**

   | Category      | Files                                        |
   | ------------- | -------------------------------------------- |
   | Types/Schemas | `types/*.ts`, `schemas/*.ts`                 |
   | Utilities     | `utils/*.ts`, `lib/*.ts`                     |
   | Database      | `db/**/*.ts`, `migrations/**`                |
   | API/Routes    | `api/**/*.ts`, `routes/**/*.ts`              |
   | Config        | `*.config.*`, `*.json`, `docker-compose.yml` |
   | Tests         | `*.test.ts`, `*.spec.ts`                     |

## Phase 3: Principal Architect Review

> **Load agent:** Read [`.claude/agents/principal-architect/AGENT.md`](../.claude/agents/principal-architect/AGENT.md) for persona, focus areas, and principles.
>
> **Load skill:** Read [`.claude/agents/principal-architect/skills/pr-review.md`](../.claude/agents/principal-architect/skills/pr-review.md) for review process and output format.

Execute the Principal Architect's pr-review skill against the changed files.

## Phase 4: SDE2 Review

> **Load agent:** Read [`.claude/agents/sde2/AGENT.md`](../.claude/agents/sde2/AGENT.md) for persona, focus areas, and principles.
>
> **Load skill:** Read [`.claude/agents/sde2/skills/pr-review.md`](../.claude/agents/sde2/skills/pr-review.md) for review process and output format.

Execute the SDE2's pr-review skill against the changed files.

## Phase 5: AI Consumer Check

**Perspective:** Context Engine's end users are AI coding assistants (Claude, Cursor, Copilot). Evaluate whether the implementation serves them well.

### 5.1 Review Focus Areas

| Area                     | What to Check                                            |
| ------------------------ | -------------------------------------------------------- |
| **Response Structure**   | Is data easy for an AI to parse? Not overly nested?      |
| **Context Completeness** | Does the AI have enough info to generate correct code?   |
| **Error Clarity**        | Do errors explain what went wrong AND how to fix it?     |
| **Search Relevance**     | Will natural language queries find the right components? |

### 5.2 Questions to Ask

For each API response or data structure:

- "If an AI assistant received this response, could it generate correct component code?"
- "Does this error message help the AI recover or retry appropriately?"
- "Would natural language queries like 'button with loading state' find the right components?"
- "Is the component metadata rich enough for the AI to suggest correct props/variants?"

### 5.3 Output Format

```markdown
**🤖 AI Consumer Assessment**

| Aspect                | Rating   | Notes   |
| --------------------- | -------- | ------- |
| Response Parseability | ✅/⚠️/❌ | {notes} |
| Context Completeness  | ✅/⚠️/❌ | {notes} |
| Error Guidance        | ✅/⚠️/❌ | {notes} |
| Search Quality        | ✅/⚠️/❌ | {notes} |

**Recommendation:** {Any improvements for AI consumption}
```

## Phase 6: Post Reviews

1. **Post Principal Architect review as first comment:**

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "{Principal Architect review body from skill output format}",
     event: "COMMENT",
     comments: [{inline comments for architectural issues}]
   )
   ```

2. **Post SDE2 review as second comment:**

   ```
   mcp__github__create_pull_request_review(
     owner: "INNOVATIVEGAMER",
     repo: "ds",
     pull_number: {pr_number},
     body: "{SDE2 review body from skill output format}",
     event: "{APPROVE|COMMENT|REQUEST_CHANGES}",
     comments: [{inline comments for code quality issues}]
   )
   ```

   **Verdict logic:**
   | Condition | Event |
   |-----------|-------|
   | No blocking issues in either review | `APPROVE` |
   | Only minor issues (⚠️) | `COMMENT` |
   | Any blocking issues (❌) | `REQUEST_CHANGES` |

3. **If Linear ticket linked, add comment:**
   ```
   mcp__linear__create_comment(
     issueId: "{issue_id}",
     body: "📋 **PR Review Complete**\n\n🏛️ Architect: {verdict}\n👨‍💻 SDE2: {verdict}\n\nSee PR for details: {pr_url}"
   )
   ```

## Phase 7: Report to User

```markdown
## 📋 PR Review Complete

### PR: #{pr_number} - {title}

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

**Issues:** {blocking_count} blocking, {minor_count} minor

### AI Consumer Check

**Assessment:** {summary}

### Top Items to Address

1. {Most critical from either review}
2. {Second priority}
3. {Third priority}

### Links

- **PR:** {pr_url}
- **Linear:** {linear_url}
```
