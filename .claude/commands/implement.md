# Implement

Implements features in the main session. You draft the plan and do all implementation yourself; the only delegation is a parallel review council that stress-tests the draft plan against the codebase before you finalize it.

## Skill Used

| Skill                                                 | Purpose                         |
| ----------------------------------------------------- | ------------------------------- |
| [implement-guide](../skills/implement-guide/SKILL.md) | Planning + implementation guide |

## Input

- **$ARGUMENTS**: GitHub issue number, file path, or description

```
Examples:
  /implement                     -> Conversation context
  /implement #42                 -> GitHub issue
  /implement ./specs/feature.md  -> Markdown spec
```

## Flow

```
Detect Context
     |
     v
Branch Setup
     |
     v
Read skill -> Draft plan (yourself)
     |
     v
Plan Review Council (spawn lens agents in parallel)
     |
     v
Synthesize revised plan (yourself) -- each gap -> plan edit or rejected-with-reason
     |
     v
Show revised plan + Council Delta -> WAIT for approval -> create TodoWrite
     |
     v
+--- For each phase ----------------------------------------+
|                                                            |
|   Mark in_progress                                         |
|   Implement phase (yourself, following skill)              |
|   ** COMMIT changes (MANDATORY before moving on) **        |
|   Mark completed -> next phase                             |
+------------------------------------------------------------+
     |
     v
Report summary
```

---

## Execution

### Phase 1: Detect Context

Parse `$ARGUMENTS`:

```
If #123 found   -> gh issue view 123 --json number,title,body,labels,state,url
If .md path     -> Read file content
Otherwise       -> Use conversation context
```

Collect:

- Full requirements text
- Acceptance criteria (explicit or inferred)
- Any design references or constraints

### Phase 2: Branch Setup

1. Check current branch:

   ```bash
   git branch --show-current
   ```

2. Derive branch name:

   | Context      | Branch name pattern                           |
   | ------------ | --------------------------------------------- |
   | GitHub issue | `{username}/issue-{number}-{slugified-title}` |
   | Spec file    | `{username}/{slugified-filename}`             |
   | Conversation | Ask user                                      |

3. Check if branch exists:

   ```bash
   git branch --list "{branch_name}"
   git ls-remote --heads origin "{branch_name}"
   ```

   - Exists locally -> ask user: checkout existing or create new?
   - Exists on remote only -> fetch and checkout

4. Ask user for base branch (default: `main`)

5. Create and checkout:

   ```bash
   git checkout -b {branch_name} {base_branch}
   ```

6. Confirm to user:

   ```
   On branch: {branch_name} (based on {base_branch})
   ```

### Phase 3: Draft the Plan

**Draft it yourself in the main session.** This is the draft the council reviews — not the final plan.

1. Read the implement skill at `.claude/skills/implement-guide/SKILL.md`
2. Follow Part 1, Steps 1–5 of the skill:
   - Understand requirements
   - Research technology context
   - Explore existing architecture
   - Design the solution
   - Create the draft implementation plan in the skill's Planning Output Format

### Phase 4: Plan Review Council (delegate, parallel)

Stress-test the draft plan against the codebase before the user ever sees it. Spawn the four lens agents from the skill's Part 1, Step 6 — **all in a single message so they run concurrently.** The lens → agent mapping and the findings contract live in Step 6; do not restate them here.

```
Agent(
  subagent_type: "{Explore | principal-architect | sde2 | tester}",
  description: "{lens} plan review",
  prompt: """
  Review this DRAFT implementation plan through the {lens} lens defined in
  Step 6 of .claude/skills/implement-guide/SKILL.md.

  Task source:
  {issue body / spec / request}

  Draft plan:
  {full plan from Phase 3}

  Verify every claim the plan makes against the actual source — do not trust the
  plan's description of existing code. Return ONLY the findings list in the Step 6
  contract (severity, claim, evidence with file:line, change). No preamble, no
  restating the plan. If you find nothing, return `No gaps found.`
  """
)
```

### Phase 5: Synthesize the Revised Plan (yourself)

Follow the skill's Part 1, Step 7. Rule on every council finding — accept (edit the plan) or reject (one-line reason) — dedup overlaps, reject silent scope creep, never defer a `blocker`. Produce the revised plan plus the Council Delta table.

### Phase 6: Plan Approval

1. Create TodoWrite from the revised phase list
2. Present to user:

   ```markdown
   ## Implementation Plan

   {revised plan content from Phase 5}

   ### Council Delta

   {delta table from Phase 5}

   Does this plan look good? Let me know if you'd like any changes before we start.
   ```

3. **WAIT for user approval**

4. If user requests changes -> adjust the plan, update TodoWrite, present again

### Phase 7: Implementation Loop

For each phase in the approved plan:

#### Step A -- Mark in_progress

Update the todo item to `in_progress`.

#### Step B -- Implement

**Do this yourself. Do NOT spawn any agents.**

Follow Part 2 (Implementation) of the skill:

1. Explore existing code relevant to this phase
2. Research any third-party dependencies
3. Implement only this phase
4. Verify with typecheck and lint

#### Step B.1 -- Commit (MANDATORY)

**You MUST commit after every phase, before moving to the next phase.**

```bash
git add -A && git commit -m "phase {n}: {phase name}"
```

Do NOT batch commits. Do NOT defer commits to the end. Each phase gets its own commit immediately after implementation.

#### Step C -- Mark completed

Mark todo item as `completed` and proceed immediately to the next phase. Do NOT wait for user confirmation between phases.

### Phase 8: Report

After all phases are done:

```markdown
## Implementation Complete

### Task Reference

{GitHub Issue #123 -- title | Spec: filename.md | Request: summary}

### Completed Phases

| #   | Phase        | Status |
| --- | ------------ | ------ |
| 1   | {phase name} | Done   |
| 2   | {phase name} | Done   |

### Files Modified

| File               | Change        |
| ------------------ | ------------- |
| `path/to/file.tsx` | {description} |

### Verification

- TypeScript: No errors
- Lint: No warnings

### Next Steps

- Review changes: `git diff main`
- Create PR: `gh pr create` or `/pr-review`
```

---

## When to Ask User

| Situation                          | Action                                               |
| ---------------------------------- | ---------------------------------------------------- |
| After council + synthesis          | Show revised plan + Council Delta, WAIT for approval |
| Branch already exists              | Ask: checkout existing or create new?                |
| Branch name unknown (conversation) | Ask user for branch name                             |
| Blocked on ambiguous requirements  | Ask for clarification before continuing              |
