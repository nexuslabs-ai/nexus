# Implement Skill

> Uses: [SDE2 Agent](../AGENT.md)

## Purpose

Implement Linear tickets and tasks with production-quality code, following codebase conventions and best practices.

## When to Use

- Implementing new features from Linear tickets
- Building new components, hooks, or utilities
- Adding functionality to existing code
- Any task that requires writing code

## Task-Specific Rules

Based on what you're implementing, load these rules **before writing any code**:

| Task Type      | Detect By                              | Rules to Load                                                                                                                                                |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component      | `packages/react/src/components/`       | [components.md](../../rules/components.md), [testing.md](../../rules/testing.md), [storybook.md](../../rules/storybook.md), [figma.md](../../rules/figma.md) |
| Hook           | `packages/react/src/hooks/`            | [testing.md](../../rules/testing.md)                                                                                                                         |
| Utility        | `packages/react/src/lib/`              | [testing.md](../../rules/testing.md)                                                                                                                         |
| Token          | `packages/core/`, `packages/tailwind/` | [tokens.md](../../rules/tokens.md)                                                                                                                           |
| Context Engine | `packages/context-engine/`             | [context-engine.md](../../rules/context-engine.md)                                                                                                           |

**Always also load:** Base rules from [AGENT.md](../AGENT.md) (workflow, github, linear)

## Implementation Process

### Phase 1: Understand the Task

1. **Read the Linear ticket thoroughly:**

   ```
   mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
   ```

2. **Extract key information:**
   - What needs to be built?
   - Acceptance criteria
   - Any linked Figma designs?
   - Related issues or blockers?

3. **If Figma link present:**
   - Use `mcp__figma__get_design_context` to understand the design
   - Note variants, sizes, states required

### Phase 2: Explore Existing Code

1. **Find similar implementations:**
   - How do existing features in this codebase work?
   - What patterns are already established?

2. **Identify dependencies:**
   - What existing utilities/hooks can be reused?
   - Are there shared types to extend?

3. **Note the file structure:**
   - Where should new files go?
   - What's the naming convention?

### Phase 3: Create Implementation Plan

1. **Use TodoWrite to create task list:**
   - Break down into small, testable chunks
   - Each todo should be completable independently
   - Include testing as explicit todos

2. **Example plan structure:**

   ```
   - [ ] Create main implementation file
   - [ ] Add core functionality
   - [ ] Add tests/stories
   - [ ] Update exports
   ```

3. **WAIT for user confirmation before proceeding**

### Phase 4: Implement

1. **Work through todos one at a time:**
   - Mark todo as `in_progress` before starting
   - Mark as `completed` immediately after finishing
   - Summarize what was done after each

2. **Follow the loaded rules strictly:**
   - Rules files contain all conventions
   - Don't deviate from established patterns
   - Include proper TypeScript types

3. **After each significant change:**
   - Provide summary with code snippets
   - Include file:line references
   - WAIT for user confirmation

### Phase 5: Verify & Test

1. **Run relevant checks:**

   ```bash
   yarn typecheck          # TypeScript
   yarn lint               # ESLint
   yarn test               # All tests
   ```

2. **Fix any issues found**

3. **Verify against acceptance criteria:**
   - Does implementation meet all requirements?
   - Any edge cases missed?

## Output Format

After implementation is complete:

```markdown
## ✅ Implementation Complete

### Linear Ticket

- **ID:** {issue_id}
- **Title:** {title}

### Changes Made

| File                    | Change        |
| ----------------------- | ------------- |
| `path/to/file.tsx`      | {description} |
| `path/to/file.test.tsx` | {description} |

### Key Code

{Relevant code snippets with file:line references}

### Verification

- [ ] TypeScript: ✅ No errors
- [ ] Lint: ✅ No warnings
- [ ] Tests: ✅ All passing
- [ ] Acceptance criteria: ✅ Met

### Next Steps

{Any follow-up items or notes for the user}
```

## Principles to Follow

1. **Read before write** — Understand existing patterns first
2. **Follow loaded rules** — Rules files are the source of truth for conventions
3. **Test as you go** — Don't leave testing for the end
4. **Ask when unsure** — Better to clarify than assume
5. **Small iterations** — Complete one todo, summarize, wait for confirmation
