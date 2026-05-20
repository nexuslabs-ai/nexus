# UI Audit

Audits a running application for UI/UX issues using Playwright MCP. Navigate through user flows directly, screenshot each state, and report issues categorized by severity.

## Input

- **$ARGUMENTS**: URL, GitHub issue number, or description of what to audit
- **Optional flag**: `--mobile` / `--desktop` / `--both` (default: `--mobile`)

```
Examples:
  /ui-audit http://localhost:3000/papers/new           → Audit on mobile (default)
  /ui-audit http://localhost:3000/papers/new --both     → Audit on mobile + desktop
  /ui-audit http://localhost:3000/papers/new --desktop   → Audit on desktop only
  /ui-audit #63                                         → Infer URL from issue context
  /ui-audit                                             → Use conversation context
```

## Flow

```
Detect Context (URL, viewport, scope)
     |
     v
Navigate to URL -> identify test flows (yourself, via Playwright)
     |
     v
Show flows to user -> WAIT for approval
     |
     v
Create task list from approved flows
     |
     v
+--- For each flow --------------------------------+
|                                                   |
|   Mark in_progress                                |
|   Execute the flow yourself via Playwright MCP    |
|   Collect issues                                  |
|   Mark completed                                  |
|                                                   |
+---------------------------------------------------+
     |
     v
Compile all issues into final report
```

---

## Execution

### Phase 1: Detect Context

Parse `$ARGUMENTS`:

```
If URL found        -> Use as target URL
If #123 found       -> gh issue view 123, infer URL from issue body or conversation
If description      -> Ask user for URL
If nothing          -> Ask user for URL
```

Parse viewport flag:

| Flag                 | Viewport                       |
| -------------------- | ------------------------------ |
| `--mobile` (default) | 390x844                        |
| `--desktop`          | 1440x900                       |
| `--both`             | Run mobile first, then desktop |

### Phase 2: Identify Test Flows

**Do this yourself — do NOT spawn an agent.**

1. Read available design references (`.claude/rules/` — especially `components.md`, `tokens.md`, `figma.md`, `shadcn-divergences.md` — and design tokens in `packages/core/tokens/`)
2. Use `mcp__playwright__browser_resize` to set the viewport
3. Use `mcp__playwright__browser_navigate` to go to the URL
4. Use `mcp__playwright__browser_take_screenshot` to capture the initial state
5. Use `mcp__playwright__browser_snapshot` to explore the accessibility tree
6. Based on what you see, identify the key user flows to test

### Phase 3: Flow Approval

After identifying flows:

1. Create a task list from the flows
2. Present to user:

   ```markdown
   ## UI Audit Plan

   **URL:** {target_url}
   **Viewport:** {mobile | desktop | both}

   ### Test Flows

   {numbered flow list}

   Does this look good? Let me know if you'd like to add, remove, or modify any flows.
   ```

3. **WAIT for user approval**

4. If user requests changes -> adjust, present again

### Phase 4: Audit Loop

For each approved flow:

#### Step A — Mark in_progress

Update the task to `in_progress`.

#### Step B — Execute the flow yourself

**Do NOT spawn an agent. Use Playwright MCP tools directly.**

Follow the process in `.claude/skills/ui-audit-guide/SKILL.md`:

1. Set up the viewport with `mcp__playwright__browser_resize`
2. Navigate to the URL (or continue from prior state) with `mcp__playwright__browser_navigate`
3. Execute the flow step by step:
   - `browser_snapshot` before each interaction (source of truth for element refs)
   - Perform the interaction (`browser_click`, `browser_type`, etc.)
   - `browser_take_screenshot` after each interaction
   - Evaluate against design guidelines
4. Collect all issues found

#### Step C — Mark completed

Update the task to `completed`.

### Phase 5: Visual Direction Evaluation

After all flows are audited, run the visual direction pass **before** compiling the report.

**Do NOT spawn an agent. Do this yourself.**

Follow Step 5 in `.claude/skills/ui-audit-guide/SKILL.md`:

1. State the design intent explicitly (product, user, north star) — infer from available design references (`.claude/rules/`, design tokens)
2. Select 2–4 key "resting state" screenshots from what you captured during Phase 4
3. For each screenshot, answer the five decomposed questions (squint test, type scale, spacing rhythm, primary action clarity, intentionality)
4. Score each dimension 1–5 with a one-sentence observation
5. Add a cross-screen comparison if multiple screens were evaluated

Scores ≤ 2 are flagged as "human design review recommended" — they do not become implementation tasks.

### Phase 6: Compile Report

After the visual direction pass, compile the final report:

```markdown
## UI/UX Audit Complete

**URL:** {target_url}
**Viewport:** {viewport_mode}
**Flows tested:** {count}

### Functional Issues

| Severity | Count |
| -------- | ----- |
| Critical | {n}   |
| Moderate | {n}   |
| Minor    | {n}   |

### Critical Issues

| #   | Issue   | Where      | Details   |
| --- | ------- | ---------- | --------- |
| 1   | {title} | {location} | {details} |

### Moderate Issues

| #   | Issue   | Where      | Details   |
| --- | ------- | ---------- | --------- |
| 1   | {title} | {location} | {details} |

### Minor Issues

| #   | Issue   | Where      | Details   |
| --- | ------- | ---------- | --------- |
| 1   | {title} | {location} | {details} |

### Visual Direction

**Design intent:** {one sentence: product / user / north star}

| Dimension                 | Score | Observation    |
| ------------------------- | ----- | -------------- |
| Squint test (focal point) | {1–5} | {one sentence} |
| Type scale (hierarchy)    | {1–5} | {one sentence} |
| Spacing rhythm            | {1–5} | {one sentence} |
| Primary action clarity    | {1–5} | {one sentence} |
| Intentionality            | {1–5} | {one sentence} |

**Overall:** {1–2 sentences}

{If any score ≤ 2: "Human design review recommended for: {dimensions}"}

### What Works Well

- {positive}
- {positive}

### Flows Tested

| #   | Flow   | Result              |
| --- | ------ | ------------------- |
| 1   | {name} | {Pass / {n} issues} |

### Next Steps

- Fix critical issues first
- Address moderate issues before PR
- Minor issues can be batched
- Visual direction scores ≤ 2 require human design review, not code fixes
```

---

## When to Ask User

| Situation                                       | Action                                  |
| ----------------------------------------------- | --------------------------------------- |
| No URL provided                                 | Ask for the URL                         |
| After identifying flows                         | Always show flows and WAIT for approval |
| Page requires authentication                    | Ask user for setup instructions         |
| Playwright MCP not responding                   | Ask user to check the MCP server        |
| Ambiguous interaction (multiple possible paths) | Ask user which path to test             |

## Viewport Reference

| Device        | Width x Height | Use Case             |
| ------------- | -------------- | -------------------- |
| iPhone 14 Pro | 390x844        | Default mobile audit |
| iPad          | 768x1024       | Tablet (if needed)   |
| Desktop       | 1440x900       | Desktop audit        |
