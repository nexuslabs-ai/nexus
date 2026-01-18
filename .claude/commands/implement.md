# Implement

Implement features and tasks using the SDE2 agent, with optional architectural guidance from Principal Architect. Works with any context source.

## Agents Used

| Agent                                                   | Skill                                         | When Used                         |
| ------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| [Principal Architect](../agents/principal-architect.md) | [design-plan](../skills/design-plan/SKILL.md) | Only with `--with-architect` flag |
| [SDE2](../agents/sde2.md)                               | [implement](../skills/implement/SKILL.md)     | Always                            |

## Input (Optional)

- **$ARGUMENTS**: Linear ID, file path, or flags

```
Examples:
  /implement                           → Use conversation context
  /implement NEX-150                   → Fetch from Linear
  /implement ./specs/feature.md        → Read markdown spec
  /implement --with-architect          → Architect plans first (conversation context)
  /implement NEX-150 --with-architect  → Linear + Architect
  /implement NEX-150 -a                → Short flag for architect
```

## Context Detection

Parse `$ARGUMENTS` for:

| Pattern                    | Context Source            |
| -------------------------- | ------------------------- |
| `NEX-###`                  | Linear ticket             |
| `*.md` path                | Markdown spec file        |
| `--with-architect` or `-a` | Enable architect planning |
| (none)                     | Use conversation context  |

## Flow: Default (SDE2 Only)

```
┌─────────────────────────────────────────┐
│              /implement                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Detect Context                │
│  • Linear ID? → Fetch ticket            │
│  • .md file? → Read spec                │
│  • Otherwise → Use conversation         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Spawn SDE2 Agent               │
│  • Use Task tool with subagent_type     │
│  • Pass context in prompt               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      SDE2 Executes implement skill      │
│  • Gather requirements                  │
│  • Explore existing code                │
│  • Create plan (TodoWrite)              │
│  • Implement phase by phase             │
│  • Verify & test                        │
└─────────────────────────────────────────┘
```

## Flow: With Architect

```
┌─────────────────────────────────────────┐
│      /implement --with-architect        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Detect Context                │
│  • Same detection as above              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Spawn Principal Architect Agent      │
│  • Use Task tool with subagent_type     │
│  • Pass context in prompt               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Architect Executes design-plan skill │
│  • Understand requirements              │
│  • Research technology context          │
│  • Explore existing architecture        │
│  • Design solution                      │
│  • Create implementation plan           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         WAIT for user approval          │
│  "Does this plan look good?"            │
└─────────────────┬───────────────────────┘
                  │ User approves
                  ▼
┌─────────────────────────────────────────┐
│          Spawn SDE2 Agent               │
│  • Use Task tool with subagent_type     │
│  • Pass approved plan in prompt         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    SDE2 Executes implement with plan    │
│  • Follow architect's phases            │
│  • Implement according to plan          │
│  • Verify & test                        │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Detect Context

1. **Parse arguments for context:**

   ```
   If NEX-### found → mcp__linear__get_issue(id: "{issue_id}")
   If .md path found → Read file content
   Otherwise → Use conversation history as context
   ```

2. **Collect context to pass to agents:**
   - Task requirements (from Linear/spec/conversation)
   - Relevant rules based on expected file changes
   - Any constraints or preferences mentioned

### Phase 2: Spawn Agents

**If `--with-architect` flag present:**

**IMPORTANT: You MUST use the Task tool to spawn agents. Do NOT execute the skills yourself.**

First, spawn the Principal Architect:

```
Task(
  subagent_type: "principal-architect",
  description: "Design plan for implementation",
  prompt: """
  Create an implementation plan for this task.

  ## Task Context
  - Source: {Linear NEX-### | spec file | conversation}
  - Requirements: {task requirements}

  ## Instructions
  1. Read the design-plan skill at `.claude/skills/design-plan/SKILL.md`
  2. Understand requirements thoroughly
  3. Research technology context
  4. Explore existing architecture
  5. Design solution with phases
  6. Return the implementation plan
  """
)
```

After architect returns plan:

- Present plan to user
- WAIT for user approval
- Then proceed to spawn SDE2

**Spawn SDE2 Agent:**

```
Task(
  subagent_type: "sde2",
  description: "Implement task",
  prompt: """
  Implement this task.

  ## Task Context
  - Source: {Linear NEX-### | spec file | conversation}
  - Requirements: {task requirements}
  {If architect plan exists:}
  - Architect Plan: {the approved plan}

  ## Instructions
  1. Read the implement skill at `.claude/skills/implement/SKILL.md`
  2. Follow the workflow (gather → explore → plan → implement → verify)
  3. If architect plan exists, follow its phases
  4. Implement phase by phase with summaries
  5. Verify with typecheck and lint
  """
)
```

The SDE2 agent will:

- Follow the implement skill workflow
- Create TodoWrite for tracking
- Implement phase by phase
- Verify with tests

### Phase 3: Report Completion

After implementation is complete, output:

```markdown
## Implementation Complete

### Task Reference

{Include whichever applies:}

- **Linear:** NEX-### - {title}
- **Spec:** {filename.md}
- **Request:** {brief summary}

### Execution Mode

{SDE2 Only | With Architect Guidance}

### Changes Made

| File           | Change        |
| -------------- | ------------- |
| `path/to/file` | {description} |

### Verification

- [ ] TypeScript: No errors
- [ ] Lint: No warnings
- [ ] Tests: All passing

### Next Steps

{User can now review changes, create PR, etc.}
```

## When to Use `--with-architect`

| Task Complexity                | Recommendation     |
| ------------------------------ | ------------------ |
| Simple bug fix                 | SDE2 only          |
| Single file change             | SDE2 only          |
| New component (well-defined)   | SDE2 only          |
| Multi-file feature             | Consider architect |
| Architectural decisions needed | Use architect      |
| New patterns/abstractions      | Use architect      |
| Unclear requirements           | Use architect      |

## Error Handling

| Error                   | Action                              |
| ----------------------- | ----------------------------------- |
| Linear issue not found  | Ask user to verify issue ID         |
| Spec file not found     | Ask user to verify file path        |
| Unclear requirements    | Ask user for clarification          |
| Architect plan rejected | Revise plan or ask for guidance     |
| Implementation blocked  | Ask user for decision (no patches!) |
