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
│              Load SDE2 Agent            │
│  • Read sde2.md (persona, base rules)   │
│  • Read implement SKILL.md              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Execute implement skill         │
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
│       Load Principal Architect Agent    │
│  • Read principal-architect.md          │
│  • Read design-plan SKILL.md            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Execute design-plan skill        │
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
│              Load SDE2 Agent            │
│  • Receives architect's plan            │
│  • Read implement SKILL.md              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Execute implement skill with plan    │
│  • Follow architect's phases            │
│  • Implement according to plan          │
│  • Verify & test                        │
└─────────────────────────────────────────┘
```

## Execution

### Phase 1: Detect Context & Load Agent

1. **Parse arguments for context:**

   ```
   If NEX-### found → mcp__linear__get_issue(id: "{issue_id}")
   If .md path found → Read file content
   Otherwise → Use conversation history as context
   ```

2. **If `--with-architect` flag present:**
   - Read `.claude/agents/principal-architect.md`
   - Read `.claude/skills/design-plan/SKILL.md`
   - Execute design-plan skill
   - Present plan to user
   - WAIT for approval
   - Then proceed to step 3

3. **Load SDE2 agent:**
   - Read `.claude/agents/sde2.md`
   - Read `.claude/skills/implement/SKILL.md`

### Phase 2: Execute Implementation

Execute the SDE2 `implement` skill:

- The skill handles all phases (gather → explore → plan → implement → verify)
- Follow the workflow in the skill file
- If architect plan was created, SDE2 follows that plan

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
