---
name: design-plan
description: Create implementation plans for complex tasks with architectural guidance. Use for complex features, multi-file changes, or when planning is needed before implementation.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - WebSearch
  - WebFetch
user-invocable: false
---

# Design Plan

## Purpose

Create comprehensive implementation plans for complex tasks, providing architectural guidance that can be followed for implementation.

## When to Use

- Complex features with architectural decisions
- Tasks spanning multiple files/modules
- New patterns or abstractions needed
- When the implement command coordinator spawns you for planning

## Base Rules

Always load and follow:

| Rule                                                                             | Purpose                                                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [code-quality.md](../../rules/code-quality.md)                                   | Governing principle: favor simplicity over cleverness; index to per-rule files      |
| [ripple-effect.md](../../rules/ripple-effect.md)                                 | Plan must account for callers, callees, and adjacent code consistency               |
| [parse-dont-narrow.md](../../rules/parse-dont-narrow.md)                         | Identify boundary points for zod parsing in the plan                                |
| [dont-duplicate-validation.md](../../rules/dont-duplicate-validation.md)         | Plan single-layer validation; don't duplicate across layers                         |
| [composition-over-render-props.md](../../rules/composition-over-render-props.md) | Component shape decisions: `children` or per-mode split, never render callbacks     |
| [useeffect-escape-hatch.md](../../rules/useeffect-escape-hatch.md)               | Design data flow so effects sync with external systems, not React state             |
| [project-stage.md](../../rules/project-stage.md)                                 | Pre-production: no backcompat, no migration files; edit the three baseline files    |
| [docs-mcp.md](../../rules/docs-mcp.md)                                           | MANDATORY: query examlly-docs-mcp for any third-party API; do not guess from memory |
| [github.md](../../rules/github.md)                                               | PR title/body templates, branch naming, commit format, `Closes #N`                  |
| [design.md](../../rules/design.md)                                               | Mobile-first, three required states (loading/empty/error), accessibility floors     |

## Planning Process

### Phase 1: Understand Requirements

1. **Fetch the GitHub issue if one is referenced:**

   ```bash
   gh issue view {number} --json number,title,body,labels,state,url
   ```

2. **Extract key information:**
   - What problem is being solved?
   - What are the acceptance criteria?
   - Any constraints or requirements?
   - Linked designs or references?

### Phase 2: Research Technology Context

**IMPORTANT:** Before designing, understand the current state of technologies involved.

1. **Identify technologies in scope:**
   - What libraries/frameworks will be used?
   - What version is the project using? (check `package.json`)

2. **Use WebSearch to research:**
   - Latest best practices for the technology
   - Version-specific features or limitations
   - Known issues, deprecations, or breaking changes
   - Recommended patterns from official docs

3. **Key questions to answer:**

   | Question                        | Why It Matters               |
   | ------------------------------- | ---------------------------- |
   | What version are we using?      | APIs differ between versions |
   | What's the recommended pattern? | Avoid deprecated approaches  |
   | Any known issues?               | Prevent predictable problems |
   | What's new in this version?     | Leverage latest features     |

4. **Document findings** that affect the design decision

### Phase 3: Explore Existing Architecture

1. **Find related code:**
   - How do similar features work?
   - What patterns are established?
   - What can be reused?

2. **Identify integration points:**
   - What existing modules will this touch?
   - What APIs/interfaces exist?
   - What dependencies are involved?

3. **Note constraints:**
   - Performance requirements
   - Backwards compatibility
   - Security considerations

### Phase 4: Design the Solution

1. **Consider multiple approaches:**
   - What are the options?
   - What are the trade-offs?

2. **Choose the best approach based on:**
   - Alignment with existing patterns
   - Maintainability
   - Scalability
   - Simplicity (avoid over-engineering)

3. **Define the architecture:**
   - File structure
   - Data flow
   - Component/module boundaries
   - Interfaces between parts

### Phase 5: Create Implementation Plan

1. **Break down into phases:**
   - Each phase should be independently testable
   - Order by dependencies (foundation first)
   - Include testing in each phase

2. **For each phase, specify:**
   - What files to create/modify
   - What the code should do
   - What patterns to follow
   - What to test

3. **Identify risks and decisions:**
   - What needs user input?
   - What could go wrong?
   - What assumptions are being made?

### Phase 6: Return the Plan

Output the plan in the format below and return it. The coordinator will present it to the user and handle approval.

## Output Format

```markdown
## 🏛️ Implementation Plan

### Task

- **GitHub Issue:** #{issue_number} - {title}
- **Complexity:** {Low|Medium|High}
- **Estimated Phases:** {count}

### Overview

{1-2 sentence summary of what will be built and how}

### Architecture Decision

**Approach:** {chosen approach}

**Why this approach:**

- {reason 1}
- {reason 2}

**Alternatives considered:**
| Alternative | Why Not |
|-------------|---------|
| {option} | {reason} |

### File Structure
```

{path}/
├── {file1} — {purpose}
├── {file2} — {purpose}
└── {file3} — {purpose}

```

### Implementation Phases

#### Phase 1: {name}

**Goal:** {what this phase accomplishes}

**Files:**
- Create `{path/file}` — {description}
- Modify `{path/file}` — {description}

**Key Implementation Notes:**
- {note 1}
- {note 2}

**Verification:**
- {how to verify this phase works}

---

#### Phase 2: {name}

{same structure}

---

### Risks & Decisions

| Item | Type | Notes |
|------|------|-------|
| {item} | Risk/Decision | {details} |

### Questions for User

{Any clarifications needed before proceeding}

---

**Ready for implementation?** Approve to proceed.
```

## Principles to Follow

1. **Design for the codebase** — Follow existing patterns, don't invent new ones
2. **Simple over clever** — The best architecture is the simplest one that works
3. **Think in phases** — Break work into testable increments
4. **Surface decisions** — Don't hide assumptions, make them explicit
5. **Plan for handoff** — Implementation should be possible without guessing

## What NOT to Do

- Don't over-engineer for hypothetical requirements
- Don't introduce new patterns when existing ones work
- Don't skip the trade-off analysis
- Don't assume — ask user when unclear
- Don't write code — only plan (implementation is separate)
