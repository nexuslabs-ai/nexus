# #538 — React Storybook Cleanup + Standalone-Friendly Tooling (corrected plan)

> **Status:** Ready to execute **after a rebase onto current `main`** (see Correction 1 —
> #559 merged 2026-06-28 and changed two files this plan rewrites). Supersedes the
> Codex draft and reconciles it with the live issue #538 and the merged tree.
>
> **Corrections owned** (each verified against source on `main` @ `2b9315e`):
>
> 1. **STALE vs merged #559 (blocker).** PR #559 merged 2026-06-28 and rewrote the two
>    files this plan also rewrites: `Shadow.stories.tsx` now has a `RuntimeUtilities`
>    story rendering `<section data-shadow={mode}>` (`:192`, export `:287`), and
>    `AppearanceSettings.stories.tsx` has `ElevationInteraction` manipulating
>    `data-shadow` (`:69`). The plan's Shadow rewrite and its no-`data-shadow` gate both
>    collide with these. **Rebase first**, then convert `RuntimeUtilities` to toolbar-driven
>    (Task E, Decision A); the `AppearanceSettings` play fn stays (it passes the precise gate).
> 2. **`vite-plugin-dts` stays at v5 (issue is wrong).** `packages/react/package.json:63`
>    declares `^5.0.3` and **`pnpm-lock.yaml` froze `5.0.3`**, not `4.5.4`. The issue's
>    "pin to 4.5.4 / v5 breaks the rollup" premise predates the #547 multi-entry rollup
>    fix. Do **not** downgrade; keep v5 and prove it with the dist probe (Task F3).
> 3. **Rename the config, do not delete it.** `base-variants.config.json:2` self-declares
>    as the single source of truth for **both** the generator and
>    `audit-storybook-coverage.mjs:36`. Deleting it (as the issue says) breaks the audit.
>    Rename → `storybook-coverage.config.json`; drop only top-level `bases`/`brand`/`themes`.
> 4. **`surfaceTone` IS the base axis.** `BASE_TONE_OPTIONS` values are exactly
>    `stone/neutral/zinc/slate/gray` (`appearance-model.ts:40`), typed `NexusSurfaceTone`.
>    The toolbar's "surface tone" control therefore _is_ the base selector — base coverage
>    is preserved (one base at a time), only the side-by-side grid is lost.
> 5. **Table `density` / ToggleGroup `spacing` are real props, not system axes.**
>    `table.tsx:54` (`density?: TableDensity`) and `toggle-group.tsx:32` (`spacing?: number`).
>    Keep them as prop stories; the issue's blanket "delete `Density`/`Spacing`" is wrong.
> 6. **`component-paths.mjs` is shared — keep it.** Used by BOTH the generator and
>    `audit-storybook-coverage.mjs` (`component-paths.mjs:6-7`). Deleting "the generator
>    system" must not take it out; only trim its generator-specific bits.
> 7. **`@nexus/eslint-plugin` exists; the `/config` subpath does not.** Package dir is
>    `packages/eslint-plugin-nexus`, `name` is `@nexus/eslint-plugin`, and its `package.json`
>    `exports` only `"."`. The plan's `@nexus/eslint-plugin/config` specifier is correct but
>    requires a **new** `./config` export entry.
> 8. **The Typography parity check is a play fn (`Typography.stories.tsx:414`)** comparing
>    the story's `COMPOSITE_UTILITIES` literal to a `typography.json`-derived
>    `EXPECTED_UTILITY_CLASSES` (`:145,:418`). It can move to a unit test, but only if
>    `COMPOSITE_UTILITIES` is exported from a shared module first.
> 9. **A controlled provider needs `onStateChange` or in-story controls are dead.** Verified at
>    `provider.tsx:210-214`: when `state` is supplied, `setState` only calls `onStateChange`
>    and returns (mutates nothing). The Storybook decorator must round-trip globals ↔ provider
>    (`state` in, `onStateChange` → globals out), else `NexusAppearanceSettings` /
>    `NexusThemeQuickControl` inside stories call `setState` to no effect. Folded into Task D.

---

## Goal

Make `@nexus/react` stories reflect **only the current component under the active runtime
theme** — no Nexus system axes (base grids, spacing-mode matrices) hardcoded in — driven by
one live `NexusAppearanceProvider` toolbar. Keep the Storybook coverage audit intact, make
token-doc stories read runtime CSS, and make package tooling portable. Framework-agnostic
hygiene; no packaging/publishing decisions.

## Architecture

Three moves: (1) delete the base-variant generator system and its full ripple; (2) replace
all in-Storybook theme/system-axis variation with one global appearance-provider decorator;
(3) make token-doc stories and package tooling read from the runtime/built-dist rather than
source JSON or repo-root config.

## Global Constraints

- **No public `@nexus/react` component API changes.** Stories and tooling only.
- **New tooling API:** `@nexus/eslint-plugin/config` (a portable flat-config fragment).
- **The toolbar is the _only_ in-Storybook theme/system-axis mechanism** — the existing
  dark decorator in `preview.tsx` is removed, not left alongside.
- **`surfaceTone` = base, `mode` = light/dark/system.** Brand color and contrast stay at
  defaults for now (avoid toolbar overload; brand is locked to blue per the C-bases decision).
- **Pre-production** (`project-stage.md`): delete/rename in place, no shims.

## Sequencing

1. **Rebase onto current `main`** (post-#559). Start the Shadow rewrite from the _current_
   `Shadow.stories.tsx`, which already contains `RuntimeUtilities` (converted in Task E).
2. **Phase D coordination (heads-up, not a blocker).** The Phase D console-dogfood plan
   (`docs/superpowers/plans/2026-06-27-phase-d-console-dogfood-plan.md`) is untracked planning
   context and its multi-root extension is **not yet merged** (`audit-storybook-coverage.mjs`
   is still single-root: `COMPONENT_SUBDIRS = ['ui','primitives']`), and `apps/console` already
   consumes `@nexus/react/appearance` — so there is no live code collision. Just don't carry
   stale Phase-D assumptions into #538: whichever lands first, the other rebases (#538 renames
   the config Phase D would edit).
3. Branch `codex/issue-538-react-storybook-standalone` from synced `main`.

---

## Task A — Delete the base-variant generator (full ripple)

**Delete:**

- `packages/react/scripts/generate-base-variants.mjs`
- `packages/react/scripts/generate-base-variants.test.js`
- generated `packages/react/src/components/__generated__/` and its `.gitignore` entry

**Keep (do NOT delete):**

- `packages/react/scripts/component-paths.mjs` — shared with the audit. Trim only its
  generator-specific language (`:6-7` comment; the `sourceDir` import-path building used by
  the generator). The audit still needs it to resolve story-file paths.

**Remove the `generate:base-variants` lifecycle prefixes — all 9 call sites:**

- `packages/react/package.json`: the `generate:base-variants` script (`:32`) and its `&&`
  prefix in `typecheck` (`:30`), `storybook` (`:34`), `build-storybook` (`:35`).
- root `package.json`: `test` (`:10`), `test:watch` (`:11`), `test:storybook` (`:13`),
  `test:storybook:watch` (`:14`), `test:storybook:ui` (`:15`).

**Verify nothing else imports the generated CSS:** `preview.css` imports only
`@nexus/tailwind` (`:8`) — confirmed not coupled to `base-variants.css`. Re-grep after
deletion: `grep -rn "base-variants.css\|__generated__" packages/react/.storybook packages/react/src`.

## Task B — Rename config + update every consumer

Rename `packages/react/scripts/base-variants.config.json` →
`storybook-coverage.config.json`. Drop top-level `bases`, `brand`, `themes`. Keep
`components[]` with `name`/`showcase`/`interactions`/`equivalents`/`sourceDir`. Rewrite the
`//` header (drop the generator + chart-categorical-caveat lines — both generator-only).

**Update consumers (verified references):**

- `packages/react/scripts/audit-storybook-coverage.mjs:36` (`CONFIG_PATH`) + comments at
  `:800,:812,:827,:844`.
- `packages/react/scripts/audit-storybook-coverage.test.js` (config path/fixtures).
- `packages/react/scripts/component-paths.mjs:6-7` (comment).
- `.claude/rules/testing-react.md` — remove the base-variants generator section
  (`§ Per-Base Variant Generation`, ~`:300-360`) and fix the config references at
  `:100,:110,:125`.
- `CONTRIBUTING.md:312`.
- `.claude/agents/storybook-coverage-reviewer.md:157`.
- `.claude/commands/shadcn-adapt.md:71,:83` and the shadcn-adapt skill in **both** mirrors:
  `.claude/skills/shadcn-adapt-guide/SKILL.md:31,72,79,115` **and**
  `.agents/skills/shadcn-adapt-guide/SKILL.md:31,72,79,115`. This guidance actively tells
  authors to "add an entry to base-variants.config.json / wire base-variants" — **rewrite**
  it (the generator is gone), don't find-replace.
- Run `pnpm audit:agent-drift` after touching the mirrors.

## Task C — Remove system-axis stories + add a precise gate

**Delete the spacing-mode / system-axis story exports** (issue list): `AllModes`,
`*AcrossModes`, `*FollowModes`, `*IsDensityStable`, `ModesProduceDifferentHeights`,
`ItemPaddingPinnedAcrossModes`, `AccordionTriggerModesCascade`, and the document-level
`data-style` play-fn mode demos in `DropdownMenu.stories.tsx:553` and `Dialog.stories.tsx:68`.

**Preserve (rename to prop stories, not system-axis):** Table `density` and ToggleGroup
`spacing` coverage — these exercise real props (Correction 5).

**Helpers:** delete `src/stories/spacing-modes.tsx`. From `src/stories/test-utils.ts`,
**keep only the mode-agnostic `getControlHeight`** (rehome to `story-height-test-utils.ts`)
and delete the mode helpers (`expectModeCascadeWorks`, `expectHeightFixedAcrossModes`,
`expectHeightPerMode`, `expectHeightPinned`). **Before deleting:** enumerate which surviving
(non-mode) stories still import `getControlHeight`; if none do, delete the file entirely.

**Precise no-system-axis gate** (replaces the plan's blunt grep). Gate on the **JSX-attribute
form** only:

```bash
# Must return ZERO matches in packages/react/src/**/*.stories.tsx:
grep -rEn 'data-(style|radius|shadow|borderwidth|density|spacing)=' packages/react/src --include='*.stories.tsx'
```

Why this form: provider behavior tests manipulate `document.documentElement` via the
**quoted-string** API (`.setAttribute('data-shadow', …)`, `.getAttribute('data-style')`) —
those do not match `data-x=` and are correctly **not** flagged. Prop stories pass props
(`<Table density="compact">`); the `data-*` attr is emitted by the _component_, never the
story, so they also pass. The JSX-attr matches today are the deleted spacing-mode demos and
`Shadow.stories.tsx` `RuntimeUtilities` — the latter is converted to toolbar-driven in Task E,
so after both tasks the grep is clean with no exemptions.

Also assert no story-level `globals: { theme/style }` and no remaining
`import … spacing-modes` / mode-helper imports.

## Task D — Live appearance toolbar decorator

Add one global decorator in `.storybook/preview.tsx` wrapping every story in
`NexusAppearanceProvider` driven by Storybook globals **both ways**:

```tsx
<NexusAppearanceProvider
  state={stateFromGlobals}        // globals → provider
  storageKey={false}              // no persistence
  onStateChange={writeGlobals}    // provider → globals (REQUIRED — see below)
>
```

**Round-trip is mandatory, not optional.** Verified at `provider.tsx:210-214`: when `state`
is supplied (controlled), `setState` **only** calls `onStateChange` and returns — it mutates
nothing. So in-story controls (`NexusAppearanceSettings`, `NexusThemeQuickControl`) call
`setState` → if the decorator omits `onStateChange`, that's a no-op and the controlled `state`
never changes — the controls render dead. The decorator must capture `onStateChange` and write
the changed fields back to Storybook globals via the `useGlobals()` updater; the new globals
re-render the decorator, which recomputes `stateFromGlobals` and feeds it back as `state`,
closing the loop. Write back only changed keys (skip a redundant `updateGlobals` when equal) so
the toolbar and in-story controls stay in sync without churn. **Remove the existing dark
decorator** so the toolbar is the only theme mechanism.

Build toolbar items from `@nexus/core` constants where they exist:
`BASE_TONE_OPTIONS` (surface tone), `DENSITY_OPTIONS`, `CORNER_OPTIONS`, `ELEVATION_OPTIONS`,
`STROKE_OPTIONS`. **`mode` has no `_OPTIONS` constant** — hand-build a 3-item
`light / dark / system` list. Map each toolbar global into the matching `NexusAppearanceState`
field; leave `brandColor`/`contrast` at `DEFAULT_NEXUS_APPEARANCE`.

Remove local providers from `AppearanceSettings.stories.tsx` / `ThemeQuickControl.stories.tsx`
so a nested provider can't write the same `document.documentElement` attrs as the global one
(double-write conflict) — and so their in-story controls drive the global provider via the
round-trip above. Their play fns that read/restore `data-shadow`/`data-style` stay (they test
provider behavior and pass the Task C gate).

## Task E — Token-doc stories → runtime, core-free

Rewrite `Colors`, `Spacing`, `Typography`, `Radius`, `Shadow`, `DataViz` (all 6 currently
import `core/tokens/**` — verified) to read the active theme via a shared mounted hook
`src/stories/runtime-token-values.tsx` using `getComputedStyle` on `--nx-*` vars, re-running
on appearance-state/global change (reads after provider effects to avoid staleness). No
`core/tokens/**.json` imports in these stories.

**Typography parity (must not lose coverage):** the play fn at `Typography.stories.tsx:414`
asserts `COMPOSITE_UTILITIES` (literal) `.toEqual` a `typography.json`-derived set. To remove
the JSON import from the story: (1) export `COMPOSITE_UTILITIES` from a shared module; (2) move
the parity assertion into a unit/script test importing both `typography.json` and that shared
list; (3) only then strip the JSON import. Do this **before** the Shadow/Colors rewrites so the
guard never lapses.

**Shadow specifically (resolves the #559 collision — Codex's call).** Start from the _current_
post-#559 `Shadow.stories.tsx`. Drop the JSON-composed `Light` / `Dark` `ModeSection` displays
(they import `shadow*Light`/`shadow*Dark` JSON). **Convert** `RuntimeUtilities` from the
hardcoded per-mode matrix (`<section data-shadow={mode}>` across quiet/standard/strong) into a
single elevation preview that renders the real `nx:shadow-*` tiers under the **active toolbar**
elevation — consistent with the issue's "current state only" token-doc rule, and clearing the
Task C gate (no `data-shadow=` left).

> **Deliberate coverage transfer — call it out in the PR (do not pretend it's replaced).**
> Converting `RuntimeUtilities` removes the side-by-side quiet/standard/strong shadow
> comparison that #559 shipped on 2026-06-28 as its "durable visual artifact." The toolbar
> shows one elevation at a time, so cross-mode shadow comparison moves to flipping the toolbar
> (or to console/docs). If side-by-side comparison is judged worth keeping, the alternative is
> to leave `RuntimeUtilities` as-is and add an explicit Task C gate exemption for that one
> token-doc export — but that contradicts "current state only." Default: convert.

**Delete `src/stories/AdjustContrast.stories.tsx`** (engine demo superseded by the appearance
system) — confirm `adjustContrast` (in `@nexus/core`) keeps coverage in core unit tests.

## Task F — Standalone-friendly tooling

**F1 — ESLint shareable config.** In `packages/eslint-plugin-nexus/package.json` add a
`./config` export (`exports["./config"]`) pointing at a new flat-config factory/fragment that
carries only the Nexus rules. Root `eslint.config.js` keeps repo-specific ignores/globs and
third-party React/TS/a11y/import/prettier setup, and consumes `@nexus/eslint-plugin/config`
for the Nexus-rule layer (today it imports the plugin at `"."`).

**F2 — Self-contained `packages/react/tsconfig.json`.** Inline the base compiler options it
needs so it no longer requires repo-root `tsconfig.base.json`. Verify `pnpm --filter
@nexus/react typecheck` still passes.

**F3 — Dist type probe (both entries, self-contained).** Rework
`scripts/typecheck-appearance-dist.mjs`: assert **both** `dist/index.d.ts` and
`dist/appearance.d.ts` exist; the temp probe tsconfig must be self-contained (do **not**
`extends '../../../tsconfig.base.json'` as it does today) and resolve `@nexus/react` +
`@nexus/react/appearance` from **built dist**, no source aliases. This directly guards the
#547 dangling-secondary-entry class. Keep `vite-plugin-dts@5` (Correction 2) and let this
probe prove the rollup still emits both `.d.ts` files.

---

## Resolved Decisions + Required Pre-Merge Gate

**A — #559's `RuntimeUtilities`: convert to toolbar-driven (decided).** Handled in Task E:
drop the JSON `Light`/`Dark` displays and convert `RuntimeUtilities` to a single live-toolbar
elevation preview. This is consistent with the issue's "current state only" token-doc rule and
clears the Task C gate. **Cost (must be stated in the PR):** removes the side-by-side
quiet/standard/strong comparison #559 shipped 2026-06-28 — a deliberate transfer, not a
silent replacement (see the Task E callout for the keep-and-exempt alternative if side-by-side
is later judged worth it).

**B — Console cross-base coverage: required verification before merge (not optional).** Issue
#538 makes it an acceptance criterion. Deleting base-variants + the height-cascade helpers
removes the only _rendered_ guard that controls change height across `data-style` modes
(`validate:spacing-modes` checks token-key parity, not rendered height). Before merge:
(1) verify in `apps/console` that components render correctly across at least two bases and two
densities (record which surfaces were checked in the PR); and (2) state plainly in the PR that
rendered spacing-mode height coverage is **transferred out of `@nexus/react`**, not replaced —
mirroring the Task E callout. If console cannot demonstrate this, keep a minimal rendered
cascade test in the package rather than dropping the guard entirely.

---

## Test Plan

- `pnpm --filter @nexus/react audit:storybook-coverage -- --all` (config rename intact)
- `pnpm audit:mode-codenames`
- No-system-axis gate (Task C grep) returns zero matches
- `pnpm audit:agent-drift` (mirrors updated)
- `pnpm test:unit` (incl. the migrated Typography parity test)
- `pnpm test:storybook`
- `pnpm build-storybook`
- `pnpm typecheck` / `pnpm lint` / `pnpm format:check`
- `pnpm --filter @nexus/react build` then `pnpm size-limit`
- `pnpm --filter @nexus/react build && node scripts/typecheck-appearance-dist.mjs`
  (both entries, self-contained)
- Manual Storybook QA: toolbar drives surface tone (5 bases) / mode / density / corners /
  elevation / stroke; **and the round-trip works** — changing `NexusAppearanceSettings` /
  `NexusThemeQuickControl` _inside a story_ updates the toolbar globals (proves `onStateChange`
  write-back); token docs update live as the toolbar changes.
- **Pre-merge console verification (Decision B):** confirm `apps/console` renders components
  across ≥2 bases and ≥2 densities; record the surfaces checked in the PR and state the
  rendered-height coverage transfer explicitly.

## Self-review

- Every issue scope item (A–F) is covered. Issue overrides documented (config keep, Density/
  Spacing keep, vite-plugin-dts keep) with source evidence.
- No placeholders: exact paths, line numbers, and commands throughout.
- Type/name consistency: `storybook-coverage.config.json`, `story-height-test-utils.ts`,
  `runtime-token-values.tsx`, `@nexus/eslint-plugin/config` used consistently.
- Two genuine forks surfaced as Open Decisions, not silently resolved.
