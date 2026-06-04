---
name: implement-guide
description: Plan and implement features directly without agent delegation. Combines architectural planning and implementation into a single-agent flow.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Edit
  - Write
  - WebSearch
  - WebFetch
user-invocable: false
---

# Implement Guide

## Purpose

Plan and implement features in a single-agent flow. You handle both the architectural planning (normally done by Principal Architect) and the implementation (normally done by SDE2) directly.

## Rules

The full ruleset lives in `.Codex/rules/*.md` — those files are the spec. Don't try to keep all of them in working memory.

The **Reflex Check** in Part 2 → Step 3 names the actions that should evoke a rule mid-write and points at the relevant file. Read the Reflex Check at the start of every phase; open a full rule file only when a reflex actually fires while you're writing.

Operational rules (`github.md`, `project-stage.md`) are referenced inline by the step they govern.

## Part 1: Planning

### Step 1: Understand Requirements

1. **If a GitHub issue is referenced:**

   ```bash
   gh issue view {number} --json number,title,body,labels,state,url
   ```

2. **Extract key information:**
   - What problem is being solved?
   - What are the acceptance criteria?
   - Any constraints or requirements?
   - Linked designs or references?

### Step 2: Research Technology Context

Before designing, understand the technologies involved.

1. **Identify technologies in scope** — check `package.json` for versions
2. **Research using WebSearch:**
   - Latest best practices
   - Version-specific features or limitations
   - Known issues, deprecations, or breaking changes
   - Recommended patterns from official docs

3. **Key questions:**

   | Question                        | Why It Matters               |
   | ------------------------------- | ---------------------------- |
   | What version are we using?      | APIs differ between versions |
   | What's the recommended pattern? | Avoid deprecated approaches  |
   | Any known issues?               | Prevent predictable problems |
   | What's new in this version?     | Leverage latest features     |

### Step 3: Explore Existing Architecture

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

### Step 4: Design the Solution

1. **Consider multiple approaches** with trade-offs
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

### Step 5: Create Implementation Plan

Break down into ordered, independently testable phases.

**For each phase, specify:**

- What files to create/modify
- What the code should do
- What patterns to follow
- What to test

### Planning Output Format

```markdown
## Implementation Plan

### Task

- **Source:** {GitHub issue #N | spec file | conversation}
- **Complexity:** {Low|Medium|High}
- **Phases:** {count}

### Overview

{1-2 sentence summary}

### Architecture Decision

**Approach:** {chosen approach}

**Why:**

- {reason 1}
- {reason 2}

**Alternatives considered:**
| Alternative | Why Not |
|-------------|---------|
| {option} | {reason} |

### File Structure

{path}/
+-- {file1} -- {purpose}
+-- {file2} -- {purpose}

### Phases

#### Phase 1: {name}

**Goal:** {what this phase accomplishes}
**Files:**

- Create `{path/file}` -- {description}
- Modify `{path/file}` -- {description}
  **Key Notes:**
- {note}
  **Verification:**
- {how to verify}

#### Phase 2: {name}

{same structure}

### Risks & Decisions

| Item   | Type          | Notes     |
| ------ | ------------- | --------- |
| {item} | Risk/Decision | {details} |
```

**After presenting the plan: WAIT for user approval before implementing.**

---

## Part 2: Implementation

After user approves the plan, implement one phase at a time.

### Per-Phase Process

#### Step 1: Explore Existing Code

Before writing anything:

1. Find similar implementations -- how do existing features work?
2. Identify reusable utilities, hooks, and types -- if a near-equivalent helper, formatter, dialog, or component already exists, extend it instead of writing a second copy
3. Note file structure and naming conventions
4. Understand patterns established by already-completed phases

#### Step 2: Research Dependencies

Before writing any code, research every third-party dependency you will use:

```
"{library} best practices {current year}"
"{library} {version} documentation"
"{library} common mistakes"
```

This is mandatory -- do not guess how a library works.

#### Step 3: Implement

**Reflex Check — read at the start of the phase, then re-fire whenever a trigger lights up while you write. Triggers are written as the action you're about to take; the action line is what to do instead.**

_Reshaping existing code_

- _Modifying, renaming, replacing, or removing existing code?_
  -> Ripple sweep: grep for the old name / pattern. Walk all four corners — **callers** (do they get simpler now?), **callees** (do they need less now?), **adjacent code** (any similar block nearby that now reads inconsistent?), **dead weight** (variables, imports, destructured fields, helper functions, orphan files that only existed to support the old shape — delete them). The change isn't done until the area reads natural end-to-end. (`ripple-effect.md`)

- _Adding a new helper, formatter, hook, dialog, route handler, or component from scratch?_
  -> Grep first. If something near-equivalent exists, extend it. A second copy that "differs only in `h` vs `hr`", "differs only by one default arg", or is "near-byte-identical" is the drift smell that keeps getting flagged in review. (`code-quality.md`)

_Control flow_

- _Wrapping real work inside an `if (ok) { ... }` chain, writing `else` after a `return`, or assembling a multi-field result with branching ternaries?_
  -> Flip preconditions to `if (!ok) return` so the happy path stays at column 0. Drop `else` after any terminating statement. For branchy result-builders, split into per-branch helpers that each return a nullable, and pick the live branch with a fallback at the call site. (`guard-clauses.md`)

_React and JSX_

- _About to type `useEffect`?_
  -> Only for syncing with an external system (browser API, subscription, third-party widget, manual DOM measurement). Anything that orchestrates React state — derive during render, move into the event handler that caused it, use a `key` prop to reset, or use `useSyncExternalStore`. Never suppress `exhaustive-deps`. (`useeffect-escape-hatch.md`)

- _Defining a component prop interface?_
  -> Reject render-callback props (`(...) => ReactNode`), component-as-prop props (`ComponentType<...>`), and `mode`/`variant` discriminators that gate two different render branches — use `children` (or named `ReactNode` slots), or split into per-mode components. (`composition-over-render-props.md`)

- _Writing an inline arrow in a JSX prop (`onClick={() => { ... }}`, `onSubmit={...}`, `onChange={...}`)?_
  -> If the body is 3+ lines, branches, or nests a callback, extract a named function (`handleX`) above `return` and pass it by reference. One- and two-line handlers stay inline. Don't wrap a bare reference in an arrow — `onClick={() => doThing()}` is just `onClick={doThing}`. (`extract-inline-handlers.md`)

_Components and styling_

- _Authoring or restyling a component, or writing any `nx:` utility?_
  -> `nx:` prefix on every utility, **before** every modifier (`nx:hover:`, `nx:[&>svg]:`, `nx:lg:` — never `hover:nx:`). Semantic tokens only, full paths (`nx:bg-primary-background` — never `nx:bg-primary`, never a primitive like `nx:bg-blue-500`); no `dark:` on a semantic token (it already adapts — the modifier is a no-op). Padding for sizing, not fixed heights. `@container` for component-internal responsive; viewport prefixes (`nx:lg:`) are page-shell only (Dialog is the one viewport-driven exception). Focus = a real outline `nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)` — never `nx:ring-*` or a shadow. `data-slot` always; `data-variant` / `data-size` when the prop exists. CVA for enum variants; boolean props as ternaries in the body, not CVA. `asChild` via Radix `Slot` for interactive components. (`components.md`, `tokens.md`, `responsive.md`)

- _Reaching for a CSS variable at runtime (inline style, SVG, canvas), or porting a shadcn/ui component?_
  -> Runtime vars are the **prefixed** form — `var(--nx-color-foo)`, `var(--nx-spacing-4)` — never the build-time `@theme` names (`var(--color-foo)`, `var(--spacing-4)`), which don't exist at runtime. For a shadcn port, map every token through `shadcn-divergences.md` (e.g. `bg-destructive` → `nx:bg-error-background`, but keep the `destructive` **prop** name) — or just run the `/shadcn-adapt` skill. (`tokens.md`, `shadcn-divergences.md`)

_Tests_

- _Adding or changing a component, hook, or utility?_
  -> **Components: stories are the tests** — no `*.test.tsx`; write play functions in `*.stories.tsx`, importing from `storybook/test` (never `@storybook/test` or `@testing-library/react`). Cover the required-story matrix (Default, each variant + size, Disabled, Click + Keyboard interaction, WithDataAttributes, `asChild` if applicable, edge cases, and the `AllVariants` showcase). For a **new** component the DoD gate is `pnpm --filter @nexus/react audit:storybook-coverage --component <name>` exiting 0. a11y is automatic via addon-a11y — don't add manual `axe()` calls; colour contrast is APCA-gated, not axe-gated (`pnpm --filter @nexus/core audit:contrast`). **Hooks / utilities** use `*.test.ts` with `@nexus/test-utils`. Assert input → output with partial matching on real fixtures; never commit `skip` / `only`. (`testing-react.md`, `testing.md`)

_Diagnostic noise_

- _Adding a log call?_
  -> One dense canonical end-of-operation line beats ten incremental "I am about to do X" lines. Drop it unless it catches an anomaly worth investigating, signals something Sentry / OTEL / framework events won't, or carries data the canonical summary can't. (`logging-proportionality.md`)

- _Writing a comment, or typing "for now" / "follow-up" / "later" / "TODO" anywhere — in code, in commit bodies, in PR descriptions?_
  -> Default: no comment. Comment only non-obvious **logic** — not rationale, not tradeoffs, not "why we chose X" (that goes in the PR body). TODO is allowed only as `// TODO(#295):` pointing at a tracked issue. Deferral framing ("not blocking, monitor post-launch", "flag for later rollout") without a cited issue number is rejected — fix it in this PR. (`code-comments.md`, `no-follow-up-deferral.md`)

_Pre-production hygiene_

- _About to create a feature flag, backcompat shim, deprecation comment, `_unused` rename, or `// removed in X` marker?_
  -> Don't. Delete instead of deprecate; rename in place instead of shim; remove unused exports entirely. There is no live deployment to protect. (`project-stage.md`)

When a reflex fires and you're not certain of the spec, open the linked rule file. The reflex list above is the trigger; the rule file is the answer.

**Then write the code:**

1. Follow existing patterns in the codebase exactly
2. Use proper TypeScript types -- no `any`
3. Handle errors appropriately
4. Keep code readable and explicit
5. Implement **only this phase** -- do not begin the next one

#### Step 4: Verify

Run after completing:

```bash
pnpm typecheck
pnpm lint
```

Fix all errors before presenting your summary.

#### Step 5: Commit (MANDATORY)

**You MUST commit after every phase before moving on. Do NOT batch commits or defer to the end.**

```bash
git add -A && git commit -m "phase {n}: {phase name}"
```

### Per-Phase Output Format

```markdown
### Phase {n} Complete: {phase name}

#### Changes Made

| File               | Change        |
| ------------------ | ------------- |
| `path/to/file.tsx` | {description} |

#### Key Code

{Most important snippet with file:line reference}

#### Verification

- TypeScript: {No errors | N errors fixed}
- Lint: {No warnings | N warnings fixed}
- Commit: {commit hash}
```

**After each phase: commit, then proceed immediately to the next phase. Do NOT wait for user confirmation between phases.**

---

## Principles

1. **Read before write** -- understand existing patterns first
2. **Research before coding** -- look up libraries, never guess
3. **Follow loaded rules** -- `.Codex/rules/` files are source of truth
4. **One phase at a time** -- do not implement beyond the current phase
5. **Plan is not code** -- planning and implementation are distinct steps
6. **Ask when blocked** -- surface ambiguity rather than assuming
