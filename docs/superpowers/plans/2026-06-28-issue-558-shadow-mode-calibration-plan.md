# #558 Shadow Mode Calibration - Light/Dark Elevation Polish

> **Status:** Council-hardened plan. Ready to execute after user approval.
> This is intentionally separate from parked #556 surface elevation.

## Goal

Calibrate Nexus shadow modes so light mode stays crisp and dark mode has clearer
elevation, while keeping the public Appearance API unchanged:

- `quiet`
- `standard`
- `strong`

This work lives in `@nexus/core` shadow primitives and generated CSS, so every
Nexus consumer gets the improvement out of the box through `@nexus/tailwind`
plus `@nexus/react`.

## Issue

- GitHub Issue: #558 - Calibrate Nexus shadow modes for light and dark elevation
- Epic: Part of #531
- Related: follows #553; separate from parked #556

## Modern Web Guidance / Browser Floor

- MWG route: use repo-local Modern Web Guidance plus the AGENTS browser floor.
- External primary-doc check: Tailwind shadow utilities compile through
  `box-shadow: var(--shadow-*)`; CSS `box-shadow` supports comma-separated
  layers and `inset`.
- Browser-floor decision: #558 should use existing `box-shadow`, CSS custom
  properties, data attributes, and generated OKLCH output only.
- Do not introduce `light-dark()`, container style queries, native
  popover/anchor positioning, scrollbar styling, `filter: drop-shadow`,
  `backdrop-filter`, a new surface color ladder, or Fluid fixed surface colors.
- Run `pnpm audit:browser-support` on the final branch because CI runs it for
  package/app source changes.

## Source-Verified Facts

| Fact                                                                                 | Source / consequence                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public Appearance exposes only `quiet / standard / strong`.                          | `packages/core/src/lib/appearance-model.ts` defines `NexusElevation`. Do not add public values.                                                                                        |
| Token/docs shadow modes are five modes: `flat / soft / quiet / standard / strong`.   | `packages/core/scripts/lib/token-mode-manifest.js` and `apps/docs/app/_lib/theme-modes.ts`. `flat` and `soft` are not public Appearance values, but they are shipped token/docs modes. |
| Current shadow light/dark token files are byte-identical.                            | #558 must add a light-vs-dark diagnostic; `audit:mode-distinctness` does not catch this.                                                                                               |
| `audit:mode-distinctness` proves sibling byte non-identity only.                     | It compares modes within `shadow-light` and `shadow-dark`; it does not prove visual order or dark calibration.                                                                         |
| `Shadow.stories.tsx` currently composes source JSON inline.                          | It does not prove generated `--shadow-*` utilities or runtime `data-shadow` behavior.                                                                                                  |
| `pnpm tokens:modular` is mandatory after shadow token edits.                         | Modular generation emits docs theme CSS and `scripts/sync-docs-themes.js` copies it to `apps/docs/public/themes`.                                                                      |
| `formatShadowLayer()` supports `layer.inset`; current shipped recipes do not set it. | `inner` is inset through a generator special case, not an existing `styles/shadows.json` recipe flag.                                                                                  |
| Consumers use two shadow delivery paths.                                             | App/package consumers use `data-shadow` with bundled `@nexus/tailwind`; docs theme swapping loads `/themes/shadow-*.css` link files. Prove both paths.                                 |

## What We Are Changing

| Area                      | Before                                                                          | After #558                                                                      |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Public Appearance control | Elevation selects `quiet / standard / strong`                                   | Same                                                                            |
| Shipped token/docs modes  | `flat / soft / quiet / standard / strong`                                       | Same; `flat / soft` stay outside public Appearance                              |
| Consumer API              | Consumers use Nexus shadows through generated CSS                               | Same; prove generated CSS path works                                            |
| Light mode                | Existing values are serviceable but unreviewed against final polish target      | Keep subtle; tune only if review artifact shows weak distinction or heaviness   |
| Dark mode                 | Current dark files match light files, so dark elevation is not truly calibrated | Public dark files diverge from light and improve edge/drop separation           |
| #556 surface depth        | Parked; no nested surface context                                               | Still parked; not implemented here                                              |
| Fluid reference           | External inspiration                                                            | Borrow rendering principles, not fixed surface colors or nested substrate model |

## Non-Goals

- No nested `SurfaceProvider` / `surface-level-*` work.
- No popover-in-popover, menu-in-dialog, or same-tier nested overlay fixes.
- No new Appearance setting.
- No public API rename.
- No copy/paste of Fluid's `surface-1..8` colors.
- No removal or hiding of `flat` / `soft` token/docs modes.
- No typography, spacing, radius, stroke, or color token retune.
- No component rewiring unless a shadow utility is demonstrably wrong.

## Architecture Decision

**Default approach:** tune existing shadow primitive values first.

Why:

- The current architecture already supports light/dark shadow modes through
  `packages/core/tokens/primitives/shadow/shadow-{mode}-{light|dark}.json`.
- `data-shadow` already swaps these modes at runtime.
- Appearance already exposes the right product language.
- Value-only calibration is much smaller than changing the shared shadow recipe.

**Escalation path:** add inset/highlight recipe layers only if the visual review
artifact proves value-only tuning cannot produce dark-mode edge definition.

Escalation is not a small local edit. If `styles/shadows.json` references a new
primitive layer path, every canonical shadow mode must provide that path in both
light and dark:

- `flat`
- `soft`
- `quiet`
- `standard`
- `strong`

That means 10 primitive files must stay key-parity clean, even when non-public
Appearance modes use neutral/no-op values.

| Option                                | Decision        | Why                                                                               |
| ------------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| Value-only calibration                | Default path    | Smallest change; keeps schema/generator behavior stable                           |
| Add inset/highlight elevation layers  | Escalation only | Better dark edge definition, but shared recipe and all-mode parity make it larger |
| Implement #556 nested surface context | Not here        | Separate feature, parked intentionally                                            |

## File Structure

| File                                                                          | Purpose                                                                                 |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/private/tmp/issue-558-shadow-calibration-lab.html`                          | Scratch human review artifact: current vs proposed; not authoritative after merge       |
| `packages/core/tokens/primitives/shadow/shadow-quiet-light.json`              | Public quiet light calibration if needed                                                |
| `packages/core/tokens/primitives/shadow/shadow-standard-light.json`           | Public standard light calibration if needed                                             |
| `packages/core/tokens/primitives/shadow/shadow-strong-light.json`             | Public strong light calibration if needed                                               |
| `packages/core/tokens/primitives/shadow/shadow-quiet-dark.json`               | Public quiet dark calibration                                                           |
| `packages/core/tokens/primitives/shadow/shadow-standard-dark.json`            | Public standard dark calibration                                                        |
| `packages/core/tokens/primitives/shadow/shadow-strong-dark.json`              | Public strong dark calibration                                                          |
| `packages/core/tokens/primitives/shadow/shadow-{flat,soft}-{light,dark}.json` | Only touched if recipe-shape escalation requires key parity across all modes            |
| `packages/core/tokens/styles/shadows.json`                                    | Only touched if escalation adds inset/highlight recipe layers                           |
| `packages/react/src/stories/Shadow.stories.tsx`                               | Required update: generated-utility/runtime story and corrected public/internal language |
| `packages/react/src/appearance/AppearanceSettings.stories.tsx`                | Required public Elevation contract play coverage                                        |
| `packages/core/scripts/__tests__/generate-tailwind-package.test.js`           | Consumer proof for generated `nx:shadow-*` utilities under `data-shadow`                |
| `packages/tailwind/nexus.css`                                                 | Regenerated package CSS                                                                 |
| `packages/tailwind/variables.css`                                             | Regenerated if root/bundled primitive output changes                                    |
| `apps/docs/public/themes/shadow-*.css`                                        | Regenerated docs theme copies from `pnpm tokens:modular`                                |

## Implementation Sequence

### Task 0 - Branch And Baseline

- Create the branch from a verified fresh `main`, not the currently checked-out
  branch:
  - `git fetch origin`
  - `git switch main`
  - `git pull --ff-only origin main`
  - `git status --short --branch`
  - `git switch -c codex/issue-558-shadow-mode-calibration`
- If `main` is dirty or cannot fast-forward, stop and report before creating
  the branch.
- Keep unrelated scratch/report files out of the branch.
- Record:
  - `pwd`
  - `git branch --show-current`
  - `git rev-parse origin/main`
  - `git status --short --branch`
  - `git diff --stat origin/main...HEAD`
- Record baseline:
  - `pnpm --filter @nexus/core audit:mode-distinctness`
  - `pnpm validate:spacing-modes`

### Task 1 - Baseline Diagnostics

Capture facts before tuning:

- List current shadow modes from `packages/core/scripts/lib/token-mode-manifest.js`.
- Confirm public Appearance values from `packages/core/src/lib/appearance-model.ts`.
- Compare each public light/dark file:
  - `shadow-quiet-light.json` vs `shadow-quiet-dark.json`
  - `shadow-standard-light.json` vs `shadow-standard-dark.json`
  - `shadow-strong-light.json` vs `shadow-strong-dark.json`
- Produce a before table:
  - differing leaf count per public light/dark pair
  - public sibling differing leaf count from `audit:mode-distinctness`
  - approximate shadow-strength score for `quiet / standard / strong`

Add a #558-specific diagnostic/test if missing:

- public dark files must differ from matching public light files after tuning,
  unless the PR explicitly documents a deliberate exception
- public modes must sort by deterministic strength:
  - `quiet < standard < strong`
- strength should be based on displayed elevation shadows, not `inner`
- `audit:mode-distinctness` remains a byte-identity guard, not the visual proof

Define `shadowStrengthScore(modeFile)` before implementation:

- display keys: `2xs`, `xs`, `sm`, `base`, `md`, `lg`, `xl`, `2xl`
- exclude `inner`
- exclude recipe layers with `inset: true` if recipe escalation adds them
- layer score:
  - `alpha(color) * (abs(y) + abs(x) * 0.25 + blur * 0.5 + Math.max(spread, 0) * 0.25)`
- parse `#RRGGBBAA` alpha as `AA / 255`
- fail on unsupported color formats or non-px dimensions
- mode score: sum all display-key layer scores
- assert `quiet < standard < strong` separately for light and dark
- print scores in the diagnostic output
- treat this as a regression guard, not the visual approval source

### Task 2 - Visual Review Artifact

Build a scratch artifact at:

- `/private/tmp/issue-558-shadow-calibration-lab.html`

It must show current vs proposed:

- light and dark
- `quiet / standard / strong`
- card, popover, dialog/sheet-like panel, sidebar/floating panel
- `shadow-sm`, `shadow-lg`, `shadow-xl`, `shadow-2xl`

Manual signoff matrix:

| Dimension            | Must pass                                                   |
| -------------------- | ----------------------------------------------------------- |
| Edge readability     | Panel edge is readable without relying only on border color |
| Hierarchy            | `quiet`, `standard`, and `strong` feel ordered              |
| Light subtlety       | Light mode does not become heavy or dirty                   |
| Dark clarity         | Dark mode avoids flat/muddy same-surface feel               |
| Halo/glow            | No bright glow or artificial aura                           |
| Blur quality         | No oversized smoky blur                                     |
| Forced-colors caveat | Shadow is not the only visible boundary/state cue           |

Durable artifact:

- Storybook is the authoritative long-lived visual artifact.
- The scratch HTML may be attached to the PR or kept local.
- If any report under `reports/` is committed, mark it with source commit/date
  and "not authoritative after merge".

### Task 3 - Choose Calibration Path

Default:

- Tune existing x/y/blur/spread/color values in the six public primitive files.
- Do not touch `styles/shadows.json`.
- Do not touch `flat` or `soft`.

Escalate only if Task 2 shows value-only tuning cannot produce acceptable dark
edge definition:

1. Update all 10 shadow primitive files to include any new layer paths.
2. Update `packages/core/tokens/styles/shadows.json` to reference those paths.
3. Add generator tests proving:
   - `inset` appears where expected
   - every `var(--nx-shadow-*)` reference has a declaration
   - generated `nexus.css` and compiled shadow CSS contain no unresolved DTCG
     references matching `/\{[a-z0-9_.-]+\}/`
   - every shadow mode block has the same variable names in light and dark
4. Update `Shadow.stories.tsx` to render the recipe/generated utility output,
   not a stale source-JSON layer order.
5. Keep `pnpm validate:spacing-modes` green.

### Task 4 - Tune Tokens

Tune public modes:

- `quiet`
- `standard`
- `strong`

Recommended direction:

- Light mode: keep clean low-alpha drops; avoid bulky blur.
- Dark mode: add real divergence from light, with tighter near-edge shadow and
  controlled longer drop.
- Preserve readable boundaries without creating glow, haze, or heavy cards.

Do not tune:

- `flat`
- `soft`

unless recipe escalation requires neutral parity updates.

### Task 5 - Generated-CSS Consumer Proof

Add a generated CSS proof. Preferred location:

- `packages/core/scripts/__tests__/generate-tailwind-package.test.js`

Use the existing `compileGeneratedTailwind()` helper to prove:

- `nx:shadow-sm`, `nx:shadow-lg`, `nx:shadow-xl`, and `nx:shadow-2xl` compile.
- generated CSS contains non-empty `box-shadow` output for those utilities.
- `[data-shadow="quiet"]`, `[data-shadow="standard"]`, and
  `[data-shadow="strong"]` all set shadow variables.
- light and dark public mode blocks differ after calibration.
- resolved shadow variable sets differ between `quiet / standard / strong`:
  compare `[data-shadow]` primitive blocks, or resolve `--shadow-sm/lg/xl/2xl`
  through each mode's `--nx-shadow-*` declarations.
- do not expect the compiled `.nx\:shadow-*` utility class bodies themselves to
  differ by mode; those utilities should remain stable variable recipes.
- no stale `--nx-shadow-*` references are missing declarations.
- update the existing `.dark block contains only tokens that diverge from :root
by value` test in `generate-tailwind-package.test.js` so it no longer assumes
  dark shadow tokens stay absent:
  - if only colors diverge, assert color overrides intentionally appear
  - if geometry diverges, assert the expected x/y/blur/spread overrides
    intentionally appear

This is the out-of-the-box consumer proof. The source-JSON Storybook display is
not enough.

### Task 6 - Storybook And Appearance Proof

Update `packages/react/src/stories/Shadow.stories.tsx`:

- Fix default/public language:
  - `quiet` is the public Appearance default.
  - `flat` and `soft` are supported token/docs modes outside Appearance.
  - remove or rename the current `Bundled` badge tied to `flat`; if a badge
    remains, mark `quiet` as `Appearance default` and `flat` / `soft` as
    `Token/docs only`
- Add a runtime-utility story that renders real `nx:shadow-*` classes under:
  - `data-shadow="quiet"`
  - `data-shadow="standard"`
  - `data-shadow="strong"`
  - light and dark containers
- Render literal utility classes for the same elevation tiers the current story
  documents: `2xs`, `xs`, `sm`, `base`, `md`, `lg`, `xl`, and `2xl`.
- Keep any JSON-composed view clearly labeled as source-token documentation
  only.
- Storybook play assertions may check attributes, rendered cards, and
  `boxShadow !== "none"`, but must not assert exact computed `box-shadow`
  strings across browsers.
- If recipe shape changes, Storybook must render the generated recipe path, not
  hand-composed primitive JSON that can miss `styles/shadows.json`.

Add required `packages/react/src/appearance/AppearanceSettings.stories.tsx` play
coverage because #558 relies on the public Elevation contract:

- open the Elevation combobox
- assert options are exactly `Quiet`, `Standard`, `Strong`
- select `Strong`
- assert the preview includes `elevation: "strong",`
- wait for `document.documentElement` to have `data-shadow="strong"`
- restore the original `data-shadow` after the play function
- do not add `Flat` / `Soft` to Appearance
- run `pnpm --filter @nexus/react audit:storybook-coverage --component appearance-settings --json`
  after changing the story

Do not run `audit:storybook-coverage --component shadow`; Shadow is not a
component coverage-audit target. Run coverage audit for Appearance stories only
if those stories change.

### Task 7 - Regenerate Outputs

After any shadow primitive or recipe edit, always run:

- `pnpm tokens:tailwind`
- `pnpm tokens:modular`

Expected generated outputs:

- `packages/tailwind/nexus.css`
- `packages/tailwind/variables.css` if bundled/root shadow primitive output changes
- `apps/docs/public/themes/globals.css` if
  `packages/core/tokens/styles/shadows.json` changes, because modular globals
  carries the composed `--shadow-*` definitions
- `apps/docs/public/themes/shadow-flat.css`
- `apps/docs/public/themes/shadow-soft.css`
- `apps/docs/public/themes/shadow-quiet.css`
- `apps/docs/public/themes/shadow-standard.css`
- `apps/docs/public/themes/shadow-strong.css`

Review the generated diff explicitly:

- `git diff --name-only`
- confirm no unrelated generated files changed unexpectedly
- confirm docs theme copies are not stale
- for public modes, `apps/docs/public/themes/shadow-{quiet,standard,strong}.css`
  must have non-empty `html.dark` blocks after calibration
- `shadow-flat.css` and `shadow-soft.css` should remain no-op diffs unless
  recipe escalation requires parity-only changes

### Task 8 - Tests And QA

Core/token gates:

- `pnpm --filter @nexus/core audit:mode-distinctness`
- `pnpm audit:mode-codenames`
- `pnpm validate:spacing-modes` (token-mode parity for spacing, radius,
  borderwidth, and shadow)
- `pnpm --filter @nexus/core audit:contrast`
- `pnpm --filter @nexus/core audit:colorblind`
- `pnpm --filter @nexus/core audit:class-refs`
- `pnpm test:unit`

Package/API gates:

- `pnpm --filter @nexus/core build` as a narrow precondition
- `pnpm --filter @nexus/react build` as a narrow precondition
- `pnpm --filter @nexus/react typecheck:dist-appearance`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format:check`
- `git diff --check`
- `pnpm size-limit`
- `pnpm build` as final broad gate

Visual gates:

- `pnpm test:storybook`
- `pnpm --filter @nexus/react build-storybook`
- Storybook QA for `Shadow.stories.tsx` in light and dark
- capture screenshots for the final Storybook runtime shadow story at 1440x900:
  - light: quiet / standard / strong
  - dark: quiet / standard / strong
  - record screenshot paths plus reviewer/date in the PR body
  - do not use exact pixel-diff thresholds; visual pass/fail uses the matrix in
    Task 2
- Console/Appearance QA after build:
  - switch Elevation among Quiet / Standard / Strong
  - verify cards, menus, popovers, sheets, sidebars/floating panels look distinct
  - verify no nested-overlay expectations are claimed here
- Docs ThemePicker QA after `pnpm tokens:modular`:
  - open the docs Radius / Borders / Shadows page
  - use the Shadow select for Flat / Soft / Quiet / Standard / Strong
  - verify `link[data-theme="shadow"]` swaps to `/themes/shadow-*.css`
  - verify the docs shadow ramp changes in both light and dark mode

Browser-support gate:

- Use local Modern Web Guidance anchors plus AGENTS/RTK browser floor.
- Record that #558 uses existing `box-shadow`, custom properties, and generated
  OKLCH output only.
- Do not introduce `light-dark()`, container style queries, native
  popover/anchor positioning, scrollbar styling, or other new browser-platform
  CSS.
- Run `pnpm audit:browser-support` on the final branch because CI runs it for
  package/app source changes.
- Keep the forced-colors caveat: shadows cannot be the only visible boundary or
  state cue.
- If any `.html` report under `reports/` is committed, add an explicit HTML
  format/check step; root `format:check` does not include `.html`.

## PR Plan

Branch:

- `codex/issue-558-shadow-mode-calibration`

PR title:

- `feat(appearance): calibrate shadow modes`

PR body:

```md
## Summary

- calibrates Nexus shadow modes for clearer light/dark elevation
- keeps the public Appearance elevation API unchanged
- proves generated CSS/runtime data-shadow behavior for package consumers
- updates Shadow Storybook examples as the durable visual artifact

## GitHub Issue

Closes #558
Part of #531

## Test Plan

- [ ] pnpm tokens:tailwind
- [ ] pnpm tokens:modular
- [ ] pnpm --filter @nexus/core audit:mode-distinctness
- [ ] pnpm audit:mode-codenames
- [ ] pnpm validate:spacing-modes
- [ ] pnpm --filter @nexus/core audit:contrast
- [ ] pnpm --filter @nexus/core audit:colorblind
- [ ] pnpm --filter @nexus/core audit:class-refs
- [ ] pnpm test:unit
- [ ] pnpm --filter @nexus/core build
- [ ] pnpm --filter @nexus/react build
- [ ] pnpm --filter @nexus/react typecheck:dist-appearance
- [ ] pnpm typecheck
- [ ] pnpm lint
- [ ] pnpm format:check
- [ ] git diff --check
- [ ] pnpm test:storybook
- [ ] pnpm --filter @nexus/react build-storybook
- [ ] pnpm size-limit
- [ ] pnpm audit:browser-support
- [ ] pnpm build
```

## Risks

| Risk                                             | Mitigation                                                     |
| ------------------------------------------------ | -------------------------------------------------------------- |
| Dark shadows become heavy or muddy               | Use artifact first; tune against real surfaces                 |
| Light mode starts looking over-elevated          | Keep light changes minimal; compare before/after               |
| `audit:mode-distinctness` gives false confidence | Add #558-specific light/dark and strength diagnostics          |
| Generated docs themes drift                      | Make `pnpm tokens:modular` mandatory                           |
| Storybook misses runtime CSS                     | Add generated-utility/runtime story                            |
| Inset recipe expands scope                       | Escalate only with proof and update all 10 mode files          |
| Confusion with #556                              | QA standalone examples only; nested overlay depth remains #556 |

## Recommendation

Proceed with #558, but keep the first implementation PR disciplined:

1. Build the scratch visual comparison.
2. Add deterministic diagnostics.
3. Tune existing public shadow values.
4. Prove generated CSS and runtime `data-shadow` behavior.
5. Avoid recipe/schema escalation unless the artifact proves it is necessary.
