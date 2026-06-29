# Phase F — Appearance Visual QA and Polish — Implementation Plan

> **For agentic workers:** Phase F is a visual QA and polish pass, not another architecture phase. Start from `origin/main` after #568, use branch `codex/phase-f-appearance-visual-qa`, capture evidence first, then fix only concrete visual regressions.

## Summary

Phase F answers one question: does the packaged Appearance system now feel production-quality across real Nexus surfaces?

The API, token model, package boundary, consumer docs, and reactivity guardrails are already complete through #563, #565, and #568. This phase should verify the experience in the console and Storybook, record visual evidence, and make narrow polish fixes where the current output is visibly wrong.

## Scope

- GitHub issue: #566
- Epic: #531
- Branch: `codex/phase-f-appearance-visual-qa`
- Base: `origin/main` after #568

## Current Ground Truth

- #563 is closed and now guards Appearance reactivity in normal validation.
- #565 is closed; #568 merged Phase E consumer readiness.
- #558 calibrated shadow/elevation token values. Public Appearance elevation remains `quiet / standard / strong`.
- #556 nested surface/elevation context remains parked and must not be unparked inside Phase F.
- Storybook already uses `NexusAppearanceProvider` globals for mode, brand, surface tone, contrast, density, corners, elevation, stroke, and typography prefs.
- The repo has Vitest + Storybook browser tests via Playwright, but no standalone Playwright config. Browser screenshots/signoff should be produced as QA artifacts, not by inventing a new visual-regression framework in this PR.

## Non-Goals

- No new public Appearance API.
- No new Appearance controls.
- No #556 surface-level context work.
- No broad token-system retuning without before/after visual evidence.
- No visual redesign of the Appearance page.
- No copying another product's colors, surfaces, shadows, or brand styling.

## Visual Quality Principles

- **Modern product feel:** quiet, scannable, utilitarian, and dense enough for repeated use.
- **Contrast remains structural:** the slider should strengthen surfaces, borders, dividers, nav states, controls, and cards without re-toning the typography hierarchy.
- **Mode/tone confidence:** every light/dark + surface-tone combination should avoid muddy surfaces, harsh borders, illegible muted text, or washed-out cards.
- **Package parity:** `/design/appearance`, Settings -> Appearance, topbar quick control, and Storybook should all reflect the same package model.
- **Evidence first:** every visual fix should point to a screenshot, state tuple, or Storybook story that showed the problem.

## Public Appearance Matrix

Use the shipped model from `packages/core/src/lib/appearance-model.ts`:

- Mode: `light`, `dark`, `system`
- Surface tone: `stone`, `neutral`, `zinc`, `slate`, `gray`
- Contrast: representative values `0`, `60`, `100`
- Density: `compact`, `default`, `comfortable`, `spacious`
- Corners: `square`, `subtle`, `smooth`, `round`
- Elevation: `quiet`, `standard`, `strong`
- Stroke: `fine`, `normal`, `strong`
- Typography prefs: UI font, code font, UI font size, code font size
- Preferences: reduce motion, pointer cursors, font smoothing

## Execution Status

- [x] Task 1: baseline and QA artifact setup.
- [x] Task 2: console Appearance QA.
- [x] Task 3: Storybook Appearance/component QA.
- [x] Task 4: focused dark-mode and elevation/shadow pass.
- [x] Task 5: fix concrete visual regressions.
- [x] Task 6: final validation, issue update, and PR.

## Execution Notes

Concrete QA-backed fixes found during execution:

- Card/Input/Accordion were checked for border Appearance reactivity. The
  clearer `border-width-*` / `border-color-*` aliases are runtime-safe and stay
  valid; the appearance reactivity audit remains focused on raw border widths
  and arbitrary literals that bypass the Stroke control.
- `strong` stroke used `1.5px` for `--nx-borderwidth-default`; Chromium computes
  `1.5px` borders as `1px`, so normal component borders looked unchanged.
  `borderwidth-strong.default` is now `2px`, with generated CSS and screenshots
  refreshed.

One non-blocking limitation remains documented in the QA report: density role
tokens move correctly, but table-heavy console scenes still make
comfortable/spacious density subtle because many table parts use numeric/fixed
spacing. Treat broader table-density calibration as a follow-up, not a Phase F
blocker.

---

## Task 1: Baseline and QA Artifact Setup

**Goal:** Start from a known-good branch and create a durable artifact that records what was reviewed.

**Files:**

- Create `reports/phase-f-appearance-visual-qa.md` — visual QA matrix, screenshot links, findings, and signoff notes.
- Create `reports/phase-f/` screenshots as needed.

**Steps:**

1. Confirm branch/base:

   ```bash
   git status --short --branch
   git log -1 --oneline
   gh issue view 566 --json number,title,state,url
   ```

2. Run package/guardrail baselines:

   ```bash
   pnpm audit:appearance-reactivity
   pnpm typecheck:dist
   pnpm --filter @nexus/react build
   pnpm --filter @nexus/console build
   ```

3. Start the console and Storybook for browser review:

   ```bash
   pnpm console
   pnpm storybook
   ```

4. Create `reports/phase-f-appearance-visual-qa.md` with:
   - branch/head SHA
   - console URL
   - Storybook URL
   - review matrix
   - screenshot inventory
   - findings table with severity, route/story, state tuple, screenshot, and fix decision

**Verification:**

- Baseline commands either pass or their failure is recorded before visual work starts.
- QA artifact exists and links to every screenshot captured in later tasks.

---

## Task 2: Console Appearance QA

**Goal:** Verify the real console surfaces, not just package tests.

**Routes and surfaces:**

- `/design/appearance`
- Settings -> Appearance
- topbar quick control
- command palette path to Appearance
- at least one dense console scene with tables/forms/cards after changing Appearance

**Review Matrix:**

1. Surface tones:
   - light + `stone / neutral / zinc / slate / gray` at contrast `60`
   - dark + `stone / neutral / zinc / slate / gray` at contrast `60`

2. Contrast:
   - light + `stone` at `0 / 60 / 100`
   - dark + `stone` at `0 / 60 / 100`
   - dark + `slate` at `0 / 60 / 100`

3. Typography:
   - UI font size `12 / 14 / 18`
   - code font size `11 / 12 / 16`
   - verify labels, controls, nav, table text, and code/config preview respond without clipping

4. Layout feel:
   - density: `compact / default / comfortable / spacious`
   - corners: `square / subtle / smooth / round`
   - elevation: `quiet / standard / strong`
   - stroke: `fine / normal / strong`

5. Parity:
   - change mode/surface/brand in topbar quick control, confirm `/design/appearance` reflects it
   - change settings in `/design/appearance`, confirm Settings -> Appearance and topbar reflect it
   - reload, confirm persisted state survives

**Quality Checks:**

- No text overlap or clipped labels.
- Sidebar/nav borders and content borders move consistently with contrast/stroke.
- Cards, tables, popovers, select menus, and dialogs remain readable in dark mode.
- Brand color affects primary/selected states without overwhelming neutral surfaces.
- Page still feels like a product UI, not a demo poster.

**Verification:**

- Add screenshots and notes to `reports/phase-f-appearance-visual-qa.md`.
- File concrete findings only when a state tuple visibly fails.

---

## Task 3: Storybook Appearance and Component QA

**Goal:** Verify package consumers get the same visual model through Storybook globals.

**Primary stories:**

- `packages/react/src/stories/Typography.stories.tsx`
- `packages/react/src/stories/Spacing.stories.tsx`
- `packages/react/src/stories/Shadow.stories.tsx`
- `packages/react/src/stories/Colors.stories.tsx`
- `packages/react/src/components/ui/button/Button.stories.tsx`
- `packages/react/src/components/ui/card/Card.stories.tsx`
- `packages/react/src/components/ui/input/Input.stories.tsx`
- `packages/react/src/components/ui/table/Table.stories.tsx`
- `packages/react/src/components/ui/dialog/Dialog.stories.tsx`
- `packages/react/src/components/ui/select/Select.stories.tsx`
- `packages/react/src/components/ui/dropdown-menu/DropdownMenu.stories.tsx`
- `packages/react/src/components/ui/popover/Popover.stories.tsx`
- `packages/react/src/components/ui/sheet/Sheet.stories.tsx`

**Review Matrix:**

- Change Storybook toolbar globals for:
  - mode
  - surface tone
  - contrast
  - density
  - corners
  - elevation
  - stroke
  - UI/code font size

**Quality Checks:**

- Storybook globals round-trip into rendered components.
- Component surfaces use runtime tokens rather than looking frozen.
- Shadow/elevation story shows meaningful public `quiet / standard / strong` separation.
- Storybook docs mode still renders without double-provider or hydration weirdness.

**Verification:**

```bash
pnpm test:storybook
pnpm audit:storybook-coverage
```

Record any visual findings in the QA artifact. Do not add broad new story coverage unless a shipped Appearance behavior is genuinely unreviewable without it.

---

## Task 4: Dark-Mode and Elevation/Shadow Polish Pass

**Goal:** Specifically stress the area that motivated #558 and prior dark-mode concerns.

**Surfaces to inspect:**

- cards inside pages
- popovers/select/dropdown menus
- dialog/sheet/command surfaces
- tables with hover/active rows
- sidebar/nav active and hover states
- Storybook `Shadow` story

**State tuples:**

- dark + `stone` + contrast `60` + elevation `quiet / standard / strong`
- dark + `slate` + contrast `60` + elevation `quiet / standard / strong`
- dark + `neutral` + contrast `0 / 100` + elevation `standard`

**Reference Pass:**

Use modern product references only as qualitative comparison points:

- Does dark mode have enough separation without glowing borders?
- Are shadows/rings subtle but perceptible?
- Are elevated controls readable without looking like black blobs?
- Does the UI remain work-focused and scannable?

Do not copy exact colors, surfaces, or shadows from Linear, Notion, Vercel, Fluid, or any other product.

**Verification:**

- Screenshots in `reports/phase-f/`.
- Findings table classifies each issue as:
  - `fix in Phase F`
  - `documented acceptable`
  - `new follow-up issue`

---

## Task 5: Fix Concrete Visual Regressions

**Goal:** Make narrow polish fixes backed by the QA evidence.

**Allowed fixes:**

- Component utility changes where a real component bypasses existing runtime tokens.
- Small layout/class fixes for clipping, overlap, or broken responsive behavior.
- Small docs/story tweaks that make the visual state reviewable.
- Token value tweaks only if the failure is clearly token-level and the before/after artifact proves it.

**Not allowed:**

- Adding new Appearance controls.
- Reopening the package/runtime architecture.
- Implementing #556 nested surface context.
- Broad retuning because a screenshot feels subjectively "not ideal" without a concrete failure.

**Ripple Checks:**

- If a component utility changes, run `pnpm audit:appearance-reactivity`.
- If a story changes, run `pnpm test:storybook`.
- If token output changes, run token generation/audits and update screenshots.
- If console UI changes, verify `/design/appearance`, Settings, and topbar parity again.

**Verification:**

- Each fix links to one finding in the QA artifact.
- Every fixed finding has before/after screenshots or a clear note explaining why screenshot evidence is not useful.

---

## Task 6: Final Validation, Issue Update, and PR

**Goal:** Land Phase F with evidence reviewers can trust.

**Final Checks:**

```bash
pnpm audit:appearance-reactivity
pnpm audit:storybook-coverage
pnpm test:storybook
pnpm test:unit
pnpm --filter @nexus/react build
pnpm --filter @nexus/console build
pnpm typecheck
pnpm lint
pnpm build
```

**Manual QA Completion Criteria:**

- `/design/appearance` reviewed.
- Settings -> Appearance reviewed.
- topbar quick control reviewed.
- Storybook Appearance globals reviewed.
- light/dark reviewed.
- all five surface tones reviewed.
- contrast `0 / 60 / 100` reviewed.
- typography sizing reviewed.
- density/corners/elevation/stroke reviewed.
- shadow/elevation polish from #558 reviewed.
- screenshots or notes recorded in `reports/phase-f-appearance-visual-qa.md`.

**PR Body:**

- Title: `fix(appearance): complete Phase F visual QA and polish`
- Body includes:
  - `Closes #566`
  - `Part of #531`
  - QA matrix summary
  - visual artifact link/path
  - fixes made
  - commands run
  - explicit note that #556 remains parked

**After Merge:**

- Update #531:
  - mark Phase F complete
  - mark the epic done if no new blocking visual regressions remain
  - keep #556 in parked/non-blocking section

## Risks and Decisions

| Item                        | Type     | Notes                                                                                                                         |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Subjective visual judgment  | Risk     | Use screenshots and state tuples so review is grounded, not taste-only.                                                       |
| Matrix explosion            | Risk     | Use representative combinations, not every possible cartesian product. Cover all tones and all public controls at least once. |
| Storybook vs console drift  | Risk     | Verify both; Storybook proves package consumer behavior, console proves dogfood behavior.                                     |
| Dark-mode elevation         | Risk     | Fix only concrete failures; #556 remains parked.                                                                              |
| Token retuning              | Decision | Allowed only with before/after evidence and full token/audit validation.                                                      |
| External product references | Decision | Use as quality benchmarks, never as source material to copy.                                                                  |

## Done Bar

- [x] QA artifact created and populated.
- [x] Console Appearance paths reviewed.
- [x] Storybook Appearance/component paths reviewed.
- [x] Visual regressions fixed or explicitly classified.
- [x] Validation commands recorded.
- [x] #566 closed by PR.
- [ ] #531 updated after merge.
