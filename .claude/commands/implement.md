# Implement

Implement a Linear ticket using the SDE2 agent, with optional architectural guidance from Principal Architect.

## Agents Used

| Agent                                                         | Skill                                                              | When Used                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| [Principal Architect](../agents/principal-architect/AGENT.md) | [design-plan](../agents/principal-architect/skills/design-plan.md) | Only with `--with-architect` flag |
| [SDE2](../agents/sde2/AGENT.md)                               | [implement](../agents/sde2/skills/implement.md)                    | Always                            |

## Required Input

- **Linear Issue ID**: $ARGUMENTS (e.g., `NEX-150` or `NEX-150 --with-architect`)

If no issue ID provided, ask the user for it.

## Flag Detection

Parse `$ARGUMENTS` for:

- Issue ID: `NEX-###` pattern
- Architect flag: `--with-architect` or `-a`

```
Examples:
  /implement NEX-150                    → SDE2 only
  /implement NEX-150 --with-architect   → Architect + SDE2
  /implement NEX-150 -a                 → Architect + SDE2
```

## Flow: Default (SDE2 Only)

```
┌─────────────────────────────────────────┐
│           /implement NEX-150            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│              Load SDE2 Agent            │
│  • Read AGENT.md (persona, base rules)  │
│  • Read implement.md skill              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Execute implement skill         │
│  • Understand task                      │
│  • Explore existing code                │
│  • Create plan (TodoWrite)              │
│  • Implement phase by phase             │
│  • Verify & test                        │
└─────────────────────────────────────────┘
```

## Flow: With Architect

```
┌─────────────────────────────────────────┐
│    /implement NEX-150 --with-architect  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       Load Principal Architect Agent    │
│  • Read AGENT.md (persona, base rules)  │
│  • Read design-plan.md skill            │
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
│  • Read implement.md skill              │
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

### Phase 1: Load Agent Context

1. **Fetch Linear ticket:**

   ```
   mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
   ```

2. **If `--with-architect` flag present:**
   - Read `.claude/agents/principal-architect/AGENT.md`
   - Read `.claude/agents/principal-architect/skills/design-plan.md`
   - Execute design-plan skill
   - Present plan to user
   - WAIT for approval
   - Then proceed to step 3

3. **Load SDE2 agent:**
   - Read `.claude/agents/sde2/AGENT.md`
   - Read `.claude/agents/sde2/skills/implement.md`

### Phase 2: Execute Implementation

Execute the SDE2 `implement` skill:

- The skill handles all phases (understand → explore → plan → implement → verify)
- Follow the workflow in the skill file
- If architect plan was created, SDE2 follows that plan

### Phase 3: Report Completion

After implementation is complete, output:

```markdown
## ✅ Implementation Complete

### Linear Ticket

- **ID:** {issue_id}
- **Title:** {title}

### Execution Mode

{SDE2 Only | With Architect Guidance}

### Changes Made

| File           | Change        |
| -------------- | ------------- |
| `path/to/file` | {description} |

### Verification

- [ ] TypeScript: ✅
- [ ] Lint: ✅
- [ ] Tests: ✅

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

| Error                     | Action                              |
| ------------------------- | ----------------------------------- |
| Linear issue not found    | Ask user to verify issue ID         |
| No requirements in ticket | Ask user for clarification          |
| Architect plan rejected   | Revise plan or ask for guidance     |
| Implementation blocked    | Ask user for decision (no patches!) |
