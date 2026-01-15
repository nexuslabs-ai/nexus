---
name: implement
description: Implement features and tasks with production-quality code. Use when implementing features, building components, or any task requiring code implementation from any context source (Linear tickets, markdown specs, or conversation).
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
user-invocable: true
---

# Implement

## Purpose

Implement features and tasks with production-quality code, following codebase conventions and best practices. Works with any context source.

## When to Use

- Implementing new features (from any source)
- Building new components, hooks, or utilities
- Adding functionality to existing code
- Any task that requires writing code

## Context Sources

This skill works with multiple input types:

| Source            | Detection                  | How to Extract                             |
| ----------------- | -------------------------- | ------------------------------------------ |
| **Linear ticket** | `NEX-###` pattern in input | `mcp__linear__get_issue(id: "{issue_id}")` |
| **Markdown file** | `.md` file path referenced | Read the file content                      |
| **Figma design**  | Figma URL in context       | `mcp__figma__get_design_context`           |
| **Conversation**  | Requirements in chat       | Parse from conversation history            |

## Task-Specific Rules

Based on what you're implementing, load these rules **before writing any code**:

| Task Type      | Detect By                              | Rules to Load                                                                                                                                                |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component      | `packages/react/src/components/`       | [components.md](../../rules/components.md), [testing.md](../../rules/testing.md), [storybook.md](../../rules/storybook.md), [figma.md](../../rules/figma.md) |
| Hook           | `packages/react/src/hooks/`            | [testing.md](../../rules/testing.md)                                                                                                                         |
| Utility        | `packages/react/src/lib/`              | [testing.md](../../rules/testing.md)                                                                                                                         |
| Token          | `packages/core/`, `packages/tailwind/` | [tokens.md](../../rules/tokens.md)                                                                                                                           |
| Context Engine | `packages/context-engine/`             | [context-engine.md](../../rules/context-engine.md)                                                                                                           |

**Always also load:** Base rules (workflow, github, linear — if Linear context present)

## Implementation Process

### Phase 1: Gather Requirements

1. **Detect context source:**

   ```
   If NEX-### pattern → Fetch Linear ticket
   If .md file referenced → Read markdown file
   If Figma URL present → Fetch design context
   Otherwise → Use conversation context
   ```

2. **If Linear ticket:**

   ```
   mcp__linear__get_issue(id: "{issue_id}", includeRelations: true)
   ```

   - Extract requirements, acceptance criteria
   - Check for linked Figma designs

3. **If Markdown file:**
   - Read the referenced file
   - Extract requirements and acceptance criteria

4. **If Figma design:**
   - Use `mcp__figma__get_design_context` to understand the design
   - Note variants, sizes, states required

5. **If conversation context:**
   - Summarize what the user is asking for
   - Clarify any ambiguous requirements before proceeding

6. **Extract key information:**
   - What needs to be built?
   - Acceptance criteria (explicit or inferred)
   - Any design references?
   - Constraints or dependencies?

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
## Implementation Complete

### Task Reference

{Include whichever applies:}

- **Linear:** NEX-### - {title}
- **Spec:** {filename.md}
- **Request:** {brief summary of what was asked}

### Changes Made

| File                    | Change        |
| ----------------------- | ------------- |
| `path/to/file.tsx`      | {description} |
| `path/to/file.test.tsx` | {description} |

### Key Code

{Relevant code snippets with file:line references}

### Verification

- [ ] TypeScript: No errors
- [ ] Lint: No warnings
- [ ] Tests: All passing
- [ ] Requirements: Met

### Next Steps

{Any follow-up items or notes for the user}
```

## Principles to Follow

1. **Read before write** — Understand existing patterns first
2. **Follow loaded rules** — Rules files are the source of truth for conventions
3. **Test as you go** — Don't leave testing for the end
4. **Ask when unsure** — Better to clarify than assume
5. **Small iterations** — Complete one todo, summarize, wait for confirmation
6. **Context-agnostic** — Same quality regardless of input source
