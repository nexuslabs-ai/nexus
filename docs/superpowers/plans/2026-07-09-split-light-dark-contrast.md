# Split Light & Dark Contrast Controls — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single global `contrast: number` appearance knob with two independent scalars — `lightContrast` and `darkContrast` — so the dark theme's surface separation can be tuned without moving the light theme.

**Architecture:** Appearance **state** carries two flat scalars (`lightContrast` / `darkContrast`), matching the codebase's existing flat "one knob, two variants" precedent (`uiFont`/`codeFont`, `uiFontSize`/`codeFontSize`). The theme **engine** keeps a single change point: `ThemeDerivationInput.contrast` becomes `{ light: number; dark: number }`, and `deriveTheme` feeds the light value to the light-mode derivation and the dark value to the dark-mode derivation. `deriveMode` itself is unchanged (it already takes a per-mode `contrast: number` as its 4th arg). The `createNexusThemeContract` state→input translator is the one place that bridges the flat state to the nested engine input.

**Tech Stack:** TypeScript, Vitest (`unit` + `storybook` projects), Storybook 10 (play-function tests), React, Tailwind v4 (`nx:` prefix), pnpm workspaces (`@nexus_ds/core`, `@nexus_ds/react`).

## Global Constraints

- **Defaults stay `60/60`.** `DEFAULT_NEXUS_APPEARANCE.lightContrast = 60`, `darkContrast = 60`. This PR is a **model/control split, not a visual retune** — at `60/60` every derived token is byte-identical to today (`CONTRAST_ANCHOR = 60`), so all value oracles must remain green with **zero** regeneration.
- **No migration, no shim, no dual API** (pre-production; `project-stage.md`). The sanitizer does **not** preserve the old scalar `contrast` key — a stale persisted `{ contrast: 72 }` lacks the new fields and resets to `60/60`.
- **Bump `SNAPSHOT_VERSION` `3 → 4`.** The first-paint bootstrap (`appearance-snapshot.ts:224`) paints a stored snapshot's prebuilt `themeCss` whenever `p.version === current` — _before_ the provider re-derives. A stale version-3 snapshot (its `themeCss` baked from the old single-contrast engine at a non-default value) would flash old CSS on first paint. Bumping the version makes the bootstrap reject it and paint fresh `60/60`. This is clean invalidation, **not** migration.
- **Two reshape buckets — do not confuse them:**
  - A `contrast:` literal inside a **`ThemeDerivationInput`** (engine input / test fixtures / `deriveTheme({...})` calls) → `contrast: { light: N, dark: N }`.
  - A `contrast:` literal inside a **`NexusAppearanceState`** (default, sanitizer, UI, snapshot/cookie test states) → two flat fields `lightContrast: N, darkContrast: N`.
- **`nx:` prefix** on every Tailwind utility; **semantic tokens only** (`components.md`, `shadcn-divergences.md`).
- **Every flagged issue lands in this PR** (`no-follow-up-deferral.md`) — this includes docs and Storybook, not just core + UI.
- **Run the WHOLE `pnpm test:unit`** for the core gate (both parity oracles live there), and `pnpm test:storybook` + `pnpm build-storybook` for the React gate — neither typecheck covers `.storybook/`.
- Run `pnpm format:check` before the final commit.

---

## File Structure

**Source — modify:**

- `packages/core/src/lib/derive-theme.ts` — `ThemeDerivationInput.contrast` type (`:25`); `deriveTheme` two call sites (`:717-718`). `deriveMode` unchanged.
- `packages/core/src/lib/appearance-model.ts` — `NexusAppearanceState` (`:30`); `DEFAULT_NEXUS_APPEARANCE` (`:108`); new `contrastOr` helper + sanitizer fields (`:301-306`); `createNexusThemeContract` (`:321`).
- `packages/core/scripts/generate-light-fixture.mjs` — input literal (`:74`).
- `packages/core/src/lib/appearance-snapshot.ts` — `SNAPSHOT_VERSION` `3 → 4` (`:10`).
- `packages/react/src/components/appearance/config-preview/config-preview.tsx` — `toLines` (`:14`).
- `packages/react/src/components/appearance/appearance-settings/appearance-settings.tsx` — setters (`:171-175`), slider row (`:245-258`).
- `packages/react/.storybook/preview.tsx` — global key union (`:25-40`), keys array (`:42-53`), read (`:99-102`), write (`:150`), `initialGlobals` (`:293`).
- `apps/docs/content/theming/appearance.mdx` — model table (`:14`), prose (`:21-23`).

**Tests — modify:** `derive-theme.test.ts`, `tone-parity.test.ts`, `derive-theme.parity.test.ts`, `appearance-model.test.ts`, `appearance-snapshot.test.ts` (all in `packages/core/src/lib/`).

**Tests — create:** `packages/react/src/components/appearance/appearance-settings/AppearanceSettings.stories.tsx`, `packages/react/src/components/appearance/config-preview/ConfigPreview.stories.tsx`.

**Explicitly UNCHANGED (verify, do not edit):** `provider/provider.tsx`, `provider/server.ts`, `provider/factory.tsx` (no literal `.contrast` — the flat scalars round-trip through `sanitize`/snapshot untouched); the static token JSON under `tokens/semantic/base-*.json` and `light-tone.fixture.json` (output identical at `60/60`).

---

## Task 1: Core engine + model shape (atomic; `pnpm test:unit` green)

This is one atomic unit: the `contrast` type change cannot compile until the engine, model, and every core test fixture change together.

**Files:**

- Modify: `packages/core/src/lib/derive-theme.ts:20-26`, `:714-720`
- Modify: `packages/core/src/lib/appearance-model.ts:26-36`, `:104-122`, `:206-209` (new helper), `:288-313`, `:315-325`
- Modify: `packages/core/scripts/generate-light-fixture.mjs:74`
- Modify: `packages/core/src/lib/appearance-snapshot.ts:10` (`SNAPSHOT_VERSION`)
- Test: `packages/core/src/lib/derive-theme.test.ts` (isolation guard + reshapes), `appearance-model.test.ts`, `appearance-snapshot.test.ts`, `tone-parity.test.ts`, `derive-theme.parity.test.ts`

**Interfaces:**

- Produces: `NexusAppearanceState.lightContrast: number`, `NexusAppearanceState.darkContrast: number`; `ThemeDerivationInput.contrast: { light: number; dark: number }`; `createNexusThemeContract(state)` maps the two flat fields into `contrast: { light, dark }`.
- Consumes: `deriveMode(seeds, surfaceTone, mode, contrast: number)` (unchanged).

- [ ] **Step 1: Write the failing isolation guard** — the headline behavioral proof. Add this `describe` block to `packages/core/src/lib/derive-theme.test.ts` (it uses the NEW `{ light, dark }` shape, so it will not compile until Step 2):

```ts
describe('per-mode contrast isolation', () => {
  const seeds = {
    surfaceTone: 'slate' as const,
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
  };

  it('light contrast drives light tokens and leaves the whole dark map identical', () => {
    const baseline = deriveTheme({
      ...seeds,
      contrast: { light: 60, dark: 60 },
    });
    const lightLowered = deriveTheme({
      ...seeds,
      contrast: { light: 0, dark: 60 },
    });

    // control-background is contrast-stepped in both modes (see the
    // 'moves structure tokens as contrast changes' test above).
    expect(lightLowered.light['--nx-color-control-background']).not.toBe(
      baseline.light['--nx-color-control-background']
    );
    expect(lightLowered.dark).toEqual(baseline.dark); // whole dark map byte-identical
  });

  it('dark contrast drives dark tokens and leaves the whole light map identical', () => {
    const baseline = deriveTheme({
      ...seeds,
      contrast: { light: 60, dark: 60 },
    });
    const darkLowered = deriveTheme({
      ...seeds,
      contrast: { light: 60, dark: 0 },
    });

    expect(darkLowered.dark['--nx-color-control-background']).not.toBe(
      baseline.dark['--nx-color-control-background']
    );
    expect(darkLowered.light).toEqual(baseline.light);
  });
});
```

- [ ] **Step 2: Change the engine input type + `deriveTheme`.** In `packages/core/src/lib/derive-theme.ts`, replace the `contrast` field (`:24-25`):

```ts
/** 0–100 per mode. Separation between background↔surfaces and foreground↔text. */
contrast: {
  light: number;
  dark: number;
}
```

and the two `deriveTheme` call sites (`:717-718`):

```ts
return {
  light: deriveMode(input.light, surfaceTone, 'light', input.contrast.light),
  dark: deriveMode(input.dark, surfaceTone, 'dark', input.contrast.dark),
};
```

Leave `deriveMode`, `contrastProfile`, `clampContrast`, `CONTRAST_ANCHOR`, and `anchoredContrastLerp` untouched.

- [ ] **Step 3: Flatten the appearance state.** In `packages/core/src/lib/appearance-model.ts`:

Interface (`:30`) — replace `contrast: number;` with:

```ts
lightContrast: number;
darkContrast: number;
```

Default (`:108`) — replace `contrast: 60,` with:

```ts
  lightContrast: 60,
  darkContrast: 60,
```

Add a `contrastOr` guard next to `clampFontSize` (after `:209`), matching the file's existing `enumOr`/`boolOr` helper idiom:

```ts
const contrastOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && value >= 0 && value <= 100 ? value : fallback;
```

Sanitizer (`:301-306`) — replace the inline `contrast` block with two per-field calls (`NaN` is rejected by the range check, exactly as before):

```ts
    lightContrast: contrastOr(raw.lightContrast, d.lightContrast),
    darkContrast: contrastOr(raw.darkContrast, d.darkContrast),
```

Contract translator (`:321`) — replace `contrast: state.contrast,` with the flat→nested bridge:

```ts
    contrast: { light: state.lightContrast, dark: state.darkContrast },
```

Then bump the snapshot version — in `appearance-snapshot.ts:10`, change `SNAPSHOT_VERSION = 3` to `4` (cleanly invalidates stale first-paint snapshots per Global Constraints; the `version: typeof SNAPSHOT_VERSION` field types follow automatically).

- [ ] **Step 4: Reshape `ThemeDerivationInput` fixtures in core tests** (bucket 1 → nested `{ light: N, dark: N }`). Every `contrast:` that sits inside a `deriveTheme({...})` argument or a `ThemeDerivationInput`-typed constant:
  - `derive-theme.test.ts`: `CONTRACT` (~`:335`), `SURFACE_TONE_SEEDS` (~`:341`) → `contrast: { light: 60, dark: 60 }`; standalone literals `:367, :548, :600` → `{ light: 60, dark: 60 }`; the four `at(contrast: number)` helpers at `:435-440, :499-504, :765-770, :820-825` — change the `contrast,` shorthand to `contrast: { light: contrast, dark: contrast }` (keep the helper param a `number`); the sweep matrix `:979-994` (`[0, 60, 100].map((contrast) => deriveTheme({ ..., contrast }))`) → `contrast: { light: contrast, dark: contrast }`.
  - `tone-parity.test.ts`: leave `TONE_CONTRAST = 60` and the fixture typedef `toneContrast: number` (`:24, :58`) as numbers; at the three `deriveTheme` inputs `:251, :294, :400` change `contrast: TONE_CONTRAST` → `contrast: { light: TONE_CONTRAST, dark: TONE_CONTRAST }`.
  - `derive-theme.parity.test.ts:64`: `contrast: 60` → `contrast: { light: 60, dark: 60 }`.

  Worked example (the `at` helper at `:435-440`):

```ts
const at = (contrast: number) =>
  deriveTheme({
    surfaceTone: 'stone',
    ...SURFACE_TONE_SEEDS,
    contrast: { light: contrast, dark: contrast },
  })[mode];
```

- [ ] **Step 5: Reshape `NexusAppearanceState` fixtures + assertions in core tests** (bucket 2 → flat `lightContrast` / `darkContrast`).
  - `appearance-model.test.ts`: default `toMatchObject` (`:28`) `contrast: 60,` → `lightContrast: 60, darkContrast: 60,`; valid-passthrough state (`:108`) `contrast: 42,` → `lightContrast: 42, darkContrast: 42,`; the `contrast: 999 → 60` assertion inside `'rejects invalid brand color, contrast, and enum values'` (`:147-152`) → drive `lightContrast: 999` and assert `.lightContrast` toBe `60`; contract assertion (`:272`) `expect(contract.contrast).toBe(60)` → `expect(contract.contrast).toEqual({ light: 60, dark: 60 })`.
  - `appearance-snapshot.test.ts:154`: `contrast: 85,` → `lightContrast: 85, darkContrast: 85,` (the round-trip stays valid).
  - `appearance-snapshot.test.ts:45-46`: bump the version pin — rename the test to `'uses snapshot version 4 for split light/dark contrast'` and assert `expect(SNAPSHOT_VERSION).toBe(4)`. (The `SNAPSHOT_VERSION - 1` mismatch test at `:184` needs no change — it already proves stale-version snapshots are rejected and re-derived, which is the invalidation this bump relies on.)

- [ ] **Step 6: Add sanitizer edge-case coverage.** Append to the `describe('appearance model', ...)` block in `appearance-model.test.ts`:

```ts
describe('contrast fields', () => {
  const clean = (patch: Record<string, unknown>) =>
    sanitizeNexusAppearance({ ...DEFAULT_NEXUS_APPEARANCE, ...patch });

  it('accepts independent in-range light/dark values', () => {
    expect(clean({ lightContrast: 40, darkContrast: 80 })).toMatchObject({
      lightContrast: 40,
      darkContrast: 80,
    });
  });

  it('falls back per-field on out-of-range, NaN, and wrong type', () => {
    expect(clean({ lightContrast: 999, darkContrast: -5 })).toMatchObject({
      lightContrast: 60,
      darkContrast: 60,
    });
    expect(
      clean({ lightContrast: Number.NaN, darkContrast: 42 })
    ).toMatchObject({
      lightContrast: 60,
      darkContrast: 42,
    });
    expect(clean({ lightContrast: 'x', darkContrast: 30 })).toMatchObject({
      lightContrast: 60,
      darkContrast: 30,
    });
  });

  it('does NOT migrate the legacy scalar `contrast` key — resets to defaults', () => {
    const result = sanitizeNexusAppearance({
      mode: 'light',
      brandColor: '#0a0a0a',
      surfaceTone: 'stone',
      contrast: 85, // pre-flat persisted value; intentionally dropped (pre-production, no shim)
      density: 'default',
      corners: 'square',
      elevation: 'quiet',
      stroke: 'normal',
      prefs: DEFAULT_NEXUS_APPEARANCE.prefs,
    });
    expect(result).toMatchObject({ lightContrast: 60, darkContrast: 60 });
  });
});
```

- [ ] **Step 7: Fix the fixture generator + prove it stays byte-identical.** In `packages/core/scripts/generate-light-fixture.mjs:74`, replace `contrast: 60,` with:

```js
    contrast: { light: 60, dark: 60 },
```

Then regenerate and confirm NO diff (this proves both that `60/60` output is identical AND that the `.mjs` no longer produces a NaN fixture):

Run: `node packages/core/scripts/generate-light-fixture.mjs && git status --porcelain packages/core/src/lib/light-tone.fixture.json`
Expected: empty output (fixture unchanged).

- [ ] **Step 8: Run the full unit gate.**

Run: `pnpm test:unit && pnpm --filter @nexus_ds/core typecheck`
Expected: PASS — including `per-mode contrast isolation`, both parity oracles (`tone-parity`, `derive-theme.parity`), and `derive-theme.static-parity`.

- [ ] **Step 9: Prove the isolation guard exercises the fixed branch** (`regression-test-must-exercise-fixed-branch`). Temporarily edit `derive-theme.ts:718` to `dark: deriveMode(input.dark, surfaceTone, 'dark', input.contrast.light)` (feed light contrast to dark).

Run: `pnpm exec vitest run packages/core/src/lib/derive-theme.test.ts -t "per-mode contrast isolation"`
Expected: FAIL on `expect(darkLowered.dark[...]).not.toBe(...)` / `toEqual(baseline.light)` — confirms the guard catches cross-mode bleed. **Then revert line 718** and re-run to confirm PASS.

- [ ] **Step 10: Commit.**

```bash
git add packages/core/src/lib/derive-theme.ts packages/core/src/lib/appearance-model.ts \
  packages/core/scripts/generate-light-fixture.mjs packages/core/src/lib/*.test.ts
git commit -m "feat(core): split contrast into per-mode lightContrast/darkContrast"
```

---

## Task 2: Appearance UI — two sliders + config preview

**Files:**

- Modify: `packages/react/src/components/appearance/appearance-settings/appearance-settings.tsx:171-175`, `:245-258`
- Modify: `packages/react/src/components/appearance/config-preview/config-preview.tsx:14`

**Interfaces:**

- Consumes: `state.lightContrast`, `state.darkContrast` (from Task 1).
- Produces: two `Slider`s with accessible names `"Light contrast"` / `"Dark contrast"`; config preview renders two lines `lightContrast: N,` and `darkContrast: N,`.

- [ ] **Step 1: Split the config-preview line.** In `config-preview.tsx`, replace the `contrast` entry (`:14`) with two entries:

```ts
    { key: 'lightContrast', text: `lightContrast: ${state.lightContrast},` },
    { key: 'darkContrast', text: `darkContrast: ${state.darkContrast},` },
```

- [ ] **Step 2: Replace the single setter with two.** In `appearance-settings.tsx`, replace `setContrast` (`:171-175`):

```tsx
const setLightContrast = (values: number[]) => {
  const lightContrast = values[0];
  if (lightContrast === undefined) return;
  setState((current) => ({ ...current, lightContrast }));
};

const setDarkContrast = (values: number[]) => {
  const darkContrast = values[0];
  if (darkContrast === undefined) return;
  setState((current) => ({ ...current, darkContrast }));
};
```

- [ ] **Step 3: Replace the single slider row with two.** In `appearance-settings.tsx`, replace the `label="Contrast"` `NexusAppearanceSettingRow` (`:245-258`):

```tsx
          <NexusAppearanceSettingRow
            label="Light contrast"
            description={`${state.lightContrast}`}
          >
            <Slider
              value={[state.lightContrast]}
              onValueChange={setLightContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Light contrast"
              className="nx:w-48"
            />
          </NexusAppearanceSettingRow>

          <NexusAppearanceSettingRow
            label="Dark contrast"
            description={`${state.darkContrast}`}
          >
            <Slider
              value={[state.darkContrast]}
              onValueChange={setDarkContrast}
              min={0}
              max={100}
              step={1}
              aria-label="Dark contrast"
              className="nx:w-48"
            />
          </NexusAppearanceSettingRow>
```

- [ ] **Step 4: Typecheck.**

Run: `pnpm --filter @nexus_ds/react typecheck`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add packages/react/src/components/appearance/appearance-settings/appearance-settings.tsx \
  packages/react/src/components/appearance/config-preview/config-preview.tsx
git commit -m "feat(react): dual contrast sliders in appearance settings"
```

---

## Task 3: Storybook preview globals

`.storybook/preview.tsx` is **outside** `tsconfig include: ["src/**/*"]` — neither typecheck sees it. A green `react typecheck` does **not** mean this file is safe; only `build-storybook` / `test:storybook` do.

**Files:**

- Modify: `packages/react/.storybook/preview.tsx:25-40`, `:42-53`, `:99-102`, `:150`, `:293`

**Interfaces:**

- Consumes: `state.lightContrast`, `state.darkContrast`; `DEFAULT_NEXUS_APPEARANCE.lightContrast` / `.darkContrast`.

- [ ] **Step 1: Update the global-key union** (`:29`) — replace `| 'contrast'` with:

```ts
  | 'lightContrast'
  | 'darkContrast'
```

- [ ] **Step 2: Update the keys array** (`:46`) — replace `'contrast',` with:

```ts
  'lightContrast',
  'darkContrast',
```

- [ ] **Step 3: Update the globals→state read** (`:99-102`) — replace the `contrast:` block with two:

```ts
    lightContrast:
      typeof globals.lightContrast === 'number'
        ? globals.lightContrast
        : defaults.lightContrast,
    darkContrast:
      typeof globals.darkContrast === 'number'
        ? globals.darkContrast
        : defaults.darkContrast,
```

- [ ] **Step 4: Update the state→globals write** (`:150`) — replace `contrast: state.contrast,` with:

```ts
    lightContrast: state.lightContrast,
    darkContrast: state.darkContrast,
```

(No change needed to `appearanceStatesEqual` / the changed-globals diff: both values are numbers, so the existing `aGlobals[key] === bGlobals[key]` comparison works once the two keys are in `APPEARANCE_GLOBAL_KEYS`.)

- [ ] **Step 5: Update `initialGlobals`** (`:293`) — replace `contrast: DEFAULT_NEXUS_APPEARANCE.contrast,` with:

```ts
    lightContrast: DEFAULT_NEXUS_APPEARANCE.lightContrast,
    darkContrast: DEFAULT_NEXUS_APPEARANCE.darkContrast,
```

- [ ] **Step 6: Build Storybook (the gate that actually typechecks `preview.tsx`).**

Run: `pnpm build-storybook`
Expected: builds with no type error on `preview.tsx`.

- [ ] **Step 7: Commit.**

```bash
git add packages/react/.storybook/preview.tsx
git commit -m "feat(react): dual contrast in Storybook appearance globals"
```

---

## Task 4: Story coverage — play functions (P1: appearance UI has zero stories today)

The appearance folder has **no** `*.stories.tsx`. Per `testing-react.md` ("stories are tests"), add focused stories that prove the two-slider split: distinct accessible names, per-mode isolation, and the config-preview shape (numbers, never `[object Object]`).

**Files:**

- Create: `packages/react/src/components/appearance/appearance-settings/AppearanceSettings.stories.tsx`
- Create: `packages/react/src/components/appearance/config-preview/ConfigPreview.stories.tsx`

**Interfaces:**

- Consumes: `NexusAppearanceSettings` (renders both sliders + `NexusAppearanceConfigPreview`); `NexusAppearanceProvider` (`defaultState` prop) from `../provider`; `NexusAppearanceConfigPreview` (props `{ state, resolvedMode }`); `DEFAULT_NEXUS_APPEARANCE` from `@nexus_ds/core`.

- [ ] **Step 1: Write the AppearanceSettings stories** (Default + isolation play function). Create `AppearanceSettings.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';
import { expect, userEvent, within } from 'storybook/test';

import { NexusAppearanceProvider } from '../provider';
import { NexusAppearanceSettings } from './appearance-settings';

const meta: Meta<typeof NexusAppearanceSettings> = {
  title: 'Appearance/AppearanceSettings',
  component: NexusAppearanceSettings,
  decorators: [
    (Story) => (
      <NexusAppearanceProvider
        storageKey={false}
        defaultState={{
          ...DEFAULT_NEXUS_APPEARANCE,
          lightContrast: 60,
          darkContrast: 60,
        }}
      >
        <Story />
      </NexusAppearanceProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceSettings>;

export const Default: Story = {};

export const ContrastIsolation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Distinct accessible names (else getByRole is ambiguous / axe flags duplicates).
    const lightSlider = canvas.getByRole('slider', { name: 'Light contrast' });
    canvas.getByRole('slider', { name: 'Dark contrast' });

    // Drive the light slider down deterministically (Radix Slider handles arrows).
    lightSlider.focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');

    // Config preview proves light moved and dark held — and renders numbers, not [object Object].
    await expect(canvas.getByText('lightContrast: 58,')).toBeInTheDocument();
    await expect(canvas.getByText('darkContrast: 60,')).toBeInTheDocument();
  },
};
```

> `storageKey={false}` stops the provider from reading a prior run's `localStorage` and overriding `defaultState` across story runs (the default `storageKey` is on). `cookieWriteKey` already defaults to `false` (`provider.tsx:220`), so no cookie prop is needed.

- [ ] **Step 2: Write the ConfigPreview stories** (Default + object-shape regression). Create `ConfigPreview.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DEFAULT_NEXUS_APPEARANCE } from '@nexus_ds/core';
import { expect, within } from 'storybook/test';

import { NexusAppearanceConfigPreview } from './config-preview';

const meta: Meta<typeof NexusAppearanceConfigPreview> = {
  title: 'Appearance/ConfigPreview',
  component: NexusAppearanceConfigPreview,
  args: {
    state: { ...DEFAULT_NEXUS_APPEARANCE, lightContrast: 72, darkContrast: 40 },
    resolvedMode: 'light',
  },
};

export default meta;
type Story = StoryObj<typeof NexusAppearanceConfigPreview>;

export const Default: Story = {};

export const ObjectShapeRegression: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('lightContrast: 72,')).toBeInTheDocument();
    await expect(canvas.getByText('darkContrast: 40,')).toBeInTheDocument();
    await expect(
      canvas.queryByText(/\[object Object\]/)
    ).not.toBeInTheDocument();
  },
};
```

- [ ] **Step 3: Run the Storybook test project** (play functions + axe).

Run: `pnpm test:storybook`
Expected: PASS — both new stories, including the isolation and object-shape play functions, and no axe duplicate-label violation on the two sliders.

- [ ] **Step 4: Commit.**

```bash
git add packages/react/src/components/appearance/appearance-settings/AppearanceSettings.stories.tsx \
  packages/react/src/components/appearance/config-preview/ConfigPreview.stories.tsx
git commit -m "test(react): story coverage for dual contrast sliders + config preview"
```

---

## Task 5: Docs

**Files:**

- Modify: `apps/docs/content/theming/appearance.mdx:14`, `:21-23`

**Interfaces:** none (content only).

- [ ] **Step 1: Split the model-table row.** In `appearance.mdx`, replace the single `contrast` row (`:14`) with two (prettier will re-align the pipes on format):

```md
| `lightContrast` | `number` | Structural separation (light theme) for surfaces, borders, dividers, nav, controls, and cards. |
| `darkContrast` | `number` | Structural separation (dark theme) for surfaces, borders, dividers, nav, controls, and cards. |
```

- [ ] **Step 2: Update the prose** (`:21-23`) — replace the `contrast` paragraph with:

```md
`lightContrast` and `darkContrast` are structure controls, not text hierarchy
knobs — each tunes its own theme independently. Text may track a moving surface
enough to stay APCA-readable, but the hierarchy itself stays fixed.
```

- [ ] **Step 3: Format check.**

Run: `pnpm format:check`
Expected: PASS (or run `pnpm format` then re-check).

- [ ] **Step 4: Commit.**

```bash
git add apps/docs/content/theming/appearance.mdx
git commit -m "docs: document lightContrast/darkContrast appearance fields"
```

---

## Task 6: Changeset

**Files:**

- Create: `.changeset/split-light-dark-contrast.md`

- [ ] **Step 1: Add the changeset** (repo uses Changesets for release; a feature PR needs one).

```md
---
'@nexus_ds/core': minor
'@nexus_ds/react': minor
---

Split the appearance `contrast` control into independent `lightContrast` and `darkContrast` scalars. Theme derivation applies each mode's contrast to that mode's tokens only, so the dark theme can be tuned without moving the light theme. Snapshot version bumped to 4; stale snapshots reset to `60/60` defaults (pre-production, no migration).
```

- [ ] **Step 2: Commit.**

```bash
git add .changeset/split-light-dark-contrast.md
git commit -m "chore: changeset for split light/dark contrast"
```

---

## Final Validation (run before opening the PR)

```bash
pnpm test:unit                                  # full unit project: isolation guard + BOTH parity oracles + snapshot
pnpm test:storybook                             # appearance play functions + axe; exercises preview.tsx
pnpm build-storybook                            # the only gate that typechecks .storybook/preview.tsx
pnpm --filter @nexus_ds/core typecheck
pnpm --filter @nexus_ds/react typecheck         # NOTE: does NOT cover .storybook/ — a green result ≠ preview safe
pnpm --filter @nexus_ds/core audit:contrast     # insurance only (static tokens unchanged at 60/60)
pnpm --filter @nexus_ds/core audit:colorblind   # insurance only
pnpm format:check
```

Do **not** add a `tokens:modular` / regeneration step — no static output moves at `60/60`, and that script rewrites `package.json` as drift.

## Deliberately out of scope

- **No dark-default retune in this PR.** Defaults stay `60/60` so this is a clean, byte-identical model/control split. Tuning `darkContrast` to the value the calibrated dark shell wants (the original motivation) is tracked in **[#639](https://github.com/nexuslabs-ai/nexus/issues/639)** — a separate visual-acceptance PR. Cite `#639` in this PR's description (`no-follow-up-deferral.md`).
- **No changelog rewrite.** `apps/docs/app/changelog/page.tsx:36` is a historical release note; leave it.

## Self-Review (checked against the council findings)

- Isolation guard is asymmetric + whole-opposite-map `toEqual` + revert-proven (Task 1 Steps 1, 9). ✅
- Both parity oracles named and reshaped; full `test:unit` is the gate (Task 1 Steps 4, 8). ✅
- Sanitizer keeps per-field range/NaN validation; legacy scalar explicitly not migrated (Task 1 Steps 3, 6). ✅
- Silent-NaN fixture generator fixed and proven diff-clean (Task 1 Step 7). ✅
- Storybook `preview.tsx` updated and gated by `build-storybook` / `test:storybook` (Task 3, Task 4 Step 3). ✅
- Config-preview `[object Object]` risk removed and pinned by a play function (Task 2 Step 1, Task 4 Step 2). ✅
- Two sliders carry distinct accessible names (Task 2 Step 3, asserted Task 4 Step 1). ✅
- Docs updated (Task 5). ✅
- Public exported types (`NexusAppearanceState`, `ThemeDerivationInput`) change with the source; dist `.d.ts` covered by `typecheck` + `build-storybook`. ✅
- `SNAPSHOT_VERSION` bumped `3 → 4` so stale first-paint snapshots invalidate instead of flashing old CSS (Task 1 Steps 3, 5). ✅
- New stories pass `storageKey={false}` so `localStorage` cannot leak state across runs (Task 4 Step 1). ✅
