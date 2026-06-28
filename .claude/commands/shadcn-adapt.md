# Shadcn Adapt

Adapt a single shadcn/ui component into a first-class Nexus component — `nx:` prefix, semantic tokens, data attributes, padding-based sizing, the focus-ring pattern, and Storybook stories with play-fns — following the shadcn-adapt guide. This is a **deterministic recipe**, not open-ended implementation.

## Skill Used

| Skill                                                       | Purpose                                                           |
| ----------------------------------------------------------- | ----------------------------------------------------------------- |
| [shadcn-adapt-guide](../skills/shadcn-adapt-guide/SKILL.md) | The adaptation recipe + token-mapping Reflex Check + verify gates |

## Input

- **$ARGUMENTS**: a component name, a shadcn source URL, or a tracked issue number.

```
Examples:
  /shadcn-adapt checkbox      -> adapt the checkbox component
  /shadcn-adapt #166          -> resolve the component from the issue, then adapt
  /shadcn-adapt <shadcn-url>  -> adapt from a specific source file
```

## Flow

```
Detect component (arg / issue / url)
     |
     v
Branch setup (issue-derived, off origin/main)
     |
     v
Read shadcn-adapt-guide -> run the recipe
  (orient -> fetch source -> transform -> stories -> wire)
     |
     v
Surface adaptation summary (deps, exports, key remaps) -> proceed
  (pause ONLY if genuinely ambiguous)
     |
     v
Verify gates -> commit (one component) -> report
```

---

## Execution

### Phase 1: Detect Component

Parse `$ARGUMENTS`:

```
component name -> use directly
#N             -> gh issue view N --json number,title,body ; extract the component
URL            -> the source file to adapt
nothing        -> ask which component
```

The Component library · Phase 1 epic (#161) lists the tracked component issues (#162–#177). If one matches, use it — its body already specifies the exports, deps, remaps, and acceptance for this component.

### Phase 2: Branch Setup

Per `.claude/rules/github.md`:

1. `git fetch origin -q`
2. Branch name: `{username}/issue-{N}-add-{component}-component` (or `{username}/adapt-{component}` if untracked).
3. Base off **`origin/main`** (local `main` may be stale): `git checkout -b {branch} origin/main`.
4. If the branch already exists locally/remotely, ask: checkout existing or create new?
5. Confirm: `On branch: {branch}`.

### Phase 3: Adapt (follow the guide)

Read `.claude/skills/shadcn-adapt-guide/SKILL.md` and execute its recipe end-to-end — orient on the archetype reference component, fetch the canonical shadcn source, transform deterministically (applying the guide's Reflex Check), author the stories, and wire deps/icons/exports/story-coverage metadata.

### Phase 4: Surface (not a gate)

Show a one-screen summary so the user can interrupt — do **not** wait for approval:

```markdown
## Adapting: {component} ({#N})

| Exports | {Component, sub-components, types} |
| New dep | {package or "none"} |
| New icons | {IconX or "none"} |
| story coverage metadata | {yes / no} |

Key remaps: {2–4 bullet token mappings specific to this component}

Proceeding.
```

Pause only if a genuine decision is needed (e.g., a required semantic token doesn't exist).

### Phase 5: Verify + Commit

Run the guide's verification gates and fix until green (no deferral). Then commit the component as one unit:

```bash
git add -A && git commit -m "feat(components): add {component} component

Closes #N"
```

### Phase 6: Report

Terse table — files created/modified, dep added, verification = clean. Next: `gh pr create` or `/pr-review`.

---

## When to Ask User

| Situation                               | Action                                 |
| --------------------------------------- | -------------------------------------- |
| Component not given / ambiguous         | Ask which component                    |
| Branch already exists                   | Ask: checkout existing or create new   |
| A required semantic token doesn't exist | Surface it — do not invent a primitive |
| shadcn source can't be fetched          | Ask for the source / URL               |
