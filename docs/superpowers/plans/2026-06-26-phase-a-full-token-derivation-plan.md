# Phase A — Full-Token Derivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@nexus/core`'s `deriveTheme` so its emitted `--nx-color-*` set **equals** the curated base+brand set — every token derived from the contract, none cascading from static CSS.

**Architecture:** Generalize the existing `derivePrimary` into one reusable `deriveFamily` (ramp + APCA on-color) and apply it to primary, secondary, and the four status families. Add a fixed colorblind-safe chart set, a fixed-opacity alpha formula, and a per-mode surface-step model (stepped dark / flat light). A token-parity test makes "every curated key is derived" a hard invariant.

**Tech Stack:** TypeScript, culori + apca-w3, vitest (`pnpm test:unit`). All work is in `packages/core/src/lib/`.

## Global Constraints

- **APCA gate:** every text/surface pair clears its tier floor (`TIER_THRESHOLDS`); never throws (snap to black/white endpoint).
- **No `light-dark()`** in emitted CSS — `themeToCss` stays `:root` / `:root.dark`.
- **`deriveTheme` returns DATA** (`TokenMap`); `themeToCss` is the only web applier. Don't fold serialization into derivation.
- **No new contract inputs** — `{ appearance, light/dark:{accent,background,foreground}, contrast }` is frozen.
- **Tests:** core unit tests live in `packages/core/src/lib/*.test.ts`, import `{ describe, expect, it } from 'vitest'`, run via `pnpm test:unit`.
- **Canonical status seeds** (curated `*-600`, the solid backgrounds): success `oklch(0.62 0.2233 140.055)`, warning `oklch(0.62 0.2044 41.116)`, error `oklch(0.577 0.2523 27.926)`, information `oklch(0.546 0.2205 255.276)`.

---

### Task 1: Generalize `derivePrimary` → `deriveFamily`

**Files:**

- Modify: `packages/core/src/lib/derive-theme.ts` (the `derivePrimary` function, ~lines 199–216)
- Test: `packages/core/src/lib/derive-theme.test.ts`

**Interfaces:**

- Produces: `deriveFamily(name: string, seedHex: string, mode: Mode, opts?: { borders?: boolean }): TokenMap` — emits `--nx-color-${name}-{background,background-hover,background-active,foreground,disabled,subtle,subtle-foreground,subtle-hover,subtle-active}` and, when `opts.borders !== false`, `--nx-color-border-${name}` + `--nx-color-border-${name}-active`.
- `derivePrimary(accentHex, mode)` becomes `deriveFamily('primary', accentHex, mode)`.

- [ ] **Step 1: Write the failing test** (primary output must be byte-identical after the refactor)

```ts
// in derive-theme.test.ts
import { deriveFamily, derivePrimary } from './derive-theme';

it('deriveFamily("primary") equals the previous derivePrimary output', () => {
  const accent = '#2563eb';
  expect(deriveFamily('primary', accent, 'light')).toEqual(
    derivePrimary(accent, 'light')
  );
  expect(deriveFamily('primary', accent, 'dark')).toEqual(
    derivePrimary(accent, 'dark')
  );
});

it('deriveFamily omits border tokens when borders:false', () => {
  const out = deriveFamily('secondary', '#888888', 'light', { borders: false });
  expect(out['--nx-color-border-secondary']).toBeUndefined();
  expect(out['--nx-color-secondary-background']).toBeTruthy();
});
```

- [ ] **Step 2: Run to verify it fails** — `pnpm test:unit derive-theme` → FAIL (`deriveFamily` not exported).

- [ ] **Step 3: Implement** — replace the body of `derivePrimary` with a generic deriver:

```ts
export function deriveFamily(
  name: string,
  seedHex: string,
  mode: Mode,
  opts: { borders?: boolean } = {}
): TokenMap {
  const ramp = rampFromSeed(seedHex);
  const dark = mode === 'dark';
  const p = `--nx-color-${name}`;
  const out: TokenMap = {
    [`${p}-background`]: ramp['600'],
    [`${p}-background-hover`]: ramp['700'],
    [`${p}-background-active`]: ramp['800'],
    [`${p}-foreground`]: readableOn(ramp['600']),
    [`${p}-disabled`]: dark ? ramp['950'] : ramp['300'],
    [`${p}-subtle`]: dark ? ramp['950'] : ramp['50'],
    [`${p}-subtle-foreground`]: dark ? ramp['300'] : ramp['600'],
    [`${p}-subtle-hover`]: dark ? ramp['900'] : ramp['100'],
    [`${p}-subtle-active`]: dark ? ramp['800'] : ramp['200'],
  };
  if (opts.borders !== false) {
    out[`--nx-color-border-${name}`] = dark ? ramp['700'] : ramp['200'];
    out[`--nx-color-border-${name}-active`] = dark ? ramp['500'] : ramp['400'];
  }
  return out;
}

export const derivePrimary = (accentHex: string, mode: Mode): TokenMap =>
  deriveFamily('primary', accentHex, mode);
```

- [ ] **Step 4: Run to verify it passes** — `pnpm test:unit derive-theme` → PASS.

- [ ] **Step 5: Commit** — `git commit -am "refactor(core): generalize derivePrimary into deriveFamily"`

---

### Task 2: Add the `secondary` family (neutral-derived)

**Files:** Modify `derive-theme.ts` (`deriveMode`); Test: `derive-theme.test.ts`

**Interfaces:** Consumes `deriveFamily` (Task 1). Secondary has **no border tokens** (curated has no `border-secondary`) → pass `{ borders: false }`. Seed = the background seed (neutral counterpart to primary).

- [ ] **Step 1: Failing test**

```ts
it('derives a secondary family from the background seed, no border tokens', () => {
  const { light } = deriveTheme({
    appearance: 'light',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  expect(light['--nx-color-secondary-background']).toBeTruthy();
  expect(light['--nx-color-secondary-foreground']).toBeTruthy();
  expect(light['--nx-color-border-secondary']).toBeUndefined();
});
```

- [ ] **Step 2: Run → FAIL** (`secondary-background` undefined).

- [ ] **Step 3: Implement** — in `deriveMode`, add secondary off the background seed:

```ts
function deriveMode(seeds: ThemeSeeds, mode: Mode, contrast: number): TokenMap {
  const delta = contrastDelta(contrast);
  const surfaces = deriveSurfaces(seeds.background, mode, delta);
  const text = deriveText(seeds.foreground, surfaces);
  const primary = deriveFamily('primary', seeds.accent, mode);
  const secondary = deriveFamily('secondary', seeds.background, mode, {
    borders: false,
  });
  return { ...surfaces, ...text, ...primary, ...secondary };
}
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): derive the secondary family from the neutral seed"`

---

### Task 3: Add the four status families (fixed canonical hues)

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** Consumes `deriveFamily`. Add module constant `STATUS_SEEDS`. Status families **have** borders.

- [ ] **Step 1: Failing test** (keys present + APCA on background and subtle)

```ts
import { apcaLc } from './apca';
import { TIER_THRESHOLDS } from './palette';

it('derives all four status families, APCA-legible on background and subtle', () => {
  const { dark } = deriveTheme({
    appearance: 'dark',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  for (const s of ['success', 'warning', 'error', 'information']) {
    const fg = dark[`--nx-color-${s}-foreground`];
    expect(
      apcaLc(fg, dark[`--nx-color-${s}-background`])
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
    expect(dark[`--nx-color-${s}-subtle-foreground`]).toBeTruthy();
    expect(dark[`--nx-color-border-${s}`]).toBeTruthy();
  }
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement** — add the constant and fold status into `deriveMode`:

```ts
const STATUS_SEEDS: Record<string, string> = {
  success: 'oklch(0.62 0.2233 140.055)', // green-600
  warning: 'oklch(0.62 0.2044 41.116)', // orange-600
  error: 'oklch(0.577 0.2523 27.926)', // red-600
  information: 'oklch(0.546 0.2205 255.276)', // blue-600
};

// in deriveMode, after `secondary`:
const status = Object.entries(STATUS_SEEDS).flatMap(([name, seed]) =>
  Object.entries(deriveFamily(name, seed, mode))
);
return {
  ...surfaces,
  ...text,
  ...primary,
  ...secondary,
  ...Object.fromEntries(status),
};
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): derive the four status families from fixed canonical hues"`

---

### Task 4: Per-mode surface-step model (flat light)

**Files:** Modify `deriveSurfaces` in `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** In `light`, `container` / `container-hover` / `container-active` / `popover` / `popover-hover` / `popover-active` / `muted` collapse to step 0 (flat — equal to background L); in `dark`, keep current steps.

- [ ] **Step 1: Failing test**

```ts
it('light surfaces are flat (container/popover == background L); dark stays stepped', () => {
  const c = {
    appearance: 'light' as const,
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  };
  const { light, dark } = deriveTheme(c);
  expect(light['--nx-color-container']).toBe(light['--nx-color-background']);
  expect(light['--nx-color-popover']).toBe(light['--nx-color-background']);
  expect(dark['--nx-color-container']).not.toBe(dark['--nx-color-background']);
});
```

- [ ] **Step 2: Run → FAIL** (light container is currently stepped).

- [ ] **Step 3: Implement** — in `deriveSurfaces`, zero the elevation steps in light:

```ts
const FLAT_IN_LIGHT = new Set([
  'container',
  'container-hover',
  'container-active',
  'popover',
  'popover-hover',
  'popover-active',
  'muted',
]);
// inside the for-loop, before computing L:
const step = mode === 'light' && FLAT_IN_LIGHT.has(token) ? 0 : rawStep;
```

(Rename the loop variable: `for (const [token, rawStep] of Object.entries(SURFACE_STEPS))`.)

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): flat light surfaces, stepped dark (per-mode surface model)"`

---

### Task 5: Fixed colorblind-safe chart-categorical set

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** Add `CHART_LIGHT` / `CHART_DARK` constants (5 each) and emit `--nx-color-chart-categorical-{1..5}` per mode. Values are the existing audited set: light = teal-600 / lime-700 / orange-600 / rose-600 / indigo-600; dark = teal-200 / lime-200 / orange-200 / rose-200 / indigo-200.

- [ ] **Step 1: Provenance check** — the constant values below are the curated set read from `color.css`; verify they still match before encoding:
      `grep -E '\--nx-color-(teal-600|lime-700|orange-600|rose-600|indigo-600|teal-200|lime-200|orange-200|rose-200|indigo-200):' apps/console/public/themes/color.css`

- [ ] **Step 2: Failing test**

```ts
it('emits the fixed 5-color chart set, distinct per mode', () => {
  const { light, dark } = deriveTheme({
    appearance: 'light',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  for (let i = 1; i <= 5; i++) {
    expect(light[`--nx-color-chart-categorical-${i}`]).toBeTruthy();
    expect(dark[`--nx-color-chart-categorical-${i}`]).toBeTruthy();
  }
  expect(light['--nx-color-chart-categorical-1']).not.toBe(
    dark['--nx-color-chart-categorical-1']
  );
});
```

- [ ] **Step 3: Implement** — constants + emit in `deriveMode`:

```ts
const CHART_LIGHT = [
  'oklch(0.62 0.1405 184.704)', // teal-600
  'oklch(0.61 0.1871 131.589)', // lime-700
  'oklch(0.62 0.2044 41.116)', // orange-600
  'oklch(0.58 0.2489 17.585)', // rose-600
  'oklch(0.49 0.2912 276.966)', // indigo-600
];
const CHART_DARK = [
  'oklch(0.9 0.1682 180.426)', // teal-200
  'oklch(0.93 0.2278 124.321)', // lime-200
  'oklch(0.91 0.0819 70.697)', // orange-200
  'oklch(0.885 0.0771 10.001)', // rose-200
  'oklch(0.865 0.069 274.039)', // indigo-200
];
function deriveChart(mode: Mode): TokenMap {
  const set = mode === 'dark' ? CHART_DARK : CHART_LIGHT;
  return Object.fromEntries(
    set.map((v, i) => [`--nx-color-chart-categorical-${i + 1}`, v])
  );
}
// add `...deriveChart(mode)` to deriveMode's return
```

- [ ] **Step 4: Run → PASS**, then `pnpm --filter @nexus/core audit:colorblind` → green (the set is already audited).
- [ ] **Step 5: Commit** — `git commit -am "feat(core): emit the fixed colorblind-safe chart-categorical set"`

---

### Task 6: Alpha / translucent tokens

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** Emit `--nx-color-overlay`, `--nx-color-popover-backdrop`, `--nx-color-border-default-alpha`, `--nx-color-background-hover-alpha`, `--nx-color-popover-alpha`. Formula: the neutral seed's hue/chroma at a fixed dark lightness + a fixed per-token α (from the curated `*-a*` primitives): overlay α `0.7529`, popover-backdrop α `0.9098`, border-default-alpha α `0.0941`, background-hover-alpha α `0.0627`; `popover-alpha` is white at α `0.9098`.

- [ ] **Step 1: Failing test**

```ts
it('emits translucent tokens with the expected alphas', () => {
  const { dark } = deriveTheme({
    appearance: 'dark',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  expect(dark['--nx-color-overlay']).toMatch(/\/ 0\.7529\)$/);
  expect(dark['--nx-color-popover-backdrop']).toMatch(/\/ 0\.9098\)$/);
  expect(dark['--nx-color-border-default-alpha']).toMatch(/\/ 0\.0941\)$/);
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement** — seed hue/chroma from the background, fixed dark L:

```ts
function deriveAlpha(backgroundHex: string): TokenMap {
  const s = seedOklch(backgroundHex);
  const c = (s.c ?? 0).toFixed(4),
    h = (s.h ?? 0).toFixed(1);
  const tint = (a: number) => `oklch(0.13 ${c} ${h} / ${a})`;
  return {
    '--nx-color-overlay': tint(0.7529),
    '--nx-color-popover-backdrop': tint(0.9098),
    '--nx-color-border-default-alpha': tint(0.0941),
    '--nx-color-background-hover-alpha': tint(0.0627),
    '--nx-color-popover-alpha': 'oklch(1 0 0 / 0.9098)',
  };
}
// add `...deriveAlpha(seeds.background)` to deriveMode's return
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): derive translucent/alpha tokens from the neutral seed"`

---

### Task 7: Token-parity invariant (derived keys == curated keys)

**Files:** Test: `packages/core/src/lib/derive-theme.parity.test.ts` (new)

**Interfaces:** Consumes `deriveTheme`. Reads the curated key set from `apps/console/public/themes/base-slate.css` + `brands-blue.css` (the canonical full set), filtered to `--nx-color-*` **semantic** keys (exclude primitive ramps `*-50..950` / `*-a*` and the `chart-categorical` which we now own).

- [ ] **Step 1: Write the test** — it will fail on any missing key, which is the point:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveTheme } from './derive-theme';

const PRIMITIVE = /-(50|100|200|300|400|500|600|700|800|900|950|base|a\d+)$/;
function curatedKeys(): Set<string> {
  const css = ['base-slate', 'brands-blue']
    .map((f) => readFileSync(`apps/console/public/themes/${f}.css`, 'utf8'))
    .join('\n');
  const keys = new Set<string>();
  for (const m of css.matchAll(/(--nx-color-[\w-]+):/g)) {
    const k = m[1];
    if (!PRIMITIVE.test(k)) keys.add(k);
  }
  return keys;
}

it('deriveTheme emits every curated semantic --nx-color-* key', () => {
  const { light } = deriveTheme({
    appearance: 'light',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  const derived = new Set(Object.keys(light));
  const missing = [...curatedKeys()].filter((k) => !derived.has(k));
  expect(missing).toEqual([]);
});
```

- [ ] **Step 2: Run → FAIL**, listing whatever keys remain underived (e.g. `control-thumb` edge cases, `nav-border`). Fix each by adding it to the relevant deriver (e.g. `nav-border` to `SURFACE_STEPS`, `disabled-foreground` already present). Iterate until `missing` is `[]`.

- [ ] **Step 3: Run → PASS.**
- [ ] **Step 4: Commit** — `git commit -am "test(core): assert deriveTheme emits the full curated token set"`

---

### Task 8: Extend the APCA legibility sweep + colorblind

**Files:** Modify the legibility sweep in `derive-theme.test.ts`

**Interfaces:** The existing free-form-contract sweep must also assert status `-foreground` on `-background` AND on `-subtle`, and `secondary-foreground` on `secondary-background`, across the sweep's seed matrix, at the tier thresholds.

- [ ] **Step 1: Extend the sweep** — inside the existing loop over seed contracts/modes, add:

```ts
for (const fam of ['success', 'warning', 'error', 'information', 'secondary']) {
  const bg = tokens[`--nx-color-${fam}-background`];
  const fg = tokens[`--nx-color-${fam}-foreground`];
  expect(apcaLc(fg, bg)).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
}
```

- [ ] **Step 2: Run → PASS** (status uses readable on-color; if any fail, the `readableOn` fallback already guarantees the higher-contrast endpoint).
- [ ] **Step 3: Commit** — `git commit -am "test(core): extend APCA sweep to status + secondary families"`

---

### Task 9: Tone-seed calibration (the parity cutover gate)

**Files:** Test: `packages/core/src/lib/tone-parity.test.ts` (new); data: a `TONE_SEEDS` constant (in `derive-theme.ts` or a sibling) holding the 5 calibrated seeds.

**Interfaces:** For each named tone, the derived surfaces must be within tolerance of today's curated values (extracted as in the `curated-vs-engine-tones` artifact). This is the gate that authorizes deleting a tone's static CSS (in Phase D).

- [ ] **Step 1: Encode the curated reference** — reuse the extraction from `reports/curated-vs-engine-tones.html` (or re-run the `/tmp/extract-tones.mjs` approach) to get curated `{background,muted,container,popover,border-default}` per tone/mode. Commit them as a fixture `tone-curated.fixture.json`.

- [ ] **Step 2: Write the parity test** (tolerance ΔL ≤ 0.04 on dark surfaces; light is flat by Q4 so background drives it):

```ts
import curated from './tone-curated.fixture.json'; // the Step 1 fixture
const parseL = (s: string) => Number(s.match(/oklch\(([\d.]+)/)![1]);

it.each(['slate', 'neutral', 'zinc', 'gray', 'stone'])(
  'engine reproduces the %s tone within tolerance (dark)',
  (tone) => {
    const seed = TONE_SEEDS[tone]; // calibrated { light:{bg,fg}, dark:{bg,fg} }
    const { dark } = deriveTheme({
      appearance: 'dark',
      light: seed.light,
      dark: seed.dark,
      contrast: TONE_CONTRAST,
    });
    for (const tok of ['container', 'popover', 'muted']) {
      const dl = Math.abs(
        parseL(dark[`--nx-color-${tok}`]) - parseL(curated[tone].dark[tok])
      );
      expect(dl).toBeLessThanOrEqual(0.04);
    }
  }
);
```

- [ ] **Step 3: Calibrate** — start `TONE_SEEDS[tone]` = the curated background/foreground for that tone; run the test; if a surface exceeds tolerance, adjust `TONE_CONTRAST` (curated dark sits near Δ≈0.09 → contrast ≈ 90) and/or the seed L until green. Record any tone that can't be matched as a follow-up (it keeps its curated CSS).

- [ ] **Step 4: Run → PASS** for every matchable tone.
- [ ] **Step 5: Commit** — `git commit -am "feat(core): calibrate the 5 tone seeds + parity gate for static-CSS cutover"`

---

## Done when

- `pnpm test:unit` green, including the parity invariant (Task 7) and the extended APCA sweep (Task 8).
- `pnpm --filter @nexus/core audit:colorblind` green.
- `pnpm typecheck && pnpm lint` clean.
- A `deriveTheme` call emits **every** curated semantic `--nx-color-*` key — verified, not asserted by hand.

Phase B (packaging) consumes this surface; do not start it until Task 7 is green (the token set is the public contract B freezes).
