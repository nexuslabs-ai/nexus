---
name: ui-audit-guide
description: Audit a running application for UI/UX issues using Playwright MCP. Navigates through user flows, screenshots each state, and reports issues categorized by severity. Includes a separate visual direction evaluation pass.
user-invocable: false
---

# UI Audit Guide

## Purpose

Audit a running web application for UI/UX issues by navigating through user flows with Playwright MCP. Evaluate each screen against the project's design guidelines and report issues categorized by severity. Then run a separate visual direction pass on key screenshots.

## When to Use

- After building a new feature or page
- Before creating a PR to catch UX regressions
- When reviewing someone else's UI implementation
- When the user asks to "test the UI" or "check the design"

## Base Rules

Always load and audit against:

| Rule                                                                 | Purpose                                                                      |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [logging-proportionality.md](../../rules/logging-proportionality.md) | Report findings tersely — one dense line per issue, no incremental narration |

## Prerequisites

- **Playwright MCP** server available — provides the `mcp__playwright__*` browser tools this skill uses (runs headless by default). Note: this repo's `.mcp.json` ships `chrome-devtools`, not Playwright, so configure the Playwright MCP at user or project scope if it isn't already available.
- The application must be running at a known URL

## Process

### Step 1: Understand the Scope

Read the input to determine:

- **URL** to audit
- **Viewport(s)** to test (mobile, desktop, or both — default: mobile)
- **Flows to test** (provided by user or inferred from the page)

If flows are not specified, explore the page to identify them:

1. Navigate to the URL
2. Take a snapshot to understand the page structure
3. Identify the key user flows (form submissions, navigation, state changes)
4. Return the proposed flows to the coordinator for user approval

### Step 2: Load Design Context

Before testing, read available design references: the `.claude/rules/` directory (especially `components.md`, `tokens.md`, `figma.md`, `shadcn-divergences.md`), and design tokens in `packages/core/tokens/`. Skip any that don't apply.

Extract and hold onto:

- Who the user is (non-technical? expert? mobile-first?)
- What the product is for
- The aesthetic north star (one-sentence summary of what "good" feels like for this product)
- Anti-patterns to watch for

This design intent will anchor the visual direction evaluation in Step 5.

### Step 3: Set Up Viewport

Use `browser_resize` to configure the viewport:

**Mobile (default):**

```
browser_resize width: 390, height: 844
```

**Desktop:**

```
browser_resize width: 1440, height: 900
```

Navigate to the target URL with `browser_navigate` to ensure clean state.

### Step 4: Execute Each Flow (Functional Audit)

For each flow in the approved list:

#### 4a. Navigate to the starting state

- Use `browser_navigate` to go to the URL
- Use `browser_click` or `browser_evaluate` to set up prerequisites (e.g., select an item in a previous step)

#### 4b. Take baseline screenshot + snapshot

- `browser_snapshot` — accessibility tree (a11y roles, labels, disabled state). This is the **primary interaction method** — elements are referenced by their a11y tree ref.
- `browser_take_screenshot` — visual state. **Save each key screenshot mentally — you will use these in Step 5.**

#### 4c. Perform the interaction

- `browser_click` on elements by ref from the snapshot
- `browser_type` for text input
- `browser_press_key` for keyboard interactions
- `browser_select_option` for native select elements
- `browser_evaluate` for programmatic checks when a11y tree isn't enough

#### 4d. Capture the result

- `browser_take_screenshot` — visual state after interaction
- `browser_snapshot` — check ARIA states changed (expanded, disabled, selected)

#### 4e. Functional evaluation

For each state captured, check for **functional and semantic issues only** — visual direction is evaluated separately in Step 5.

| Check         | What to Look For                                                                      |
| ------------- | ------------------------------------------------------------------------------------- |
| States        | Loading skeleton, empty state with CTA, error with recovery action                    |
| Accessibility | Labels on interactive elements, focus indicators, disabled state clarity              |
| Content       | Plain language labels, descriptive CTAs, inline validation errors                     |
| Interactions  | Disabled fields have clear reason, cascading behavior correct, touch targets adequate |
| Layout        | Obvious overflow, wrapping, viewport fit at current breakpoint                        |

### Step 5: Visual Direction Evaluation

Run this **once after all flows are complete** — not per-flow. This is a holistic evaluation using the key screenshots collected during Step 4. It is a separate pass with a different goal: not "is it functional?" but "does it feel designed?"

#### 5a. State the design intent

Before evaluating, write out explicitly:

```
Product: {what it is}
User: {who uses it}
North star: {what "good" feels like for this product and audience}
```

This is not a checklist item — it anchors your entire visual evaluation. If you don't know the intent, the evaluation has no baseline.

#### 5b. Select key screens

From the screenshots taken during Step 4, pick the primary **resting state** of each distinct screen — not every interaction state. Typically 2–4 screenshots per audit. Prefer screens that represent the core product experience.

#### 5c. Evaluate each screen with decomposed questions

For each screenshot, answer these five questions before assigning any score. Write a one-sentence answer to each.

**Q1 — Squint test**
_Ignoring all text, where does visual weight concentrate? Is there one clear focal point, or is mass evenly distributed?_

**Q2 — Type scale**
_How many distinct visible type sizes are present? Is there a clear large → medium → small hierarchy, or do sizes cluster together without differentiation?_

**Q3 — Spacing rhythm**
_Does vertical spacing between content sections feel consistent and intentional? Or arbitrary — some elements cramped, others loosely spaced?_

**Q4 — Primary action clarity**
_Can you identify the primary action within 2 seconds? Is everything else clearly visually subordinate to it?_

**Q5 — Intentionality**
_Do visual choices appear deliberate — consistent patterns, aligned decisions across similar elements? Or assembled — random-feeling variations in weight, spacing, or treatment between similar things?_

#### 5d. Score each dimension

After answering, assign a score 1–5:

| Score | Meaning                                     |
| ----- | ------------------------------------------- |
| 5     | Excellent — clearly intentional, confident  |
| 4     | Good — minor inconsistency, not user-facing |
| 3     | Acceptable — noticeable, worth noting       |
| 2     | Weak — degrades experience, needs attention |
| 1     | Problematic — visual direction fails here   |

**Any dimension scoring ≤ 2**: flag as "recommend human design review" — not as an implementable code issue. These are design direction calls, not bugs.

#### 5e. Cross-screen comparison

When multiple screens are evaluated, add one pairwise observation:

_"Compared to [other screen], does this screen feel visually consistent in hierarchy, density, and rhythm? If not, which is the outlier?"_

### Step 6: Compile Issues

Group all **functional** issues found across all flows into three severity categories:

**Critical** — Blocks or confuses users, data loss risk, accessibility failure

- Buttons/controls that don't work
- States that look interactive but aren't (or vice versa)
- Missing loading/error/empty states
- Accessibility failures (no labels, broken keyboard nav)
- Misleading content (wrong placeholder, contradictory state)

**Moderate** — Degrades experience but has workarounds

- Layout issues (not full-width on mobile, poor stacking)
- Unclear disabled states
- Missing step labels or context
- Validation messages that are too technical

**Minor** — Polish, no functional impact

- Missing undo/confirmation for destructive actions
- Spacing/alignment nitpicks visible in code
- Could use better empty state text

### Step 7: Note Positives

Note what works well — patterns worth keeping and replicating.

## Output Format

Return this structure:

```markdown
## UI/UX Audit — {page name or URL}

**Viewport:** {390x844 mobile | 1440x900 desktop | both}
**Flows tested:** {count}

### Functional Issues

#### Critical ({count})

| #   | Issue         | Where                     | Details                                           |
| --- | ------------- | ------------------------- | ------------------------------------------------- |
| 1   | {short title} | {component / screen area} | {what's wrong, why it matters, what it should be} |

#### Moderate ({count})

| #   | Issue         | Where                     | Details                                           |
| --- | ------------- | ------------------------- | ------------------------------------------------- |
| 1   | {short title} | {component / screen area} | {what's wrong, why it matters, what it should be} |

#### Minor ({count})

| #   | Issue         | Where                     | Details                                           |
| --- | ------------- | ------------------------- | ------------------------------------------------- |
| 1   | {short title} | {component / screen area} | {what's wrong, why it matters, what it should be} |

### Visual Direction

**Design intent:** {one sentence: product / user / north star}

| Dimension                 | Score | Observation    |
| ------------------------- | ----- | -------------- |
| Squint test (focal point) | {1–5} | {one sentence} |
| Type scale (hierarchy)    | {1–5} | {one sentence} |
| Spacing rhythm            | {1–5} | {one sentence} |
| Primary action clarity    | {1–5} | {one sentence} |
| Intentionality            | {1–5} | {one sentence} |

**Overall:** {1–2 sentences on the overall visual direction impression}

{If any score ≤ 2: "Human design review recommended for: {dimensions}"}

### What Works Well

- {positive observation}
- {positive observation}

### Flows Tested

| #   | Flow        | Result              |
| --- | ----------- | ------------------- |
| 1   | {flow name} | {Pass / {n} issues} |
```

## Tips for Reliable Playwright MCP Interaction

1. **Always `browser_snapshot` before clicking** — element refs change after navigation or re-renders. The snapshot is your source of truth for element references.
2. **Playwright uses the a11y tree for interactions** — `browser_click` targets elements by their accessibility role/label, making it reliable with Radix/shadcn components without workarounds.
3. **Use `browser_wait_for`** after navigation or state changes — wait for expected text/elements to appear before taking the next snapshot.
4. **Check both visual (screenshot) and semantic (snapshot)** — a button may look right but have wrong ARIA attributes, or vice versa.
5. **Use `browser_resize`** to test responsive layouts at different breakpoints — no need to reload.
6. **After form interactions**, take a new `browser_snapshot` to check for validation messages and ARIA state changes.
7. **Visual direction scores ≤ 2 are design calls, not code bugs** — do not create implementation tasks for them. Flag for human review.
