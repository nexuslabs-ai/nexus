# Phase B — Package the Engine + Provider — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Supersedes** the draft `Phase B Package Engine + Provider Plan` (by Codex). This version resolves the council review in [`reports/phase-b-plan-council-review.md`](../../../reports/phase-b-plan-council-review.md): the 4 blockers (B1 dependency wiring + bundle decision, B2 generator collectors, B3 shadow-emit mechanism, B4 unrunnable audit) and the should-fixes are folded in as explicit tasks and locked decisions below.

**Goal:** Promote the console's runtime appearance engine into package APIs — an appearance model + sanitizers in `@nexus/core`, and a provider + hook + editor UI behind a separate `@nexus/react/appearance` bundle entry — with the Tailwind generator emitting per-mode `data-*` blocks for the layout axes.

**Architecture:** `@nexus/core` owns framework-agnostic data (model, option maps, sanitizers, `createNexusThemeContract`, `appearancePrefsToCss`) layered **on top of** the existing Phase A engine (`deriveTheme`/`themeToCss`). `@nexus/react/appearance` is a **separate Vite library entry** owning the React provider, `useNexusAppearance`, and the editor UI; it imports `@nexus/core` as an externalized peer (never bundled into the main `index.mjs` barrel). The `@nexus/core` Tailwind generator is generalized so `nexus.css` emits `[data-radius]`/`[data-shadow]`/`[data-borderwidth]` blocks the same way it already emits `[data-style]` spacing blocks.

**Tech Stack:** TypeScript, React 19, Vite library mode (multi-entry), Tailwind v4, culori + apca-w3 (inside `@nexus/core` only), size-limit, vitest, `@nexus/test-utils` (`renderHook`).

## Implementation Sequence Outline

This file is the executable Phase B plan; no separate plan file is needed. Use this outline to choose session boundaries, then execute the detailed tasks below.

1. **Pre-flight / branch gate** — wait until Phase A PR #535 is merged to `main`, start a fresh Phase B branch from `main`, confirm no tracked dirty files, and run a narrow baseline (`pnpm test:unit`, `pnpm --filter @nexus/core build`, `pnpm --filter @nexus/react build`).
2. **Core model track** — run Tasks 1→5 in order. This creates the public `NexusAppearanceState`, sanitizers, `createNexusThemeContract`, and prefs CSS serializer, then audits the `Codex*`→`Nexus*` type rename so the monorepo stays green.
3. **Generator track** — run Tasks 6→7. This can happen in parallel with the core model track if another agent owns it; it only touches token scripts/output and proves `data-radius` / `data-shadow` / `data-borderwidth` mode blocks.
4. **Bundle shell track** — run Task 8. This can happen in parallel with Tasks 1 or 6 because it creates its own temporary `packages/react/src/appearance/index.ts` stub before building the new subpath entry.
5. **React package track** — run Tasks 9→10 after Tasks 1 and 8 are done. First ship the provider/hook and storage/DOM sync, then promote the settings and quick-control UI onto `@nexus/react/appearance`.
6. **Final gate** — run Task 11 only after all tracks converge. The phase is done when typecheck, lint, unit tests, package builds, size-limit, browser-support audit, and package-boundary checks are green.

Recommended session split for a single implementer:

- **Session 1:** Pre-flight + Tasks 1→5.
- **Session 2:** Tasks 6→8.
- **Session 3:** Task 9.
- **Session 4:** Task 10 + Task 11.

## Global Constraints

_Every task's requirements implicitly include this section. Values copied verbatim from the epic + verified during the council review._

- **Bundle ceiling:** `@nexus/react` ESM `dist/index.mjs` size-limit is **88 kB** (root `package.json` → `size-limit`), currently ~86.9 kB (~1 kB headroom). The engine and `@nexus/core` MUST NOT land in `index.mjs`.
- **CSS budget:** `@nexus/react` `dist/react.css` size-limit is **30 kB**. Token mode-blocks ship from `@nexus/tailwind`'s `nexus.css` (unbudgeted) — they do **not** count against this. Only new appearance-UI utilities pressure `react.css`.
- **`@nexus/core` is `private: true`** (workspace-resolved, with an existing runtime `exports` entry) — deps `culori@^4.0.2`, `apca-w3@^0.1.9`. **Publishing core is explicitly out of scope (epic L141)** — do not flip `private` in this phase.
- **Cross-platform split is load-bearing:** `deriveTheme` returns token **data**; `themeToCss` is the web applier. Never fold `themeToCss` into a React hook.
- **Browserslist floor Safari 15.4** → no `light-dark()` in any emitted CSS (`themeToCss` and the generator both use `:root` / `:root.dark` / per-mode blocks).
- **Subtree-scoped theming is out of scope v1 (epic L140)** — the provider themes `document.documentElement` only; `themeToCss` hardcodes `:root`.
- **Stories ARE tests** (`.claude/rules/testing-react.md`) — but per the epic, **shipped-component stories + `audit:storybook-coverage` are Phase D**, NOT this phase. Phase B tests provider/hook/util logic via `*.test.ts` / `*.test.tsx` outside `packages/react/src/components/**` (`renderHook`), and generator/core logic via `*.test.ts`. A `*.test.tsx` under `packages/react/src/components/**` is silently excluded from the unit run — do not put logic tests there.
- **Pre-production** (`.claude/rules/project-stage.md`): rename/remove in place, no aliases, no migration shims, no feature flags.

---

## Decisions locked (resolving the council's open questions)

These were left open by the draft; each is resolved here so the implementer does not have to decide mid-task.

1. **`@nexus/core` is `external` + a real `peerDependencies` entry (B1).** Follows epic Decision #2 (optional peer + external, sonner/recharts pattern). It is _not_ bundled. This is the cleanest path for v1 workspace consumers (console/playground resolve via symlink) and keeps `index.mjs` clean. The wiring the draft omitted — add core to `peerDependencies` **and** the vite `external` list — is Task 8.
2. **One storage key, holding the full state (B-should-fix).** Persist a single compact `NexusAppearanceState` blob (mode + brandColor + surfaceTone + contrast + the 4 axes + prefs) under `storageKey` (default `'nexus-appearance'`). No reverse seed→tone mapping; expand to seeds on read. Corrupt/oversized payloads reset to default (pre-prod — no migration from the console's old two keys).
3. **Generic `NexusAppearancePrefs` only (B-should-fix F4/O6/O7).** Promote `uiFont`, `codeFont`, `uiFontSize`, `codeFontSize`, `reduceMotion`, `pointerCursors`, `fontSmoothing`. **Drop** `translucentSidebar` (hardcodes the console-only `[data-slot="sidebar-container"]` selector) and `diffMarkers` (console diff-UI concept). Consumers extend visuals via their own CSS.
4. **Emit-all generator modes (B-refuted F3).** The generalized emitter ships a block for **every** shipped mode (radius incl. `blunt`; shadow/borderwidth incl. `lyra`/`vega`), matching the existing all-7-spacing-modes precedent. The typed enums expose the curated subset; unexposed modes remain reachable by raw attribute. This is fine — token blocks are unbudgeted.
5. **Rename `CodexThemeContract`→`NexusThemeContract` in core AND update the console's import sites in the same rename commit (B4 sequencing).** Pre-prod forbids an alias. This is the _type-name_ rename + mechanical console import update only — it is **not** the Phase D dogfood (the console keeps its own local `codex-*.ts` runtime + UI until D swaps to the package provider). Task 1 owns the rename + fallout so no intermediate commit breaks the monorepo; Task 5 is the follow-up audit/typecheck gate.
6. **No scoped color serializer (B-should-fix A2).** Subtree theming is out of scope v1. `config-preview.tsx` mirrors the **applied** theme (reads the live computed swatches / the current state), not a candidate un-applied theme. One provider per document.
7. **Drop the orphan `NexusThemeContract`-as-distinct-type and the dead helpers (B-should-fix A3/A5).** `NexusAppearanceState` is the single source of truth. `createNexusThemeContract(state)` returns the existing `ThemeDerivationInput`. Do **not** promote `applyBrandColor` / `applyBaseTone` / `surfaceToneFromSeeds` (dead in a flat-state model). The renamed `NexusThemeContract` (= old `CodexThemeContract`) stays as the engine's `appearance`-bearing contract type, but the editor state is `NexusAppearanceState`, not that contract.

---

## File Structure

**Create:**

- `packages/core/src/lib/appearance-model.ts` — model types, defaults, option maps (incl. `BASE_TONE_SEEDS`), sanitizers, `createNexusThemeContract`, `appearancePrefsToCss`.
- `packages/core/src/lib/appearance-model.test.ts` — unit tests (migrated from the 3 console suites + the new parity test).
- `packages/core/scripts/` — new per-mode literal collectors for radius/borderwidth/shadow (location: extend `utils.js`; see Task 6).
- `packages/react/src/appearance/` — `provider.tsx`, `appearance-settings.tsx`, `theme-quick-control.tsx`, `color-field.tsx`, `setting-row.tsx`, `config-preview.tsx`, `index.ts`.
- `packages/react/src/appearance/provider.test.tsx` — hook/provider tests via `renderHook`.

**Modify:**

- `packages/core/src/lib/derive-theme.ts` — rename `CodexThemeContract`→`NexusThemeContract`; rename `SurfaceTone`→`NexusSurfaceTone` (keep a `Mode`/`ThemeSeeds`/`ThemeDerivationInput` as-is).
- `packages/core/src/index.ts` — export the model + the renamed types.
- `packages/core/scripts/generate-tailwind-package.js` + `utils.js` — generalize the per-mode emitter.
- `apps/console/src/lib/{codex-contract,appearance-theme}.ts`, `apps/console/src/app/theme-provider.tsx`, `apps/console/src/modules/design-system/settings/AppearanceSettings.tsx` — update imports for the core type rename (Task 5).
- `packages/react/vite.config.ts` — multi-entry + externalize `@nexus/core`.
- `packages/react/package.json` — `exports['./appearance']`, `peerDependencies['@nexus/core']` + `peerDependenciesMeta`.
- root `package.json` — `size-limit` entry for `dist/appearance.mjs`.

---

## Task 1: Core appearance model — types, defaults, option maps

**Files:**

- Create: `packages/core/src/lib/appearance-model.ts`
- Modify: `packages/core/src/lib/derive-theme.ts` (rename `SurfaceTone`→`NexusSurfaceTone`, `CodexThemeContract`→`NexusThemeContract`)
- Modify: core tests/index exports and the console import sites that reference those renamed core types (mechanical rename fallout only)
- Test: `packages/core/src/lib/appearance-model.test.ts`

**Interfaces:**

- Consumes: `ThemeDerivationInput`, `ThemeSeeds`, `NexusSurfaceTone` (renamed) from `./derive-theme`.
- Produces: `NexusAppearanceMode`, `NexusDensity`, `NexusCorners`, `NexusElevation`, `NexusStroke`, `NexusAppearancePrefs`, `NexusAppearanceState`, `DEFAULT_NEXUS_APPEARANCE`, `BASE_TONE_SEEDS`, and the `*_OPTIONS` maps. Consumed by Tasks 3, 4, 9, 10.

- [ ] **Step 1: Rename the engine types and fix the ripple immediately.** Replace every `SurfaceTone` with `NexusSurfaceTone` and `CodexThemeContract` with `NexusThemeContract` in `packages/core/src/lib/derive-theme.ts` (use `replace_all`). The shapes are unchanged — `NexusThemeContract extends ThemeDerivationInput { appearance: NexusAppearanceMode }` (define `NexusAppearanceMode` in appearance-model and import it with `import type`, or inline the union and re-export). Leave `ThemeSeeds`, `ThemeDerivationInput`, `Mode`, `DerivedTheme`, `TokenMap` as-is. Before committing this task, also update all import sites in `packages/core/src`, `packages/core/src/**/*.test.ts`, and `apps/console/src` so the monorepo is never left with stale exported type names.

- [ ] **Step 2: Write the failing test for defaults + option maps.**

```ts
// packages/core/src/lib/appearance-model.test.ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  CORNER_OPTIONS,
  ELEVATION_OPTIONS,
  STROKE_OPTIONS,
  BASE_TONE_SEEDS,
} from './appearance-model';

describe('appearance-model defaults', () => {
  it('package default state is light, stone, blue, contrast 60', () => {
    expect(DEFAULT_NEXUS_APPEARANCE).toMatchObject({
      mode: 'light',
      brandColor: '#339cff',
      surfaceTone: 'stone',
      contrast: 60,
      density: 'mira',
      corners: 'sharp',
      elevation: 'maia',
      stroke: 'vega',
    });
  });

  it('option maps expose the curated subsets', () => {
    expect(DENSITY_OPTIONS.map((o) => o.value)).toEqual([
      'nova',
      'mira',
      'luma',
      'sera',
    ]);
    expect(CORNER_OPTIONS.map((o) => o.value)).toEqual([
      'sharp',
      'subtle',
      'smooth',
      'mellow',
    ]);
    expect(ELEVATION_OPTIONS.map((o) => o.value)).toEqual([
      'maia',
      'mira',
      'nova',
    ]);
    expect(STROKE_OPTIONS.map((o) => o.value)).toEqual([
      'maia',
      'vega',
      'nova',
    ]);
  });

  it('BASE_TONE_SEEDS carries bg/fg seeds for all 5 tones, both modes', () => {
    for (const tone of ['stone', 'neutral', 'zinc', 'slate', 'gray'] as const) {
      expect(BASE_TONE_SEEDS[tone].light).toEqual(
        expect.objectContaining({
          background: expect.any(String),
          foreground: expect.any(String),
        })
      );
      expect(BASE_TONE_SEEDS[tone].dark.background).toMatch(/^#/);
    }
  });
});
```

- [ ] **Step 3: Run it — expect failure** (`appearance-model` not found).

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 4: Implement the model.** Promote the type/option/seed declarations from `apps/console/src/lib/appearance-theme.ts` (lines 12–72) and the prefs interface from `apps/console/src/lib/codex-prefs.ts` (lines 1–11), applying these transforms:
  - `BASE_TONE_OPTIONS`, `BASE_TONE_SEEDS`, `DENSITY_OPTIONS`, `CORNER_OPTIONS`, `ELEVATION_OPTIONS`, `STROKE_OPTIONS`, `DEFAULT_BRAND_COLOR` → copy verbatim. Re-type their `Base`/`SpacingMode`/`RadiusMode`/`TokenMode` annotations to the new `NexusSurfaceTone`/`NexusDensity`/`NexusCorners`/`NexusElevation`/`NexusStroke` literal unions defined here (do **not** import the console's `useTheme` types).
  - Define the literal unions: `NexusDensity = 'nova'|'mira'|'luma'|'sera'`, `NexusCorners = 'sharp'|'subtle'|'smooth'|'mellow'`, `NexusElevation = 'maia'|'mira'|'nova'`, `NexusStroke = 'maia'|'vega'|'nova'`, `NexusAppearanceMode = 'light'|'dark'|'system'`.
  - `NexusAppearancePrefs` = the console `CodexPrefs` **minus** `translucentSidebar` and `diffMarkers` (Decision 3): `{ uiFont; codeFont; uiFontSize; codeFontSize; reduceMotion: 'system'|'on'|'off'; pointerCursors: boolean; fontSmoothing: boolean }`.
  - `NexusAppearanceState = { mode: NexusAppearanceMode; brandColor: string; surfaceTone: NexusSurfaceTone; contrast: number; density: NexusDensity; corners: NexusCorners; elevation: NexusElevation; stroke: NexusStroke; prefs: NexusAppearancePrefs }`.
  - `DEFAULT_NEXUS_APPEARANCE: NexusAppearanceState` with the values asserted in Step 2 and `prefs` = the promoted `DEFAULT_CODEX_PREFS` minus the two dropped fields.

- [ ] **Step 5: Run tests — expect pass.**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: PASS.

- [ ] **Step 6: Typecheck the whole monorepo — the gate that proves the rename fallout (Step 1) is complete.**

Run: `pnpm typecheck`
Expected: PASS. A failure here means a `SurfaceTone`/`CodexThemeContract` importer in `packages/core/src` (incl. `*.test.ts`, `index.ts`) or `apps/console/src` was missed — fix it before committing so this commit never leaves the monorepo red. (Decision 5.)

- [ ] **Step 7: Commit.**

```bash
git add packages/core/src/lib/appearance-model.ts packages/core/src/lib/appearance-model.test.ts packages/core/src/lib/derive-theme.ts packages/core/src/index.ts apps/console/src
git commit -m "feat(core): add NexusAppearance model + rename engine types to Nexus*"
```

---

## Task 2: Core sanitizers (own-key, prototype-safe)

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts`
- Test: `packages/core/src/lib/appearance-model.test.ts`

**Interfaces:**

- Produces: `sanitizeNexusAppearance(raw: unknown): NexusAppearanceState`, `sanitizeNexusAppearancePrefs(raw: unknown): NexusAppearancePrefs`. Consumed by Task 9 (provider load path).

- [ ] **Step 1: Write failing tests.** Migrate the meaningful cases from `apps/console/src/lib/codex-contract.test.ts` and `codex-prefs.test.ts`:

```ts
import {
  sanitizeNexusAppearance,
  sanitizeNexusAppearancePrefs,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';

describe('sanitizeNexusAppearance', () => {
  it('falls back to default on non-object', () => {
    expect(sanitizeNexusAppearance(null)).toEqual(DEFAULT_NEXUS_APPEARANCE);
    expect(sanitizeNexusAppearance('x')).toEqual(DEFAULT_NEXUS_APPEARANCE);
  });
  it('rejects prototype-chain keys as tones (own-key check)', () => {
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        surfaceTone: 'toString',
      }).surfaceTone
    ).toBe('stone');
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        surfaceTone: 'hasOwnProperty',
      }).surfaceTone
    ).toBe('stone');
  });
  it('rejects invalid brandColor / contrast / enums', () => {
    expect(
      sanitizeNexusAppearance({
        ...DEFAULT_NEXUS_APPEARANCE,
        brandColor: 'not-a-color',
      }).brandColor
    ).toBe('#339cff');
    expect(
      sanitizeNexusAppearance({ ...DEFAULT_NEXUS_APPEARANCE, contrast: 999 })
        .contrast
    ).toBe(60);
    expect(
      sanitizeNexusAppearance({ ...DEFAULT_NEXUS_APPEARANCE, density: 'wat' })
        .density
    ).toBe('mira');
  });
  it('preserves appearance:"system" verbatim', () => {
    expect(
      sanitizeNexusAppearance({ ...DEFAULT_NEXUS_APPEARANCE, mode: 'system' })
        .mode
    ).toBe('system');
  });
});

describe('sanitizeNexusAppearancePrefs', () => {
  it('clamps font sizes into [8,32] and falls back per field', () => {
    expect(sanitizeNexusAppearancePrefs({ uiFontSize: 99 }).uiFontSize).toBe(
      32
    );
    expect(sanitizeNexusAppearancePrefs({ uiFontSize: 0 }).uiFontSize).toBe(14);
  });
});
```

- [ ] **Step 2: Run — expect failure** (functions not exported).

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement the sanitizers.** Mirror `codex-contract.ts:sanitizeContract` + `codex-prefs.ts:sanitizePrefs`, with these rules:
  - Enum membership checks use an **own-key** guard, never `value in obj`. Use a frozen `Set` per axis (e.g. `const TONES = new Set(['stone','neutral','zinc','slate','gray'])` then `TONES.has(value)`), or `Object.hasOwn(BASE_TONE_SEEDS, value)` — both are prototype-safe (matches the shipped console guard `codex-contract.ts:37-42`).
  - `brandColor` validated with the existing `isColor` from `./perceptual-ramp` (already exported by core).
  - `contrast` accepted only if `typeof === 'number' && 0 <= n <= 100`, else default 60.
  - `prefs` delegated to `sanitizeNexusAppearancePrefs`; `clampFontSize` range `[8,32]` copied from `codex-prefs.ts:26-37`.
  - `mode` accepted only if `'light'|'dark'|'system'`, else default.

- [ ] **Step 4: Run — expect pass.**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add packages/core/src/lib/appearance-model.ts packages/core/src/lib/appearance-model.test.ts
git commit -m "feat(core): add prototype-safe appearance sanitizers"
```

---

## Task 3: `createNexusThemeContract` + 5-tone parity test (highest-value)

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts`
- Test: `packages/core/src/lib/appearance-model.test.ts`

**Interfaces:**

- Produces: `createNexusThemeContract(state: NexusAppearanceState): ThemeDerivationInput`. Consumed by Task 9 (provider applies `themeToCss(deriveTheme(createNexusThemeContract(state)))`).

- [ ] **Step 1: Write the failing test — brand on both modes + parity holds for all 5 tones.** This is the test the draft omitted; it proves the central transform produces engine-valid seeds.

```ts
import { deriveTheme } from './derive-theme';
import {
  createNexusThemeContract,
  DEFAULT_NEXUS_APPEARANCE,
  BASE_TONE_SEEDS,
} from './appearance-model';

describe('createNexusThemeContract', () => {
  it('puts brandColor on both light.accent and dark.accent', () => {
    const c = createNexusThemeContract({
      ...DEFAULT_NEXUS_APPEARANCE,
      brandColor: '#ff0000',
    });
    expect(c.light.accent).toBe('#ff0000');
    expect(c.dark.accent).toBe('#ff0000');
  });

  it('pulls bg/fg from BASE_TONE_SEEDS for the chosen tone', () => {
    const c = createNexusThemeContract({
      ...DEFAULT_NEXUS_APPEARANCE,
      surfaceTone: 'slate',
    });
    expect(c.light.background).toBe(BASE_TONE_SEEDS.slate.light.background);
    expect(c.dark.foreground).toBe(BASE_TONE_SEEDS.slate.dark.foreground);
    expect(c.surfaceTone).toBe('slate');
    expect(c.contrast).toBe(60);
  });

  it.each(['stone', 'neutral', 'zinc', 'slate', 'gray'] as const)(
    'output round-trips through deriveTheme without missing keys (%s)',
    (tone) => {
      const contract = createNexusThemeContract({
        ...DEFAULT_NEXUS_APPEARANCE,
        surfaceTone: tone,
      });
      expect(() => deriveTheme(contract)).not.toThrow();
      const theme = deriveTheme(contract);
      expect(Object.keys(theme.light).length).toBeGreaterThan(60);
      expect(Object.keys(theme.dark).length).toBe(
        Object.keys(theme.light).length
      );
    }
  );
});
```

- [ ] **Step 2: Run — expect failure.**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: FAIL (`createNexusThemeContract` not defined).

- [ ] **Step 3: Implement.** Mirror the console contract assembly (`codex-contract.ts:14-20`):

```ts
export function createNexusThemeContract(
  state: NexusAppearanceState
): ThemeDerivationInput {
  const tone = BASE_TONE_SEEDS[state.surfaceTone];
  return {
    surfaceTone: state.surfaceTone,
    contrast: state.contrast,
    light: { accent: state.brandColor, ...tone.light },
    dark: { accent: state.brandColor, ...tone.dark },
  };
}
```

- [ ] **Step 4: Run — expect pass.**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: PASS (all 5 tone permutations).

- [ ] **Step 5: Commit.**

```bash
git add packages/core/src/lib/appearance-model.ts packages/core/src/lib/appearance-model.test.ts
git commit -m "feat(core): createNexusThemeContract with 5-tone parity coverage"
```

---

## Task 4: `appearancePrefsToCss` (generic prefs only)

**Files:**

- Modify: `packages/core/src/lib/appearance-model.ts`
- Test: `packages/core/src/lib/appearance-model.test.ts`

**Interfaces:**

- Produces: `appearancePrefsToCss(prefs: NexusAppearancePrefs): string`. Consumed by Task 9 (injected as a `<style>` parallel to `themeToCss`).

- [ ] **Step 1: Write failing tests.**

```ts
import {
  appearancePrefsToCss,
  DEFAULT_NEXUS_APPEARANCE,
} from './appearance-model';
const P = DEFAULT_NEXUS_APPEARANCE.prefs;

describe('appearancePrefsToCss', () => {
  it('emits font vars + clamped root size + smoothing', () => {
    const css = appearancePrefsToCss({ ...P, uiFontSize: 99 });
    expect(css).toContain('--nx-typography-family-font-sans:');
    expect(css).toContain('font-size: 32px'); // clamped
    expect(css).toContain('-webkit-font-smoothing: antialiased');
  });
  it('emits the reduced-motion block only when reduceMotion==="on"', () => {
    expect(appearancePrefsToCss({ ...P, reduceMotion: 'on' })).toContain(
      'transition-duration: 0.01ms'
    );
    expect(appearancePrefsToCss({ ...P, reduceMotion: 'off' })).not.toContain(
      '0.01ms'
    );
  });
  it('emits pointer-cursor rule only when pointerCursors===true', () => {
    expect(appearancePrefsToCss({ ...P, pointerCursors: true })).toContain(
      'cursor: pointer'
    );
    expect(appearancePrefsToCss({ ...P, pointerCursors: false })).not.toContain(
      'cursor: pointer'
    );
  });
  it('NEVER emits the console-only sidebar selector', () => {
    expect(appearancePrefsToCss(P)).not.toContain('sidebar-container');
  });
});
```

- [ ] **Step 2: Run — expect failure.**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement** by promoting `codex-prefs.ts:prefsToCss` (87–118) **minus** the `translucentSidebar` block (Decision 3). Keep the font-var block, the `code, pre, .nx\:font-mono` size rule, the `-webkit-font-smoothing` rule, the `pointerCursors` block, and the `reduceMotion === 'on'` block. Reuse the `clampFontSize` from Task 2.

- [ ] **Step 4: Run — expect pass.**

Run: `pnpm test:unit packages/core/src/lib/appearance-model.test.ts`
Expected: PASS.

- [ ] **Step 5: Export everything from core + commit.** Add to `packages/core/src/index.ts`: `export * from './lib/appearance-model'` (and confirm the renamed `NexusThemeContract`/`NexusSurfaceTone` are exported from `./derive-theme`).

```bash
git add packages/core/src/lib/appearance-model.ts packages/core/src/lib/appearance-model.test.ts packages/core/src/index.ts
git commit -m "feat(core): appearancePrefsToCss (generic prefs) + export model"
```

---

## Task 5: Rename ripple audit — verify no stale type imports

**Files:**

- Modify only if Task 1 missed a stale importer.

**Interfaces:** none new — this is the proof gate for Task 1's core rename (Decision 5).

- [ ] **Step 1: Assert no stale exported core type names remain.**

Run: `! rg -n "CodexThemeContract|\bSurfaceTone\b" packages/core/src apps/console/src`
Expected: PASS with no output. (`surfaceTone` property names are lower-case and intentionally remain.)

- [ ] **Step 2: If the grep finds anything, fix it before continuing.** Replace `CodexThemeContract`→`NexusThemeContract` and `SurfaceTone`→`NexusSurfaceTone` at each site. The console's local runtime (`loadCodexContract`, `applyBrandColor`, etc.) keeps its local names; only the **imported core type names** change.

- [ ] **Step 3: Typecheck the whole monorepo — expect green.**

Run: `pnpm typecheck`
Expected: PASS (no console build break — Decision 5 satisfied).

- [ ] **Step 4: Commit.**

```bash
git add packages/core/src apps/console/src
git diff --cached --quiet || git commit -m "refactor(console): follow core Nexus type rename"
```

---

## Task 6: Generator — per-mode literal collectors for radius / borderwidth / shadow

**Files:**

- Modify: `packages/core/scripts/utils.js`
- Test: `packages/core/scripts/__tests__/` (mirror the existing `spacing-modes.test.js`)

**Interfaces:**

- Produces: `collectRadiusModes(tokensDir)`, `collectBorderwidthModes(tokensDir)`, `collectShadowModes(tokensDir)` — each returns a **mode-keyed literal map** `{ [mode]: Array<{cssName, value}> }`, the shape `generateSpacingModesCSS` consumes. (Distinct from the existing single-mode `collectRadiusTokens(dir, mode)` / `collectBorderwidthTokens(dir, mode)` / `collectShadowTokens(dir, primitiveMap)`, which are `@theme`-shaped and stay.)

> **Implementer note (anti-fabrication):** read `collectSpacingTokens` (`utils.js:784`) end-to-end first — it is the exact template (iterate `modeNames`, read each `spacing-{mode}.json`, flatten to `{cssName, value}` with a collision guard). Mirror it for the three new families, reading per-mode primitive files from `packages/core/tokens/primitives/{radius,borderwidth,shadow}/*`. For **shadow**, the per-mode value is a **primitive-layer override** (e.g. `--nx-shadow-sm-layer-1-color`), NOT the composite `--shadow-sm` — confirm against `apps/console/public/themes/shadow-maia.css` (which emits `--nx-shadow-*-layer-*-*`). This is Decision/blocker B3: a composite-literal collector would be wrong.

- [ ] **Step 1: Write failing tests** asserting each collector returns all shipped modes with non-empty token arrays.

```js
// __tests__/mode-collectors.test.js  (vitest — matches the existing scripts/__tests__ suites)
import { expect, test } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectRadiusModes,
  collectBorderwidthModes,
  collectShadowModes,
} from '../utils.js';
const TOKENS = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'tokens'
);

test('radius collector returns all 5 modes incl. blunt', () => {
  const m = collectRadiusModes(TOKENS);
  expect(Object.keys(m).sort()).toEqual([
    'blunt',
    'mellow',
    'sharp',
    'smooth',
    'subtle',
  ]);
  expect(m.sharp.length).toBeGreaterThan(0);
});
test('shadow collector emits primitive-layer tokens, not the composite', () => {
  const m = collectShadowModes(TOKENS);
  expect(Object.keys(m)).toContain('maia');
  const names = m.maia.map((t) => t.cssName);
  expect(names.some((n) => n.includes('-layer-'))).toBe(true);
  expect(names).not.toContain('shadow-sm'); // composite stays in @theme
});
test('borderwidth collector returns all 5 modes', () => {
  expect(Object.keys(collectBorderwidthModes(TOKENS)).sort()).toEqual([
    'lyra',
    'maia',
    'mira',
    'nova',
    'vega',
  ]);
});
```

- [ ] **Step 2: Run — expect failure.**

Run: `pnpm test:unit packages/core/scripts/__tests__/mode-collectors.test.js`
Expected: FAIL (functions not exported).

- [ ] **Step 3: Implement the three collectors** mirroring `collectSpacingTokens` (see implementer note). Keep the cssName collision guard.

- [ ] **Step 4: Run — expect pass.**

Run: `pnpm test:unit packages/core/scripts/__tests__/mode-collectors.test.js`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add packages/core/scripts/utils.js packages/core/scripts/__tests__/mode-collectors.test.js
git commit -m "feat(core): per-mode literal collectors for radius/shadow/borderwidth"
```

---

## Task 7: Generator — emit `[data-radius]` / `[data-shadow]` / `[data-borderwidth]` blocks

**Files:**

- Modify: `packages/core/scripts/utils.js` (`generateSpacingModesCSS` → parameterized), `packages/core/scripts/generate-tailwind-package.js` (call it for the 3 new families)
- Test: `packages/core/scripts/__tests__/` generator output assertions

**Interfaces:**

- Consumes: the Task 6 collectors. Produces: `nexus.css` containing `:root, [data-radius="sharp"]{…}` + plain `[data-radius="…"]` blocks (and shadow/borderwidth), matching the existing `[data-style]` shape.

- [ ] **Step 1: Parameterize the emitter.** In `generateSpacingModesCSS` (`utils.js:893`), replace the hardcoded `[data-style]` attribute name and the `spacing-`-prefixed dedup check with an `attrName` + `prefix` parameter (default to the spacing values so the existing call is unchanged). Confirm the existing spacing test still passes after the refactor.

- [ ] **Step 2: Write failing generator tests.**

```js
import { expect, test } from 'vitest'; // co-locate with the existing generate-tailwind-package.test.js
test('nexus.css emits all three new attribute families with defaults on :root', () => {
  const css = /* run the generator, read packages/tailwind/nexus.css */;
  expect(css).toMatch(/:root,\s*\[data-radius="sharp"\]/);
  expect(css).toMatch(/\[data-shadow="maia"\]/);
  expect(css).toMatch(/\[data-borderwidth="vega"\]/);
  expect(css).toContain('[data-radius="blunt"]'); // emit-all (Decision 4)
});
test('no emitted block uses light-dark() (Safari 15.4 floor)', () => {
  const css = /* nexus.css */;
  expect(css).not.toContain('light-dark(');
});
test('each mode block for a family declares the same variable names', () => {
  // collect var names per [data-radius] block; assert set-equality across modes
});
```

- [ ] **Step 3: Run — expect failure.**

Run: `pnpm test:unit packages/core/scripts/__tests__/generate-tailwind-package.test.js`
Expected: FAIL.

- [ ] **Step 4: Wire the three families into `generate-tailwind-package.js`** — call the parameterized emitter with each collector's map + its `attrName` (`data-radius`/`data-shadow`/`data-borderwidth`) + default mode (`sharp`/`maia`/`vega`, matching `DEFAULT_CONFIG`). Shadow uses the themed (light/dark) path; radius/borderwidth are un-themed.

- [ ] **Step 5: Run generator + tests — expect pass; verify no-attribute defaults still resolve.**

Run: `pnpm --filter @nexus/core build:tailwind && pnpm test:unit packages/core/scripts/__tests__/generate-tailwind-package.test.js`
Expected: PASS; `nexus.css` contains the new blocks; `light-dark(` absent.

- [ ] **Step 6: Commit.**

```bash
git add packages/core/scripts packages/tailwind
git commit -m "feat(core): emit data-radius/data-shadow/data-borderwidth mode blocks"
```

---

## Task 8: Bundling — Vite multi-entry, exports, core external/peer, size-limit

**Files:**

- Create: `packages/react/src/appearance/index.ts` (temporary empty entry stub; Task 9 replaces it with real exports)
- Modify: `packages/react/vite.config.ts`, `packages/react/package.json`, root `package.json`

**Interfaces:**

- Produces: an empty-but-buildable `dist/appearance.mjs` + `dist/appearance.d.ts` entry. `NexusAppearanceProvider` resolves from that entry after Task 9 replaces the stub exports.

- [ ] **Step 1: Create the temporary appearance entry stub.** Create `packages/react/src/appearance/index.ts` with no public exports yet (a short comment is fine). This makes the multi-entry build runnable before provider/UI implementation. Task 9 owns replacing the stub with real exports.

- [ ] **Step 2: Multi-entry + fix the fileName collision (blocker B1).** In `vite.config.ts`:
  - `build.lib.entry` → `{ index: 'src/index.ts', appearance: 'src/appearance/index.ts' }`.
  - `build.lib.fileName` → `(format, entryName) => \`${entryName}.${format === 'es' ? 'mjs' : 'js'}\``(was hardcoded`index`).
  - Pin `build.lib.cssFileName: 'react'` (so `cssCodeSplit:false` + multi-entry still emits `dist/react.css`).
  - Add `@nexus/core` to `rollupOptions.external` (keep the existing react + optional-peer externals).

- [ ] **Step 3: Build — verify both entries emit and core is NOT bundled.**

Run: `pnpm --filter @nexus/react build`
Expected: `dist/index.mjs`, `dist/appearance.mjs`, `dist/appearance.d.ts`, `dist/react.css` all present. Then:

Run: `! rg -q "createNexusThemeContract|deriveTheme" packages/react/dist/index.mjs`
Expected: PASS (engine not in the main barrel).

- [ ] **Step 4: package.json wiring (blocker B1).** In `packages/react/package.json`:
  - `exports['./appearance']` → `{ "types": "./dist/appearance.d.ts", "import": "./dist/appearance.mjs", "require": "./dist/appearance.js" }`.
  - Add `peerDependencies['@nexus/core']: "workspace:*"` and `peerDependenciesMeta['@nexus/core'].optional: true` (keep it in `devDependencies` for Storybook). Update the stale `//` note that claims core never reaches the published bundle.
  - Then run `pnpm install` to refresh the lockfile for the new peer entry (the workspace symlink already exists via the devDep, but the lockfile must record the peer).

- [ ] **Step 5: size-limit entry (should-fix S4/F10).** In root `package.json` `size-limit`, add:

```json
{
  "name": "@nexus/react/appearance (ESM)",
  "path": "packages/react/dist/appearance.mjs",
  "ignore": ["@nexus/core", "react", "react-dom"],
  "limit": "20 kB"
}
```

(`ignore: ['@nexus/core']` because Decision 1 keeps it external; the 20 kB target is provisional — tighten once the UI lands.)

- [ ] **Step 6: Verify the main barrel budget is unmoved + the new entry passes.**

Run: `pnpm size-limit`
Expected: `@nexus/react (ESM)` still ≤ 88 kB (assert it did not jump from the entry split — blocker-adjacent B4), `appearance (ESM)` ≤ 20 kB.

- [ ] **Step 7: Commit.**

```bash
git add packages/react/src/appearance/index.ts packages/react/vite.config.ts packages/react/package.json package.json
git commit -m "build(react): multi-entry appearance bundle + external @nexus/core"
```

---

## Task 9: Provider + `useNexusAppearance` (SSR-safe, single-root)

**Files:**

- Create: `packages/react/src/appearance/provider.tsx`, `packages/react/src/appearance/provider.test.tsx`
- Modify: `packages/react/src/appearance/index.ts` (replace the Task 8 stub with real exports)

**Interfaces:**

- Consumes: `createNexusThemeContract`, `deriveTheme`, `themeToCss`, `appearancePrefsToCss`, `sanitizeNexusAppearance`, `DEFAULT_NEXUS_APPEARANCE`, `NexusAppearanceState` from `@nexus/core`.
- Produces: `NexusAppearanceProvider` (props: `state?`, `defaultState?`, `onStateChange?`, `storageKey?: string | false`), `useNexusAppearance(): { state; setState; ... }`.

> **Behavior rules (Decisions 2, 6, should-fix A7):** controlled when `state` is provided (parent owns persistence via `onStateChange`; provider does NOT write storage); uncontrolled otherwise (provider owns `storageKey`, default `'nexus-appearance'`; `storageKey={false}` disables). Apply `.dark`, `data-style` (density), `data-radius` (corners), `data-shadow` (elevation), `data-borderwidth` (stroke) to `document.documentElement`. Inject `themeToCss(deriveTheme(createNexusThemeContract(state)))` and `appearancePrefsToCss(state.prefs)` as two **stable** `<style>` tags (replace content in place — exactly one tag each, no duplicates on re-render). `mode:'system'` resolves via `matchMedia('(prefers-color-scheme: dark)')` in an effect (persist `'system'` verbatim). Also set the `color-scheme` CSS property on `documentElement` to the resolved `light`/`dark` (so native form controls, scrollbars, and the canvas background match — the console does this via `syncColorSchemeMeta`, `theme-provider.tsx:41-49,76`). All `window`/`document`/`matchMedia` access lives in effects or in a guarded `useState` initializer (SSR-safe).

- [ ] **Step 1: Write failing hook tests** via `renderHook` + wrapper (Phase-B-legal vehicle — NOT a story).

```ts
// provider.test.tsx
import { act, renderHook } from '@nexus/test-utils';
import { NexusAppearanceProvider, useNexusAppearance } from './provider';

const wrapper = ({ children }) => <NexusAppearanceProvider storageKey={false}>{children}</NexusAppearanceProvider>;

it('applies the 5 documentElement attributes for the active state', () => {
  renderHook(() => useNexusAppearance(), { wrapper });
  const el = document.documentElement;
  expect(el.getAttribute('data-style')).toBe('mira');
  expect(el.getAttribute('data-radius')).toBe('sharp');
  expect(el.getAttribute('data-shadow')).toBe('maia');
  expect(el.getAttribute('data-borderwidth')).toBe('vega');
});

it('injects exactly one theme style tag (idempotent on re-render)', () => {
  const { result, rerender } = renderHook(() => useNexusAppearance(), { wrapper });
  act(() => result.current.setState((s) => ({ ...s, brandColor: '#ff0000' })));
  rerender();
  expect(document.querySelectorAll('style[data-nexus-appearance-theme]')).toHaveLength(1);
});

it('round-trips through storage when uncontrolled', () => {
  const key = 'test-appearance';
  const { result, unmount } = renderHook(() => useNexusAppearance(), {
    wrapper: ({ children }) => <NexusAppearanceProvider storageKey={key}>{children}</NexusAppearanceProvider>,
  });
  act(() => result.current.setState((s) => ({ ...s, surfaceTone: 'slate' })));
  unmount();
  expect(JSON.parse(localStorage.getItem(key)!).surfaceTone).toBe('slate');
});

it('resets to default on corrupt storage', () => {
  localStorage.setItem('bad', '{not json');
  const { result } = renderHook(() => useNexusAppearance(), {
    wrapper: ({ children }) => <NexusAppearanceProvider storageKey="bad">{children}</NexusAppearanceProvider>,
  });
  expect(result.current.state.surfaceTone).toBe('stone');
});

it('system mode follows matchMedia (override the global mock)', () => {
  // setup.ts hardcodes matches:false → define a matchMedia returning matches:true with a capturable listener
  // assert .dark is applied; then assert the change listener flips it.
});
```

- [ ] **Step 2: Run — expect failure.**

Run: `pnpm test:unit packages/react/src/appearance/provider.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement the provider** by promoting the application logic from `apps/console/src/app/theme-provider.tsx` (the `useState(load…)` initializer, the apply-attributes effect, the `<style>`-injection effect, the `matchMedia` effect at 79–83 incl. listener cleanup), refactored to:
  - read/derive from `NexusAppearanceState` (not the console's two-blob contract+prefs),
  - support controlled/uncontrolled per the behavior rules,
  - tag the two style elements with stable `data-nexus-appearance-theme` / `data-nexus-appearance-prefs` attributes and replace `.textContent` in place,
  - guard the `matchMedia` system test by **defining** `window.matchMedia` in the test (raw jsdom leaves it undefined; the shared mock at `packages/test-utils/src/setup.ts:21` hardcodes `matches:false`).

- [ ] **Step 4: Run — expect pass.**

Run: `pnpm test:unit packages/react/src/appearance/provider.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add packages/react/src/appearance/provider.tsx packages/react/src/appearance/provider.test.tsx packages/react/src/appearance/index.ts
git commit -m "feat(react): NexusAppearanceProvider + useNexusAppearance"
```

---

## Task 10: Editor UI — settings panel, quick control, internal fields

**Files:**

- Create: `packages/react/src/appearance/{appearance-settings,theme-quick-control,color-field,setting-row,config-preview}.tsx`; export from `src/appearance/index.ts`.

**Interfaces:**

- Consumes: `useNexusAppearance` (Task 9), the `*_OPTIONS` maps (Task 1). Produces: `NexusAppearanceSettings`, `NexusThemeQuickControl` (prop `onCustomize?: () => void`).

> **Promotion rules:** promote from `apps/console/src/modules/design-system/settings/Appearance{Settings,ColorField,ConfigPreview,SettingRow}.tsx`, applying: (a) source colour/layout values come from `useNexusAppearance` state + the core option maps, not console hooks; (b) **drop** the Import/Copy theme-prompt UI, the `translucentSidebar` toggle, and the `diffMarkers` control + `AppearanceConfigPreview`'s `markers` prop (Decision 3); (c) **do not import from `@nexus/react`'s main barrel** inside `src/appearance/*` — import UI primitives (Button, Select, etc.) from their local `@/components/ui/*` source paths to avoid a circular entry import; (d) `config-preview.tsx` mirrors the **applied** theme only (Decision 6). Sections to keep: Mode, Brand color, Surface tone, Contrast, Typography (fonts + sizes), Layout Feel (the 4 axes), Preferences (reduce-motion, pointer cursors, font smoothing).

- [ ] **Step 1: Build the internal field components** (`color-field` — hex-only native `<input type="color">` + regex, promoted from `AppearanceColorField.tsx`; `setting-row`; `config-preview`).

- [ ] **Step 2: Build `appearance-settings.tsx` + `theme-quick-control.tsx`** per the promotion rules. Export all public components from `src/appearance/index.ts`.

- [ ] **Step 3: Typecheck + build + lint.**

Run: `pnpm --filter @nexus/react typecheck && pnpm --filter @nexus/react build && pnpm lint`
Expected: PASS; `dist/appearance.mjs` + `dist/appearance.d.ts` emit; no main-barrel import inside `appearance/*`.

- [ ] **Step 4: Re-measure CSS + appearance bundle (should-fix S1/B4).**

Run: `pnpm size-limit`
Expected: `react.css` ≤ 30 kB, `appearance (ESM)` ≤ its budget, `index (ESM)` unchanged.

- [ ] **Step 5: Commit.**

```bash
git add packages/react/src/appearance
git commit -m "feat(react): appearance settings + quick-control editor UI"
```

> **Stories are Phase D.** Per the epic, `*.stories.tsx` + play functions + `audit:storybook-coverage` for `NexusAppearanceSettings`/`NexusThemeQuickControl` land in Phase D — do **not** run `audit:storybook-coverage` here (it resolves only `src/components/{ui,primitives}/` and would exit non-zero for `src/appearance/`).

---

## Task 11: Final verification sweep

- [ ] **Step 1: Run the full gate.**

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:unit \
  && pnpm --filter @nexus/core build && pnpm --filter @nexus/react build \
  && pnpm size-limit && pnpm audit:browser-support
```

Expected: all green. (`format:check` is a separate CI gate that lint/typecheck do not cover. No `audit:storybook-coverage` — that's Phase D.)

- [ ] **Step 2: Spot-check the package boundary.**

```bash
! rg -q "@nexus/core" packages/react/dist/index.mjs   # no match — engine stays out of the main barrel
! rg -q "light-dark\(" packages/tailwind/nexus.css     # no match — Safari floor
node -e "require.resolve('@nexus/react/appearance', { paths: ['apps/console'] })"  # resolves from dist
```

- [ ] **Step 3: Commit any final fixups; the phase is done when the gate is green and the boundary checks pass.**

---

## Self-Review (run against the council review + epic)

- **Blocker B1 (dependency wiring):** Task 8 adds `@nexus/core` to `peerDependencies` + vite `external`, fixes the `fileName` collision, pins `cssFileName`. ✔
- **Blocker B2 (generator collectors):** Task 6 writes the 3 per-mode literal collectors (template = `collectSpacingTokens`). ✔
- **Blocker B3 (shadow mechanism):** Task 6 implementer note + Task 7 emit shadow as primitive-override; Task 7 asserts no `light-dark(`. ✔
- **Blocker B4 (unrunnable audit / sequencing):** stories/audit moved to Phase D (Task 10 note); rename + console import update folded into Task 1, then audited in Task 5 with a `pnpm typecheck` gate. ✔
- **Should-fixes:** orphan type dropped + state-as-SSOT (Task 1/Decision 7); `createNexusThemeContract` spec + 5-tone parity (Task 3); compact single-key persistence (Task 9/Decision 2); generic prefs, console selectors dropped (Tasks 1/4/Decision 3); config-preview = applied-theme-only (Task 10/Decision 6); appearance size-limit number + `ignore` (Task 8); migrate console suites (Tasks 2-4 reuse those cases). ✔
- **Refuted findings deliberately NOT acted on:** no scoped serializer (Decision 6), core stays optional-peer not hard-required (Decision 1), emit-all kept (Decision 4). ✔
- **Placeholder scan:** generator collector/emitter bodies are specified by template-reference (the implementer reads `collectSpacingTokens` + `shadow-maia.css`) rather than fabricated — this is deliberate, to avoid inventing internals not yet read. All test code is concrete.
- **Type consistency:** `NexusAppearanceState` (editor SSOT) vs `NexusThemeContract` (engine `appearance`-bearing contract, = renamed `CodexThemeContract`) vs `ThemeDerivationInput` (what `createNexusThemeContract` returns + `deriveTheme` consumes) are used consistently across Tasks 1, 3, 9.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review between tasks.
2. **Inline Execution** — execute tasks in this session with checkpoints.

**Dependency order:** Tasks 1→2→3→4 (core model, sequential), Tasks 6→7 (generator), and Task 8 (bundling stub + package wiring) are independent tracks; Task 5 audits Task 1; Tasks 9→10 follow 1+8; Task 11 is last. Tasks 1, 6, and 8 can start in parallel because Task 8 creates its own temporary `appearance/index.ts` stub.
