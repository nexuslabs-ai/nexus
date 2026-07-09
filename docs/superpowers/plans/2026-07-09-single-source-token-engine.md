# Single-Source Token Engine — Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Design rationale + council review:** `.claude/plans/issue-a-review-council-encapsulated-peacock.md` (v3). This document is the executable companion — how, in what order, with what gates.
> **Phase 0 executes a separate, already-written plan:** `docs/superpowers/plans/2026-07-09-split-light-dark-contrast.md`.

**Goal:** Make `deriveTheme` the only producer of semantic color tokens — run once at build time (static floor baked into `nexus.css`) and once at runtime (provider-injected overrides) — then delete the hand-authored semantic-color JSON and the entire parity/reconciliation apparatus that existed only to keep two producers agreeing.

**Architecture:** One brain, two invocation times. `color.json` primitives stay (the engine's ingredient list). Semantic color decisions move into an engine-owned, shade-anchored `surface-ladder.ts`. Non-color families (spacing / radius / shadow / borderwidth / motion / typography) are untouched — they were already single-source. The frozen matrix snapshot + APCA sweep + registry self-parity replace the parity net. Build order: new artifacts first (Phases 1–3, old oracles stay green throughout), deletions last (Phase 4).

**Tech stack:** TypeScript, Vitest (`unit` + `storybook` projects), Storybook 10, pnpm + turbo monorepo (`@nexus_ds/core`, `@nexus_ds/react`, `@nexus_ds/tailwind`), Next.js (`apps/docs`), culori + apca-w3.

## Why (30-second context)

Two systems produce the same `--nx-color-*` tokens today: hand-authored JSON → generated static CSS, and the runtime engine → injected `<style>`. Four parity mechanisms exist solely to keep them agreeing — and the council review proved they **already disagree in six token groups with every test green** (including a real bug: light `chart-categorical-2` emits `green.700`, byte-identical to `success-subtle-foreground`). Three subtly different dark themes coexist because the parity oracle tests with seeds production never uses. The reconciliation tax buys nothing. One producer is the only configuration this codebase has actually kept correct.

## Global Constraints (every task inherits these)

- **Scope = semantic COLOR only.** Never touch spacing/radius/shadow/borderwidth/motion/typography derivation — they stay JSON → CSS exactly as today.
- **Seeds = the production contract.** Every build-time or snapshot engine run constructs input via `createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)` (`appearance-model.ts:315-325`), varying only `surfaceTone` for the tone matrix. Never the old oracle's counterfactual `950` seeds (`tone-parity.test.ts:248`).
- **Old oracles stay green until Phase 4.** `derive-theme.parity`, `derive-theme.static-parity`, `tone-parity`, `light-tone.fixture` are the safety net through Phases 1–3. Nothing reconciliation-related is deleted before Phase 4.
- **No token-level override map.** A `{token → value}` plane is the two-truth backdoor (council-rejected). Exceptions = widened typed parameters inside the one producer (see Task 1.3's reserved shape).
- **Deletion test:** a check dies only if its purpose is reconciling the duplicate. Checks guarding untrusted input (sanitizer, snapshot version gate) or hand-authored data (colorblind, non-color mode audits) survive.
- **Adjudicate before deleting.** The six live divergences are design-decided in Phase 2 — the cutover must not silently bless whatever the engine happens to emit.
- **One phase = one PR — except Phase 4, which is FOUR sequenced PRs** (B0 enums → B-ci docs CI job → B-docs migration → B-del deletions; see the Phase 4 header for why that order). The deletion PR (B-del) **must touch `packages/`** or CI's `packages` filter skips build/typecheck entirely (`ci.yml:36,78-86`).
- Gates: whole `pnpm test:unit` (never a package subset), `pnpm format:check` before every push.
- **Changeset per public-surface PR** (`@nexus_ds/core` / `@nexus_ds/react` are published). Adding an export (`apcaLc`, registry, `ShadeAnchor`), expanding a public union (B0 enums), or changing emitted token values needs a `.changeset/*.md` (minor, pre-1.0). Phases 1, 2, B0, and 3 each ship one; Phase 4 if any emitted value/export moves.

## Phase map

| Phase | PR                                    | Deletes anything?        | Gate                                                                            |
| ----- | ------------------------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| 0     | contrast-split (pre-written plan)     | no                       | that plan's own gates                                                           |
| 1     | instruments (purely additive)         | no                       | old parity green AND new registry/ladder/explorer green                         |
| 2     | adjudication + #639                   | no (engine value fixes)  | design sign-off; old parity updated + green                                     |
| 3     | PR A — generator cutover              | no (generator retargets) | compile regression + freshness gate + value-normalized diff vs Phase-2 snapshot |
| 4     | B0 → B-ci → B-docs → B-del (four PRs) | **yes** (B-del)          | full unit + storybook + build-storybook + docs `next build`                     |
| 5     | post-cutover hardening                | no                       | docs CI job + ownership lint                                                    |

---

## Phase 0 — Land the contrast-split PR

Execute `docs/superpowers/plans/2026-07-09-split-light-dark-contrast.md` end to end: flat `lightContrast`/`darkContrast` state, engine input `contrast: {light, dark}`, `SNAPSHOT_VERSION` 3→4, dual sliders, appearance stories.

**Why first:** every later engine invocation goes through `createNexusThemeContract`, which absorbs the contrast shape change — landing this first rebase-proofs Phases 1–4. Its tone-parity/fixture edits are throwaway (deleted in Phase 4); its isolation guard, appearance tests, stories, and Storybook globals all survive.

- [ ] Execute that plan's Tasks 1–6 and merge.
- [ ] **Gate:** `pnpm test:unit && pnpm test:storybook && pnpm build-storybook` green.

---

## Phase 1 — Instruments (additive; zero deletions)

Build every replacement while the old net still guards. At the end of this phase the repo holds BOTH systems, both green.

### Task 1.1 — Export `apcaLc` from core

**Files:**

- Modify: `packages/core/src/lib/apca.ts` (export if not already), `packages/core/src/index.ts`, `packages/core/scripts/audit-runtime-exports.mjs` (`EXPECTED_RUNTIME_EXPORTS` allowlist, `:10-44`)

**Interfaces:**

- Produces: `apcaLc(fg: string, bg: string): number` on the public core entry (alongside `deriveTheme`, `themeToCss`, `TIER_THRESHOLDS`).
- Consumed by: Task 1.5 (explorer story annotations).

- [ ] **Step 1:** Verified (2026-07-09): `apcaLc(foreground: string, background: string): number` is already exported at `apca.ts:22` — no source change needed there.
- [ ] **Step 2:** Re-export from `packages/core/src/index.ts`, and add `'apcaLc'` to `EXPECTED_RUNTIME_EXPORTS` in `audit-runtime-exports.mjs` (alphabetical position) — the allowlist otherwise fails this task's own verify step (CI runs it at `ci.yml:291`).
- [ ] **Step 3:** Verify: `pnpm --filter @nexus_ds/core typecheck && pnpm --filter @nexus_ds/core build && node packages/core/scripts/../scripts/audit-runtime-exports.mjs` (or the package's `audit:runtime-exports` script) — the new export appears in `dist/runtime`.
- [ ] **Step 4:** Commit: `feat(core): export apcaLc for token instrumentation`.

### Task 1.2 — Extract `surface-ladder.ts` (verbatim move; parity is the proof)

**Files:**

- Create: `packages/core/src/lib/surface-ladder.ts`
- Modify: `packages/core/src/lib/derive-theme.ts` (delete the moved blocks, import instead)

**Interfaces:**

- Produces: `SURFACE_TOKENS`, `SurfaceToken`, `SurfaceSteps`, `LIGHT_SURFACE_STEPS`, `DARK_SURFACE_STEPS`, `SURFACE_TONE` — exact same names and types, new home.
- Consumed by: `derive-theme.ts` (immediately), Task 1.3 (reformat), Task 2.2 (adjudication edits).

- [ ] **Step 1:** Move **verbatim** from `derive-theme.ts` into `surface-ladder.ts`: the `SURFACE_TOKENS` const + `SurfaceToken`/`SurfaceSteps` types (`derive-theme.ts:104-128`), `LIGHT_SURFACE_STEPS` + `DARK_SURFACE_STEPS` (`:135-175`), `SURFACE_TONE` (`:55-64`). Also move `STATUS_RAMP`, `CHART_LIGHT`, `CHART_DARK`, `NEUTRAL` if the import graph stays acyclic (shared types: `import type { Mode } from './derive-theme'` in the new module is fine — type-only imports are erased at compile, so no runtime cycle; do NOT over-engineer a separate types module).
- [ ] **Step 2:** `derive-theme.ts` imports everything from `./surface-ladder`. No value changes — this task is a pure move.
- [ ] **Step 3:** Verify (the entire point): `pnpm test:unit` — tone-parity, static-parity, and key-parity all stay green, proving output identity.
- [ ] **Step 4:** Commit: `refactor(core): extract surface ladder and ramps into surface-ladder.ts`.

### Task 1.3 — Shade-anchored authoring format (with honest drift gate)

**Files:**

- Modify: `packages/core/src/lib/surface-ladder.ts`
- Create: `packages/core/src/lib/surface-ladder.test.ts`

**Interfaces:**

- Produces:
  ```ts
  export type ShadeAnchor =
    | number // palette shade at contrast 60: 50, 75, 100, 150, 900, 950…
    | 'base' // the mode's anchor surface (light: PAGE_L_LIGHT; dark: bg seed)
    | { step: number }; // raw Δ-unit escape for tokens with no clean shade equivalent
  export const LIGHT_SURFACE_LADDER: Record<SurfaceToken, ShadeAnchor>;
  export const DARK_SURFACE_LADDER: Record<SurfaceToken, ShadeAnchor>;
  export function anchorToStep(
    anchor: ShadeAnchor,
    mode: Mode,
    surfaceTone: NexusSurfaceTone,
    contrast?: number
  ): number;
  ```
- Consumed by: `deriveSurfaces` (via `anchorToStep`), designers (this file IS the editing surface — `'background-hover': 50 → 100` is the whole gesture).

- [ ] **Step 1 (test first):** Write `surface-ladder.test.ts` — a golden test capturing the Task-1.2 numeric tables, then asserting for every `SurfaceToken` × mode: `anchorToStep(NEW_LADDER[token], mode)` equals the old step within OKLCH-rounding epsilon. Run it against a draft ladder; **its failure output tells you exactly which tokens have no clean shade equivalent.**
- [ ] **Step 2:** Author the ladders: shade anchors where the palette L matches (the light steps were reverse-engineered from near-white primitives — most will map cleanly); `{ step }` escape for the rest (e.g. deep border-active values). `anchorToStep` derives Δ-units from the palette L at contrast 60 (`(anchorL - shadeL) / surfaceDeltaAt60`), so the engine's contrast scaling is untouched.
- [ ] **Verified reality (2026-07-09) — light reformats, dark does not.** `deriveSurfaces` anchors LIGHT at `PAGE_L_LIGHT` (1.0, tone-invariant), so light muted = `1.0 + (−1.38)·δ` = L 0.9227 = `stone.150` — the light ladder shade-anchors faithfully across all five tones. DARK anchors at the per-tone bg-seed L (`derive-theme.ts:187`); current dark values don't sit on shade gridlines (stone dark muted ≈ L 0.235 vs `stone.900` = L 0.207), and one shared step maps to a different absolute L per tone. Hence the `surfaceTone` + `contrast` params, and hence the dark ladder is **not** a faithful reformat.
- [ ] **Step 3 (decision branch):**
  - LIGHT ladder identical → adopt shade anchors. Commit: `refactor(core): author light surface ladder as shade anchors`.
  - DARK ladder → keep `{ step }` (annotate each with its nearest shade for readability) OR adopt absolute per-tone shade targets as an **adjudicated model change folded into #639** (we are retuning the dark shell there anyway). Never ship silent drift.
- [ ] **Step 4:** Add the reserved (unbuilt) exception shape as a typed comment block in the file: `SURFACE_STEP_OVERRIDES: Partial<Record<NexusSurfaceTone, Partial<Record<Mode, Partial<Record<SurfaceToken, ShadeAnchor>>>>>>` applied at the single step-read site in `deriveSurfaces` — the sanctioned future path for a per-tone exception (historical need: 2 in ~790 decisions).
- [ ] **Step 5:** Verify: `pnpm test:unit` (old parity still green). Commit.

### Task 1.4 — Token registry + engine-self-parity test (TDD; the failure output writes the registry)

**Files:**

- Create: `packages/core/src/lib/token-registry.ts`, `packages/core/src/lib/token-registry.test.ts`
- Modify: `packages/core/src/index.ts` (export)

**Interfaces:**

- Produces:
  ```ts
  export type TokenCategory =
    | 'surface'
    | 'text'
    | 'border'
    | 'brand'
    | 'status'
    | 'chart'
    | 'focus'
    | 'alpha';
  export interface SemanticTokenMeta {
    name: string; // bare, no prefix: 'nav-background'
    category: TokenCategory;
    description?: string; // migrate the 2 existing $description strings from base JSON
  }
  export const SEMANTIC_TOKEN_REGISTRY: readonly SemanticTokenMeta[];
  ```
- Consumed by: docs/explorer (display), Task 5.2 (allowed-token lint). Replaces the JSON key-parity oracle.

- [ ] **Step 1 (test first — this is what makes the registry impossible to get wrong):**

  ```ts
  import { describe, expect, it } from 'vitest';
  import {
    createNexusThemeContract,
    DEFAULT_NEXUS_APPEARANCE,
  } from './appearance-model';
  import { deriveTheme } from './derive-theme';
  import { SEMANTIC_TOKEN_REGISTRY } from './token-registry';

  const names = (map: Record<string, string>) =>
    Object.keys(map)
      .map((k) => k.replace('--nx-color-', ''))
      .sort();

  describe('semantic token registry', () => {
    it('set-equals the engine emission, both modes', () => {
      const theme = deriveTheme(
        createNexusThemeContract(DEFAULT_NEXUS_APPEARANCE)
      );
      expect(SEMANTIC_TOKEN_REGISTRY.map((t) => t.name).sort()).toEqual(
        names(theme.light)
      );
      expect(names(theme.dark)).toEqual(names(theme.light));
    });
  });
  ```

- [ ] **Step 2:** Run with an empty registry → the diff prints all ~106 emitted names. Fill the registry FROM that output, categorizing each. Migrate the two `$description` strings (e.g. `base-stone-dark.json:29,34`) before the JSON dies in Phase 4.
- [ ] **Step 3 (YAGNI line):** no `modes` field (emission sets are identical per mode — the test pins it), no guidance prose, no deprecation fields.
- [ ] **Step 4:** Add `'SEMANTIC_TOKEN_REGISTRY'` to `EXPECTED_RUNTIME_EXPORTS` in `audit-runtime-exports.mjs` (same allowlist trap as Task 1.1).
- [ ] **Step 5:** Verify: `pnpm test:unit && pnpm --filter @nexus_ds/core audit:runtime-exports`. Commit: `feat(core): engine-derived semantic token registry with self-parity test`.

### Task 1.5 — SurfaceLadder explorer story (the #639 decision instrument)

**Files:**

- Create: `packages/react/src/stories/SurfaceLadder.stories.tsx`

**Interfaces:**

- Consumes: `apcaLc`, `TIER_THRESHOLDS`, `SEMANTIC_TOKEN_REGISTRY` (from core); `useRuntimeTokenValues` (`packages/react/src/stories/support/runtime-token-values.ts:12-27`); the swatch idiom from `Radius.stories.tsx` / `Shadow.stories.tsx`; Phase 0's dual contrast sliders (`NexusAppearanceSettings`).
- Produces: the visual review surface used by Phase 2 sign-offs and every future engine PR's before/after screenshots.

- [ ] **Step 1:** Build the story: registry `surface`-category tokens in rung order (page → muted/nav → popover/control), each swatch showing token name, live OKLCH string (from `useRuntimeTokenValues`), and parsed L.
- [ ] **Step 2:** On each surface render body + muted sample text with a live `apcaLc` Lc badge, colored pass/fail against `TIER_THRESHOLDS`.
- [ ] **Step 3:** Embed `NexusAppearanceSettings` (or just its two contrast sliders) so tone / mode / lightContrast / darkContrast scrub the whole grid live. **Do NOT wrap this story in its own provider:** `.storybook/preview.tsx:222-226` already wraps every story in a CONTROLLED `NexusAppearanceProvider` (`state=` + `onStateChange` → `updateGlobals`, `storageKey={false}`) — embedding settings inside the global provider round-trips through Storybook globals, so the entire canvas (and any other open story) updates. A story-local provider would silo the sliders from the swatches.
- [ ] **Step 4:** Verify: `pnpm test:storybook` (renders, a11y green). Commit: `feat(react): SurfaceLadder token explorer story`.

### Task 1.6 — Matrix snapshot infrastructure (the value oracle Phases 2–4 lean on)

**Files:**

- Create: `packages/core/scripts/generate-engine-snapshot.mjs`, the snapshot fixture (e.g. `packages/core/src/lib/engine-snapshot.fixture.json`), `packages/core/src/lib/engine-snapshot.test.ts`

**Interfaces:**

- Produces: the frozen **matrix snapshot** — 5 tones × 2 modes at production defaults (`createNexusThemeContract({...DEFAULT_NEXUS_APPEARANCE, surfaceTone: tone})`); tone-varying tokens (~30) stored per tone, tone-invariant block (status/chart/primary/secondary, ~76) stored once; values as structured `{ l, c, h, alpha }` so a chroma-only change diffs differently from a lightness change.
- Consumed by: Phase 2 (every adjudication fix reviews its snapshot diff), Phase 3 (the value-normalized floor gate), Phase 4 (replaces `light-tone.fixture.json`). Coexists with the old fixture until Phase 4.

- [ ] **Step 1:** Write the generator (dynamic-import `dist/runtime`, `generate-light-fixture.mjs:51` pattern) and generate the initial fixture.
- [ ] **Step 2:** Change-detector test: engine output at the matrix inputs `toEqual`s the fixture; regeneration is a deliberate `node` run, reviewed as a diff.
- [ ] **Step 3:** Verify: `pnpm test:unit`. Commit: `feat(core): frozen engine matrix snapshot`.

**Phase 1 gate:** `pnpm test:unit && pnpm test:storybook` — old parity net AND registry/ladder/snapshot/explorer green simultaneously.

---

## Phase 2 — Value adjudication + #639 (design decisions, not mechanics)

The producers disagree in six groups. A human picks the right value for each; every fix is a normal engine PR with the old oracles still guarding (update fixtures/tolerances as part of each fix). **Deleting before adjudicating would silently canonize at least one bug.**

### Task 2.1 — Divergence diff script (temporary instrument)

**Files:**

- Create: `packages/core/scripts/diff-curated-vs-engine.mjs` (deleted at the end of Phase 2)

- [ ] **Step 1:** Resolve curated semantic JSON → concrete OKLCH (reuse `token-parity-utils.ts` resolvers while they exist). Run the **built** engine over the production matrix: `createNexusThemeContract({...DEFAULT_NEXUS_APPEARANCE, surfaceTone: tone})` for all 5 tones × 2 modes (dynamic-import `dist/runtime`, same pattern as `generate-light-fixture.mjs:51`).
- [ ] **Step 2:** Print `token | tone | mode | curated | engine | ΔL` for every mismatch. Paste the table into the Phase 2 PR description — it is the adjudication worksheet.

### Task 2.2 — Adjudicate the six divergence groups

Each row: decide → fix the engine (or record "engine is right") → old oracles updated → snapshot regenerated. Commit per group: `fix(core): adjudicate <group>`.

| #   | Divergence                                                                                              | Evidence                                                                                                | Default recommendation                                              |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Light `chart-categorical-2` = `green.700`, identical to `success-subtle-foreground`; curated `lime.700` | `CHART_LIGHT` (`derive-theme.ts:452-458`); parity test codified the bug (`tone-parity.test.ts:341-353`) | **Fix to `lime.700`** — near-certain transcription error            |
| 2   | `warning-background` light: engine `orange.700` vs curated `orange.600`                                 | `deriveStatus` override (`derive-theme.ts:443-447`)                                                     | Design picks the shade; align both                                  |
| 3   | `focus-default`: curated `{primary.subtle-foreground}` (#0a0a0a) vs engine mid-gray                     | `deriveFocus` (`derive-theme.ts:527-530`)                                                               | Decide the focus-ring policy                                        |
| 4   | `primary-background-active` light: engine lightens past hover; curated darkens to `neutral.950`         | `towardMid` (`derive-theme.ts:575-576`)                                                                 | Decide the press direction (curated darkening matches convention)   |
| 5   | `primary-background` dark: engine lift `oklch(0.9104 0 0)` vs curated `white.base`                      | dark lift (`derive-theme.ts:555-571`)                                                                   | Decide                                                              |
| 6   | Text inks: engine opaque tone-tinted vs curated translucent `{black.a600}`                              | `quietText` (`derive-theme.ts:218-243`)                                                                 | Decide the ink model (opaque = engine's APCA-by-construction story) |

- [ ] Adjudicate all six + any shade-anchor drift deferred from Task 1.3. Each fix: `pnpm test:unit` green, snapshot diff shows only the intended tokens, explorer screenshot in the PR.

### Task 2.3 — #639 dark-contrast default

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts` (`DEFAULT_NEXUS_APPEARANCE.darkContrast`)

- [ ] **Step 1:** Scrub `darkContrast` in the explorer against the calibrated dark shell; capture screenshots; get design sign-off on issue #639.
- [ ] **Step 2:** Set the approved default; regenerate committed CSS (still JSON-fed generators — fine) + snapshot. Verify: `pnpm test:unit`, APCA sweep green at the new default. Commit: `feat(core): calibrated dark contrast default (closes #639)`.
- [ ] **Step 3 — bump `SNAPSHOT_VERSION` 4 → 5** (once, in the final Phase-2 PR): adjudication + the new dark default change `themeCss` semantics, and the first-paint bootstrap paints a STORED snapshot's `themeCss` whenever versions match (`appearance-snapshot.ts:224`) — without the bump, every dev's stale v4 snapshot first-paints pre-adjudication colors after deploy. Same invalidation rationale as the contrast PR's 3→4 bump.

**Phase 2 gate:** the color canon is now **design-approved, not accidental**. Old oracles green. Delete `diff-curated-vs-engine.mjs`.

---

## Phase 3 — Generator cutover (PR A; packages/ only)

The generator stops reading semantic color JSON and bakes the engine floor instead. **No deletions** — JSON still exists, old parity still compares it against the same engine, everything stays green. After Phase 2, resolved token **values** must match the Phase-2 snapshot — fallback-form churn across every semantic line is expected and not gated (see Task 3.2 Step 3's value-normalized gate); unexplained _value_ movement is a bug in this phase.

### Task 3.1 — Engine-injection API for the generator

**Files:**

- Modify: `packages/core/scripts/generate-tailwind-package.js` (signature + CLI entry `:714-732`)

**Interfaces:**

- Produces: `generateTailwindPackage(config, { distDir = DEFAULT_DIST_DIR, engine } = {})` — the existing second arg is an **options object** `{ distDir }` (verified `:581`; callers `export.mjs:820`, `test:195`), so **add `engine` to that object, do not replace it**. `engine = { deriveTheme, createNexusThemeContract, DEFAULT_NEXUS_APPEARANCE }`, resolved by the CLI; tests inject the src-aliased engine.
- Consumers: CLI entry (lazily imports `dist/runtime`, `pathToFileURL` pattern from `generate-light-fixture.mjs:51`); unit tests pass the `@nexus_ds/core`-aliased engine (compiled from src via `vitest.config.ts:9-12`) so `test-unit` stays build-free; `export.mjs` (`:815-820`) passes the same shape in Phase 4.

- [ ] **Step 1:** Thread the parameter; CLI resolves and imports dist, tests inject src-alias. Do **not** copy `generate-light-fixture.mjs`'s self-`execFileSync` build (`:46-49`) — it hides the dependency from turbo and would make unit tests spawn builds.
- [ ] **Step 2:** Verify: `pnpm --filter @nexus_ds/core build && pnpm tokens:tailwind` succeeds; `pnpm test:unit` (generator tests) green without a prior build. Commit: `refactor(core): inject engine into tailwind generator`.

### Task 3.2 — Emit semantic color fallbacks from the engine floor

**Files:**

- Modify: `generate-tailwind-package.js` (the `@theme inline` semantic-color emission), helpers in `utils.js` as needed

- [ ] **Step 1:** Replace the semantic-JSON walk with one engine run at the production default. **The emission surface is THREE sites in `utils.js` (Codex finding — swapping only one leaves JSON a live producer at the other two):**
  1. `@theme inline` semantic block (`utils.js:1987-1996`) — fallback inlined into utilities → feed `theme.light` values;
  2. `:root` RUNTIME COLOR ALIASES block (`utils.js:1998-2005`, `--color-X: var(--nx-color-X, <value>)`) → feed `theme.light` values;
  3. `.dark` override block (`utils.js:2008-2017`, emits `--nx-color-X: <value>` — this is how static dark paints without JS) → feed `theme.dark` values.
  ```css
  /* before */
  --color-background: var(--nx-color-background, var(--nx-color-white-base));
  /* after  */
  --color-background: var(
    --nx-color-background,
    oklch(1 0 0)
  ); /* engine floor (light) */
  /* .dark  */
  --nx-color-background: oklch(0.2161 0.004 70); /* engine floor (dark) */
  ```
  `deriveTheme` returns `{light, dark}` — a natural fit: `.light` → sites 1+2, `.dark` → site 3. **Scope (corrected):** this cutover is `packages/tailwind` ONLY. `generate-modular.js` shares the utils.js _collector_ but owns its own call sites (`collectSemanticColorTokensVarRef` at `:260-268, :278`) and its `generateThemedCSS` loop (`:458-464`) — it stays JSON-fed until docs migrates off it (PR B-docs) and Task 4.4 deletes it. The Phase 3→4 window therefore has a bounded, expected divergence: docs (modular, JSON-fed) vs everything else (tailwind, engine floor) differ in fallback FORM but — post-Phase-2 adjudication — not meaningfully in resolved values. **Simplification (verified):** the feeding arrays are color-only BY CONSTRUCTION — `lightSemanticTokens`/`darkSemanticTokens` are filled by `collectSemanticColorTokensVarRef` and dimension leaves split into a separate `dimensionTokens` accumulator (`generate-tailwind-package.js:452-463` + comment) — so the swap replaces the collectors' output wholesale; no partitioning needed, and the dimension path (`--focus-offset`) is untouched by construction.
- [ ] **Step 1b — `config.base` threading + validation move HERE (not Phase 4):** the color walk this step removes is also what today selects and validates the `base` axis (`getSemanticFiles`, `generate-tailwind-package.js:593`). In the same change: validate `config.base` against `BASE_TONE_OPTIONS` values and thread it as `surfaceTone` into the engine contract (`createNexusThemeContract({...DEFAULT_NEXUS_APPEARANCE, surfaceTone: config.base})`) — tone names are identical to `base` values. Rebaseline the missing-base-mode test (`generate-tailwind-package.test.js:1245`, currently expects the `getSemanticFiles` error string) to the new validation error. Without this, `--base` (used by `pnpm export`) either still demands JSON or silently produces stone during the Phase 3→4 window.
- [ ] **Step 2:** Record the accepted semantics change in the PR: fallbacks are now resolved literals, so overriding `--nx-*` primitives no longer moves semantic fallbacks (acceptable pre-production; `variables.css`'s color section remains as engine input + primitive utilities).
- [ ] **Step 3:** Diff gate — **value-normalized, not line-diff:** the fallback-form churn (`var(--nx-color-white-base)` → `oklch(1 0 0)`) touches every semantic color line by design and is NOT adjudication-gated. The gate: resolve each token's OLD fallback (via its `variables.css` primitive) and NEW literal to concrete values and compare — only **resolved-value movement** must trace to a Phase 2 adjudication decision. Practically: the Phase-2-end matrix snapshot is the value reference; the Phase 3 floor must match it. Unexplained value movement = stop and investigate.

### Task 3.3 — Fix `border-color-aliases` + compile-level regression

**Files:**

- Modify: `utils.js` (`generateBorderColorAliasUtilitiesCSS`), regenerated `packages/tailwind/border-color-aliases.css`
- Test: extend `generate-tailwind-package.test.js` (real `tailwindcss.compile()` harness already exists, `:6`)

- [ ] **Step 1:** Emit the runtime chain `border-color: var(--nx-color-border-default, <engine floor>)` instead of the dangling `var(--color-border-default)` (never declared at runtime — resolves to `currentColor` today; consumers: `card.tsx:44`, `accordion.tsx:71`).
- [ ] **Step 2 (regression):**
  ```js
  it('emits no dangling --color-* references in compiled utilities', async () => {
    const css = await compileFixture();
    expect(css).not.toMatch(/var\(--color-/);
  });
  ```
- [ ] **Step 3:** Verify + commit: `fix(core): emit border-color aliases against the runtime variable chain`.

### Task 3.4 — Preserve the `--focus-offset` dimension

**Files:**

- Modify: `tokens/semantic/focus.json` (color leaves become engine-owned in Phase 4; the `focus.offset` 2px dimension survives)

- [ ] Confirm `generateRootDimensionsCSS` (`generate-tailwind-package.js:466-475`, issue #506 path) still emits `--focus-offset` after the color emission moves — it is consumed live by `outline-offset-(--focus-offset)` utilities. Add a generator assertion if none exists.

### Task 3.5 — Turbo wiring (and keep the publish path clean)

**Files:**

- Modify: `turbo.json`

- [ ] ```jsonc
      "build:tailwind": { "dependsOn": ["build"], "outputs": ["dist/tailwind/**"] }
      ```
  Generator stays **out of** core's `build` script — `release.yml` runs `turbo build && changeset publish` and `@nexus_ds/core` ships only `dist/runtime`; token generation must not enter the publish path. Closes the standing note in `packages/react/package.json:8` (issue #66).

### Task 3.6 — CI `audit-tokens`: build the engine before regenerating

**Files:**

- Modify: `.github/workflows/ci.yml` (`audit-tokens` job `:340-392`)

- [ ] **Step 1:** Add `pnpm --filter @nexus_ds/core build` before the regen step (`:374`) — precedent at `:436-439` (test-react does exactly this).
- [ ] **Step 2:** The freshness gate already exists (`:377-392`) — **retarget, don't add.** Prune dead pathspecs (`apps/console/public/themes`, `apps/console/src/styles` don't exist). Leave `tokens:modular` removal to Phase 4.

### Task 3.7 — Regenerate, freeze the matrix snapshot, rebaseline

**Files:**

- Regenerate + commit: `packages/tailwind/{nexus.css, variables.css, border-color-aliases.css}`
- Regenerate: the matrix snapshot fixture (infrastructure created in Task 1.6)
- Modify: `generate-tailwind-package.test.js`, `semantic-shape.test.js` (rebaseline exact-value assertions)

- [ ] **Step 1:** Regenerate committed CSS; structural fallback-form churn is expected across all semantic lines — resolved VALUES must match the Phase-2 snapshot, per Task 3.2's value-normalized gate.
- [ ] **Step 2:** Regenerate the matrix snapshot (infrastructure from Task 1.6) and confirm it is **unchanged** vs its Phase-2-end state — the generator cutover changes where static CSS comes from, not what the engine emits; any snapshot movement here is a Phase 3 bug.
- [ ] **Step 3:** Change-detector test: engine output at the matrix inputs `toEqual`s the snapshot. Regeneration is deliberate (`node generate-engine-snapshot.mjs`), reviewed as a diff.
- [ ] **Step 4:** Verify: `pnpm test:unit` (old parity STILL green — JSON present, same engine), compile regression green, `pnpm export:verify` still passes. Commit: `feat(core): bake engine floor into generated CSS + freeze matrix snapshot`.

**Phase 3 gate:** static CSS is engine-generated; freshness gate proves it; both oracles (old parity + new snapshot) green side by side.

---

## Phase 4 — Deletions + docs migration

**Restructured after Codex review (Finding 5) — split into FOUR PRs, in this order:**

1. **PR B0 — enums** (Task B0). Precursor; no deletions.
2. **PR B-ci — docs CI job** (Task 5.1, pulled forward). Adds a docs `next build`+typecheck job so the standalone docs PR is actually validated — a docs-only PR otherwise skips build/typecheck (`ci.yml:36,78-86`).
3. **PR B-docs — docs migration** (Task 4.6). Docs adopts the provider; link-swap components deleted. `public/themes/*` + `generate-modular.js` still exist but are now unreferenced.
4. **PR B-del — deletions** (Tasks 4.1–4.5, 4.7); touches `packages/` so the CI filter fires. The "same commit" rule (Task 4.3) applies inside this PR.

**Why this order (not the reverse):** `generate-modular.js` feeds docs' static themes from the _same semantic JSON_ being deleted — so **docs must migrate off that path before the JSON can be removed.** Docs deserves its own PR regardless: CSP + first-paint + RSC is a distinct risk surface that should not be reviewed inside a 15-file deletion.

### Task B0 — Extend core mode enums (precursor PR; user-locked decision)

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts` (unions `:11-14`, OPTIONS tables `:78-102`, sanitizer Sets `:165-176`), `packages/react/.../appearance-settings.tsx` (options render from the tables), tests

- [ ] **Step 1:**
  ```ts
  export type NexusDensity =
    | 'tight'
    | 'compact'
    | 'default'
    | 'comfortable'
    | 'relaxed'
    | 'spacious'; // 4→6
  export type NexusCorners =
    | 'square'
    | 'subtle'
    | 'smooth'
    | 'round'
    | 'extra-round'; // 4→5
  export type NexusElevation =
    | 'flat'
    | 'quiet'
    | 'soft'
    | 'standard'
    | 'strong'; // 3→5
  ```
  **Ordering (verified 2026-07-09):** do NOT copy `theme-modes.ts` — its arrays are arbitrary display order, not a ladder (spacing lists `tight, relaxed, default, compact…`; borderwidth lists `normal, fine, strong`), and the spacing JSON confirms there is no single-key intensity ranking (`spacing-4` = 16/14/16/16/18/16 across the six modes — modes differ on different steps). Union order is functionally irrelevant in TS; only the OPTIONS-array order matters, as UI display order — choose the deliberate density reading `tight → compact → default → comfortable → relaxed → spacious` (and `flat → quiet → soft → standard → strong`, `square → subtle → smooth → round → extra-round`). The `[data-*]` CSS blocks already exist in `nexus.css` for every added value; this PR only makes them reachable from appearance state.
- [ ] **Step 2:** Update OPTIONS arrays + sanitizer Sets + UI options (Storybook `pickOption` follows the tables automatically). Verify: `pnpm test:unit && pnpm test:storybook`. Commit: `feat(core): expose full shipped density/elevation/corner modes`. **This is the first of the four Phase-4 PRs — merge before B-ci / B-docs / B-del.**

### Task 4.1 — Delete the semantic color JSON

- [ ] Delete `tokens/semantic/base-{stone,neutral,zinc,slate,gray}-{light,dark}.json` (10), `theme-default-{light,dark}.json`, `chart-categorical-default-{light,dark}.json`. **Shrink** `focus.json` to dimension-only (`focus.offset` survives — Task 3.4). `color.json` primitives and every non-color semantic file remain.
- [ ] **Config-axis cleanup** (`DEFAULT_CONFIG`, `utils.js:233-243` + `allowedKeys`, `generate-tailwind-package.js:716-728`): drop `'chart-categorical'` (dead since Phase 3 — engine owns chart colors); keep `'focus'` (still selects the PRIMITIVES focus files feeding `variables.css`). The `'base' → surfaceTone` threading + validation already landed in Phase 3 (Task 3.2 Step 1b) — nothing to do for `base` here beyond deleting the files.

### Task 4.2 — Delete the reconciliation net

- [ ] Delete `derive-theme.parity.test.ts`, `derive-theme.static-parity.test.ts`, `tone-parity.test.ts`, `light-tone.fixture.json`, `generate-light-fixture.mjs`, `token-parity-utils.ts`. The color test surface is now: matrix snapshot (3.7) + registry self-parity (1.4) + isolation guard (Phase 0) + APCA sweep (4.3).

### Task 4.3 — Retarget APCA into the vitest sweep — **SAME COMMIT as 4.1/4.2**

**Files:**

- Create: `packages/core/src/lib/apca-pairs.ts` (the ONE pair table)
- Modify: `derive-theme.test.ts` (sweep `:951-1021` consumes the shared table)
- Delete: `packages/core/scripts/audit-contrast.js`; point CI's `APCA contrast audit` step (`ci.yml:394-397`) at a vitest filter

- [ ] **Step 1:** Export the pair table once — today the audit's `BASE_PAIRS` and the sweep's `BASE_CONTRAST_CHECKS` are two hand-synced copies (the same dual-truth disease at pair level):
  ```ts
  export interface ApcaPair {
    fg: string;
    bg: string;
    tier: 'body' | 'ui' | 'incidental';
  }
  export const APCA_PAIRS: readonly ApcaPair[] = [
    /* union of the sweep's checks + the script's pairs */
  ];
  ```
- [ ] **Step 2:** Add the two pair groups the sweep lacks: error-text-on-neutral (`audit-contrast.js:76-87`) and the 7 focus surfaces (`FOCUS_SURFACES` `:199-219`).
- [ ] **Step 2.5 (rehome tested helpers — Codex Finding 3):** `audit-contrast.js` exports `blendAlphaOver` (`:237`), `resolveToSrgbInts` (`:247`), `formatLine` (`:329`), all unit-tested in `__tests__/audit-contrast.test.js` (added in #256). Move `blendAlphaOver` + `resolveToSrgbInts` (and their tests) into `apca.ts` / `apca-pairs.ts` — the alpha-token pairs (`background-hover-alpha`, `popover-alpha`, `overlay`, `popover-backdrop`) need alpha compositing against a surface before `apcaLc`. Keep `formatLine` only if the explorer reuses its Lc readout, else drop it with its test.
- [ ] **Step 3:** Delete the script; update **both** script entries — `packages/core/package.json:41` and root `package.json:27` (`audit:contrast` → the vitest filter) — plus the CI step name. `audit-colorblind.js` is untouched (reads `color.json` primitives only, `:262`).
- [ ] **WHY same commit:** `audit-contrast.js:411-413` silently `continue`s on missing files — deletion in one commit + retarget in another leaves a window where CI is green while auditing nothing.

### Task 4.4 — Delete the modular / docs-swap static path

- [ ] Delete `generate-modular.js` (+ its test), `sync-docs-themes.js`, `apps/docs/public/themes/*`. Remove: root `tokens:modular` script, `turbo.json` `build:tokens:modular` (`:15-18`), `Makefile:51-53` tokens target, `apps/docs/package.json:11` `gen:themes`. Update stale docs: `RTK.md:56`, `packages/core/README.md:130,137`.

### Task 4.5 — Rework `export.mjs` (fork tool)

**Files:**

- Modify: `scripts/export.mjs`, `scripts/export.test.js`; verify `scripts/verify-export.mjs`

- [ ] **Step 1:** `discoverTokenChoices.base` sources from `BASE_TONE_OPTIONS` (`appearance-model.ts:40-50`) instead of scanning deleted `base-*.json` (`export.mjs:91-143`; empty scan currently degrades to "unconstrained" silently — `:150-160`).
- [ ] **Step 2:** Map the fork's latent `brand` axis → engine `brandColor` (`--brandColor=<hex>`); it validates against nothing today, and engine-as-truth finally makes it real. Concretely: add `'brandColor'` to the generator CLI's `allowedKeys` (`generate-tailwind-package.js:717-727`) and thread `config.brandColor → brandColor` into the engine contract — the `config.base → surfaceTone` threading + validation already landed in Phase 3 (Task 3.2 Step 1b). Export builds core before generating.
- [ ] **Step 3:** Rewrite `export.test.js` discovery fixtures (`:405-434`). Verify: `pnpm export && pnpm export:verify`.

### Task 4.6 — Migrate docs onto the provider

**Files:**

- Modify: `apps/docs/app/layout.tsx`, `apps/docs/theme-csp.ts`, `apps/docs/scripts/audit-csp-inventory.mjs`, `_components/ThemePicker.tsx`, `_components/LiveThemeSwapper.tsx`
- Delete: `_components/ThemeBootstrap.tsx`, `_lib/theme-bootstrap-script.ts`, `_lib/theme-modes.ts` (+ their tests), `_hooks/use-dark-mode.ts`

- [ ] **Step 1:** Root layout adopts the **console pattern** (`apps/console/src/main.tsx:28`, `appearance-config.ts`): `NexusAppearanceScript` with a static default snapshot + a docs `storageKey` (NOT the appearance-ssr fixture's per-request cookie + `force-dynamic` pattern — that would force the prerendered site dynamic), then `NexusAppearanceProvider` with `defaultState: { ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' }` — preserving the OS-dark first paint `theme-bootstrap-script.ts:73-78` gives today. Verified import path: `import { NexusAppearanceScript } from '@nexus_ds/react/appearance/server'` — a dedicated server-safe entry (`package.json` exports → `dist/appearance-server.mjs`; `provider/server.ts` re-exports `NexusAppearanceScript` + `createNexusAppearanceScript`). Note: `createNexusAppearanceScript` returns a pre-configured React **component** (`script.tsx:47-60`), not a string — the CSP hash targets the string factory `createNexusAppearanceBootstrapScript(...)` from core (`appearance-snapshot.ts:216`), exactly as Step 2 specifies.
- [ ] **Step 2:** CSP: `theme-csp.ts:3-11` hashes the old inline script — hash the generated `createNexusAppearanceBootstrapScript(...)` string instead (deterministic with a static default snapshot); if anything per-request creeps in, switch to the `nonce` prop (`script.tsx:9-13`). Update `audit-csp-inventory.mjs:10-15`.
- [ ] **Step 3:** Rewrite `ThemePicker` / `LiveThemeSwapper` from `<link>` swapping (`ThemePicker.tsx:25-36`, `LiveThemeSwapper.tsx:24-30`) to `useNexusAppearance()` setters — B0 means density/elevation/corners now cover every mode docs demos. **Explicit naming map:** docs' `borderwidth` control (`ThemePicker.tsx:110`) → appearance `stroke` (the provider writes `state.stroke` to `data-borderwidth`, `appearance-snapshot.ts:197`); values are 1:1 (`fine`/`normal`/`strong`), so this is a rename, not a remodel.
- [ ] **Step 4:** Delete `use-dark-mode.ts` (`:22-26`) — a second `.dark` owner that fights the provider (`provider.tsx:331-339` re-asserts) — **and delete `_stores/use-theme-store.ts`** (Zustand persist store consumed only by ThemePicker + LiveThemeSwapper). Storage decision: **reset, no migration** (pre-production) — the old `DOCS_THEME_STORAGE_KEY` localStorage entry is simply orphaned; the provider's own `storageKey` takes over as docs' persistence.
- [ ] **Step 5:** Verify: `cd apps/docs && pnpm build` green; manual smoke — tone/mode/density switching works, no first-paint flash, CSP report clean.

### Task 4.7 — Update agent-facing docs (or they'll actively mislead)

- [ ] Rewrite `.claude/agents/contrast-auditor.md` (encodes `audit-contrast.js` internals + `base-*.json` filenames) for the vitest sweep + pair table. Fix `.claude/rules/components.md:180` (cites `tone-parity.test.ts` as the guard → matrix snapshot + APCA sweep). Update `scripts/audit-agent-drift.js:145-175` (base-_/brands-_ filename checks). Mirror `.claude` → `.codex`/`.agents` copies; run `pnpm audit:agent-drift`.

**Phase 4 gate:** `pnpm test:unit && pnpm test:storybook && pnpm build-storybook` green; docs `next build` green; `git grep` for `base-stone`, `tone-parity`, `token-parity-utils`, `public/themes`, `tokens:modular`, `light-tone.fixture`, `audit-contrast` returns only historical/plan-doc hits. **Every surviving color check guards untrusted input or hand-authored data — none reconcile a duplicate.**

---

## Phase 5 — Post-cutover hardening

### Task 5.1 — Docs build/typecheck CI job

> **Scheduled in Phase 4 as PR B-ci** (must land before the docs migration). Listed here for topical grouping.

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] Add a docs `next build` + typecheck job. Today a docs-only PR skips build/typecheck entirely (`packages` filter `:36,78-86`), and the filter's justifying comment (`:47-50` — "no app consumes @nexus_ds/react at runtime") is already false. This closes the blind spot the Phase 4 PR had to work around.
- [ ] **Wire it into enforcement (Codex finding):** branch protection requires only the `CI Status` aggregator (`ci.yml:17-20`), and the aggregator's own contract comment says every required job must appear in its `needs:` list (`:534-549`). Add the docs job to `ci-status.needs`, and if the job is path-filtered, add a docs path output to the `changes` job. Without this, the docs job can fail while the PR stays green.

### Task 5.2 — Component token-ownership lint + audit-and-fix

**Files:**

- Modify: `packages/core/scripts/audit-class-refs.js` (resolution target: `nexus.css` → the registry), `.claude/rules/components.md` (ownership table); components with wrong-family tokens

- [ ] **Step 1:** Retarget `audit-class-refs` to validate against `SEMANTIC_TOKEN_REGISTRY`; add a primitive-ban rule (component code must not reference `--nx-color-<primitive>` directly).
- [ ] **Step 2:** Audit-and-fix drift (fields → `container`, overlays → `popover`, nav → `nav-*`). This is a fix-pass, not a migration — 101 components already consume semantic utilities.
- [ ] **Step 3:** Document the ownership table in `components.md`. Honest limit: family-_ownership_ (is this div a card?) is a review-time rule, not a CI gate — the lint enforces only registry-membership + primitive ban.

---

## Cross-phase risk register (council-derived)

| Risk                        | Where it bites                                                                                           | Mitigation                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Silent APCA skip            | deletion and retarget in separate commits → green CI audits nothing                                      | 4.1+4.2+4.3 same commit                                                |
| Counterfactual seeds        | floor ≠ runtime → dark first-paint flash everywhere                                                      | production contract only (Global Constraints; 2.1, 3.2, 3.7)           |
| Bless-the-bug               | snapshot freezes `CHART_LIGHT[1]` green.700                                                              | adjudicate before freeze (2.2 → 3.7)                                   |
| Build-free CI jobs          | generator imports dist inside `test-unit` / `audit-tokens` with no build step                            | engine injected as parameter (3.1) + CI build step (3.6)               |
| Docs CI filter skip         | docs-only PR never builds/typechecks docs                                                                | B-ci docs job lands before B-docs; B-del touches `packages/` (Phase 4) |
| Publish-path leak           | token gen inside core `build` ships into the release flow                                                | generator stays out of `build`; turbo `dependsOn` instead (3.5)        |
| Docs axis loss              | provider's narrower enums stomp docs' demoed modes                                                       | B0 first (user-locked: extend enums)                                   |
| Shade-anchor drift          | reformat silently shifts values                                                                          | golden gate → drift becomes a Phase 2 decision (1.3)                   |
| Registry rot                | hand-written list drifts from emission                                                                   | self-parity test (1.4)                                                 |
| `--focus-offset` loss       | deleting focus.json kills a live dimension                                                               | dimension-only survival (3.4, 4.1)                                     |
| CSP break                   | provider bootstrap string ≠ hashed string                                                                | re-hash static script or nonce (4.6)                                   |
| Unexplained floor movement  | generator cutover changes values nobody decided                                                          | value-normalized diff gate vs the Phase-2 snapshot (3.2, 3.7)          |
| Partial emission swap       | only `@theme inline` fed from engine → `:root` aliases + `.dark` block still JSON-fed = duality survives | all THREE `utils.js` sites swapped together (3.2)                      |
| Export-allowlist trap       | new public exports fail `audit-runtime-exports`                                                          | allowlist updated in the same task (1.1, 1.4)                          |
| Unrequired docs job         | docs CI job exists but not in `ci-status.needs` → fails while PR stays green                             | aggregator wiring (5.1 / PR B-ci)                                      |
| Stale snapshot after retune | v4 snapshots first-paint pre-adjudication colors post-deploy                                             | `SNAPSHOT_VERSION` 4→5 in Phase 2 (2.3 Step 3)                         |
| Story-local provider silo   | explorer wrapped in own provider → sliders don't drive the canvas                                        | use the global controlled preview provider (1.5)                       |

## End-state verification (after Phase 5)

- [ ] `pnpm test:unit` — the color test surface is exactly: matrix snapshot, registry self-parity, per-mode isolation guard, APCA sweep. Zero reconciliation tests remain.
- [ ] `pnpm test:storybook && pnpm build-storybook`; `cd apps/docs && pnpm build`; `pnpm --filter @nexus_ds/core audit:colorblind`.
- [ ] `pnpm export && pnpm export:verify` — fork tool works with real `--base` and `--brandColor`.
- [ ] **Designer smoke test (the whole point):** change one shade in `surface-ladder.ts` → `pnpm --filter @nexus_ds/core build && node packages/core/scripts/generate-engine-snapshot.mjs && pnpm tokens:tailwind` → snapshot diff shows exactly that token across tones → explorer story confirms visually → the PR is one source line + one snapshot diff + screenshots.
- [ ] `git grep -l 'base-stone\|tone-parity\|public/themes\|tokens:modular\|light-tone.fixture\|audit-contrast'` → only historical docs/plans.
