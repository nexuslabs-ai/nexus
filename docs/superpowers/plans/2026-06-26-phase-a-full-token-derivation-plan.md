# Phase A — Full-Token Derivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@nexus/core`'s `deriveTheme` so its emitted `--nx-color-*` set **equals** the curated base+brand+chart set — every token derived from the contract, none cascading from static CSS — verified by exact two-mode parity against `@nexus/core`'s own token source.

**Architecture:** `deriveFamily(name, ramp, mode)` builds a family from a **ramp object** + APCA on-color: primary passes `rampFromSeed(accent)` (brand-derived); the four status families pass the **fixed curated status ramps** (NOT regrubbed through `rampFromSeed`). A dedicated `deriveSecondary` emits the tone-independent neutral surface family. `deriveSurfaces` tints surface hue/chroma from `surfaceTone` with a per-mode step model (dark stepped / light base-flat). `deriveAlpha` emits the translucent tokens (tone-ink scrims) **and** the alpha-based `border-default`/`border-disabled` (contrast-ink). Chart = fixed colorblind set. A parity test asserts exact key+value equality against the core token JSON.

**Tech Stack:** TypeScript, culori + apca-w3, vitest (`pnpm test:unit`). All work in `packages/core/src/lib/`; the parity oracle is `packages/core/tokens/semantic/*.json` (never `apps/console`).

## Global Constraints

- **APCA gate:** every text/surface pair clears its tier floor (`TIER_THRESHOLDS`); never throws (snap to black/white endpoint). `-subtle-foreground` is APCA-derived, not a hoped-to-pass fixed shade.
- **No `light-dark()`** in emitted CSS — `themeToCss` stays `:root` / `:root.dark`.
- **`deriveTheme` returns DATA** (`TokenMap`); `themeToCss` is the only web applier.
- **Contract may change in Phase A; Phase B freezes the public API.** It carries `surfaceTone: 'stone'|'neutral'|'zinc'|'slate'|'gray'` (optional, default `'neutral'`) — the neutral surface family. `background` is the literal page background (white in light); the **tone**, not the background seed, supplies surface/nav/border/alpha hue+chroma.
- **Status hues are fixed and brand-independent** — emit the **curated** green/orange/red/blue ramps, don't regenerate them via `rampFromSeed` (it uses Nexus's perceptual grid, which need not match the curated primitive ramps).
- **`border-default` / `border-disabled` are ALPHA** (curated: `black-a200` light / `white-a300` dark) — contrast-ink, NOT opaque surface steps. `border-active` IS opaque (tone).
- **Parity oracle = `@nexus/core`'s own token JSON** (`packages/core/tokens/semantic/base-*.json` + brand + chart), never `apps/console/public/themes/*.css`.
- **Tests:** core unit tests live in `packages/core/src/lib/*.test.ts`, import `{ describe, expect, it } from 'vitest'`, run via `pnpm test:unit`. `git add` any NEW test/fixture file before committing (`-am` won't stage it).
- **Secondary is tone-independent neutral grey** (curated `neutral-*` in every brand) — its own deriver, not `deriveFamily`.

---

### Task 1: `deriveFamily(name, ramp, mode)` — ramp-driven, APCA subtle-foreground

**Files:** Modify `packages/core/src/lib/derive-theme.ts` (`derivePrimary`); Test: `derive-theme.test.ts`

**Interfaces:**

- `deriveFamily(name: string, ramp: Record<Shade, string>, mode: Mode): TokenMap` — takes a **ramp object** (`{ '50':…, …, '950':… }`), emits the 9 family tokens + `border-${name}`/`border-${name}-active`. `-subtle-foreground` is APCA-derived against the family's `-subtle` surface.
- `derivePrimary(accentHex, mode) = deriveFamily('primary', rampFromSeed(accentHex), mode)`.

- [ ] **Step 1: Pin current output (BEFORE refactor)** — capture real values, since an alias-equality test is tautological:

```ts
it('primary token values are unchanged by the deriveFamily refactor', () => {
  expect(derivePrimary('#2563eb', 'light')).toMatchInlineSnapshot();
  expect(derivePrimary('#2563eb', 'dark')).toMatchInlineSnapshot();
});
```

- [ ] **Step 2: Fill + freeze** — run `pnpm test:unit derive-theme -u` ONCE before touching `derivePrimary`; review the filled tokens; never `-u` again (it's now the regression guard).

- [ ] **Step 3: Implement** — ramp-driven family + APCA subtle-foreground:

```ts
import { type Shade, SHADES } from './palette';

// first ramp shade (in `order`) that clears `floor` against `bg`; else the black/white endpoint
function legibleShade(
  ramp: Record<Shade, string>,
  bg: string,
  floor: number,
  order: Shade[]
): string {
  for (const k of order) if (apcaLc(ramp[k], bg) >= floor) return ramp[k];
  return readableOn(bg);
}

export function deriveFamily(
  name: string,
  ramp: Record<Shade, string>,
  mode: Mode
): TokenMap {
  const dark = mode === 'dark';
  const p = `--nx-color-${name}`;
  const subtle = dark ? ramp['950'] : ramp['50'];
  return {
    [`${p}-background`]: ramp['600'],
    [`${p}-background-hover`]: ramp['700'],
    [`${p}-background-active`]: ramp['800'],
    [`${p}-foreground`]: readableOn(ramp['600']),
    [`${p}-disabled`]: dark ? ramp['950'] : ramp['300'],
    [`${p}-subtle`]: subtle,
    [`${p}-subtle-foreground`]: legibleShade(
      ramp,
      subtle,
      TIER_THRESHOLDS.ui,
      dark ? ['300', '200', '100', '50'] : ['600', '700', '800', '900']
    ),
    [`${p}-subtle-hover`]: dark ? ramp['900'] : ramp['100'],
    [`${p}-subtle-active`]: dark ? ramp['800'] : ramp['200'],
    [`--nx-color-border-${name}`]: dark ? ramp['700'] : ramp['200'],
    [`--nx-color-border-${name}-active`]: dark ? ramp['500'] : ramp['400'],
  };
}

export const derivePrimary = (accentHex: string, mode: Mode): TokenMap =>
  deriveFamily('primary', rampFromSeed(accentHex), mode);
```

(`rampFromSeed` already returns a `Record<Shade,string>`; confirm its type and import `TIER_THRESHOLDS`/`apcaLc` if not already in scope.)

- [ ] **Step 4: Run → snapshot PASS** (`-subtle-foreground` may shift if the old fixed shade failed APCA — that's the intended fix; re-fill the snapshot ONLY this once if so, and confirm the new value is legible).
- [ ] **Step 5: Commit** — `git commit -am "refactor(core): ramp-driven deriveFamily; APCA-derived subtle-foreground"`

---

### Task 2: `deriveSecondary` — exact neutral surface table

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** `deriveSecondary(mode): TokenMap` — tone-independent neutral surface family, exact curated `neutral-*` shade map, no border tokens.

- [ ] **Step 1: Failing test — exact expected tables, both modes** (S5):

```ts
const N = {
  '50': 'oklch(0.985 0 0)',
  '100': 'oklch(0.945 0 0)',
  '200': 'oklch(0.87 0 0)',
  '300': 'oklch(0.765 0 0)',
  '600': 'oklch(0.46 0 0)',
  '700': 'oklch(0.385 0 0)',
  '800': 'oklch(0.297 0 0)',
  '900': 'oklch(0.207 0 0)',
  '950': 'oklch(0.118 0 0)',
};
it('secondary exactly matches the curated neutral map (both modes)', () => {
  const { light, dark } = deriveTheme({
    appearance: 'light',
    surfaceTone: 'neutral',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  expect(light['--nx-color-secondary-background']).toBe(N['100']);
  expect(light['--nx-color-secondary-foreground']).toBe(N['900']);
  expect(light['--nx-color-secondary-subtle-foreground']).toBe(N['600']);
  expect(dark['--nx-color-secondary-background']).toBe(N['900']);
  expect(dark['--nx-color-secondary-foreground']).toBe(N['100']);
  expect(dark['--nx-color-secondary-subtle']).toBe(N['800']);
  expect(light['--nx-color-border-secondary']).toBeUndefined();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
const NEUTRAL: Record<string, string> = {
  /* the N map above, from packages/core/tokens/primitives */
};
export function deriveSecondary(mode: Mode): TokenMap {
  const d = mode === 'dark',
    n = NEUTRAL;
  return {
    '--nx-color-secondary-background': d ? n['900'] : n['100'],
    '--nx-color-secondary-background-hover': d ? n['700'] : n['200'],
    '--nx-color-secondary-background-active': d ? n['600'] : n['300'],
    '--nx-color-secondary-foreground': d ? n['100'] : n['900'],
    '--nx-color-secondary-disabled': d ? n['950'] : n['50'],
    '--nx-color-secondary-subtle': d ? n['800'] : n['100'],
    '--nx-color-secondary-subtle-foreground': d ? n['200'] : n['600'],
    '--nx-color-secondary-subtle-hover': d ? n['700'] : n['200'],
    '--nx-color-secondary-subtle-active': d ? n['600'] : n['300'],
  };
}
// deriveMode: add `...deriveSecondary(mode)`
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): deriveSecondary neutral-surface family (exact table)"`

---

### Task 3: Status families — from the CURATED ramps (not `rampFromSeed`)

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** `STATUS_RAMP: Record<'success'|'warning'|'error'|'information', Record<Shade,string>>` = the **curated** green/orange/red/blue ramps. Status = `deriveFamily(name, STATUS_RAMP[name], mode)` — so status hues are the curated ones, not Nexus-grid regenerations.

- [ ] **Step 1: Provenance** — inline the four ramps from the core source (fixed, brand-independent):
      `grep -E '\--nx-color-(green|orange|red|blue)-(50|100|200|300|400|500|600|700|800|900|950):' packages/core/tokens/primitives/*.json apps/console/public/themes/color.css`
      (use the `packages/core` primitive source as canonical; the console CSS is only a cross-check).

- [ ] **Step 2: Failing test** (curated hue + APCA on background AND subtle, both modes):

```ts
const Hue = (s: string) =>
  Number(s.match(/oklch\([\d.]+ [\d.]+ ([\d.]+)/)?.[1] ?? 0);
it('status uses curated hues + is APCA-legible on background and subtle', () => {
  const { dark } = deriveTheme({
    appearance: 'dark',
    surfaceTone: 'slate',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  expect(Hue(dark['--nx-color-error-background'])).toBeCloseTo(27.9, 0); // curated red hue, not a regrind
  for (const s of ['success', 'warning', 'error', 'information']) {
    expect(
      apcaLc(
        dark[`--nx-color-${s}-foreground`],
        dark[`--nx-color-${s}-background`]
      )
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
    expect(
      apcaLc(
        dark[`--nx-color-${s}-subtle-foreground`],
        dark[`--nx-color-${s}-subtle`]
      )
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
  }
});
```

- [ ] **Step 3: Implement**

```ts
const STATUS_RAMP = {
  success: {
    /* green-50..950 */
  },
  warning: {
    /* orange-50..950 */
  },
  error: {
    /* red-50..950 */
  },
  information: {
    /* blue-50..950 */
  },
} satisfies Record<string, Record<Shade, string>>;
// deriveMode: const status = Object.assign({}, ...Object.keys(STATUS_RAMP).map((n) => deriveFamily(n, STATUS_RAMP[n], mode)));
```

(Fill each ramp from Step 1's grep. `error.600` is `oklch(0.577 0.2523 27.926)`, etc.)

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): status families from the curated ramps (fixed hues)"`

---

### Task 4: Surface-tone–driven surfaces (flat light base; border-default/disabled removed)

**Files:** Modify the contract type + `SURFACE_STEPS` + `deriveSurfaces` + `deriveMode`/`deriveTheme`; Test: `derive-theme.test.ts`

**Interfaces:** Add `export type SurfaceTone = 'stone'|'neutral'|'zinc'|'slate'|'gray'`; contract gains `surfaceTone?: SurfaceTone` (default `'neutral'`). `SURFACE_TONE` (runtime-owned, the calibrated source of truth) maps each tone → `{ h, c }`. **Remove `border-default` + `border-disabled` from `SURFACE_STEPS`** (they're alpha, Task 6). Keep `border-active` (opaque tone). `deriveSurfaces(background, surfaceTone, mode, delta)` tints hue/chroma from the tone; only base `container`/`popover` flatten in light.

- [ ] **Step 1: Failing tests**

```ts
const SEEDS = {
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
  dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
  contrast: 60,
} as const;
it('light base flat; muted/hover stepped; tone tints light (slate≠neutral)', () => {
  const slate = deriveTheme({
    appearance: 'light',
    surfaceTone: 'slate',
    ...SEEDS,
  }).light;
  const neutral = deriveTheme({
    appearance: 'light',
    surfaceTone: 'neutral',
    ...SEEDS,
  }).light;
  expect(slate['--nx-color-container']).toBe(slate['--nx-color-background']);
  expect(slate['--nx-color-muted']).not.toBe(slate['--nx-color-background']);
  expect(slate['--nx-color-container-hover']).not.toBe(
    slate['--nx-color-container']
  );
  expect(slate['--nx-color-muted']).not.toBe(neutral['--nx-color-muted']);
  expect(slate['--nx-color-border-default']).toBeUndefined(); // moved to alpha (Task 6)
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement** — remove the two alpha borders from `SURFACE_STEPS`, add the tone:

```ts
export type SurfaceTone = 'stone' | 'neutral' | 'zinc' | 'slate' | 'gray';
const SURFACE_TONE: Record<SurfaceTone, { h: number; c: number }> = {
  slate: { h: 264.7, c: 0.04 },
  gray: { h: 261.7, c: 0.027 },
  zinc: { h: 262.8, c: 0.005 },
  neutral: { h: 0, c: 0 },
  stone: { h: 70, c: 0.006 },
};
const FLAT_IN_LIGHT = new Set(['container', 'popover']); // base surfaces only
// SURFACE_STEPS: delete 'border-default' and 'border-disabled' entries; keep 'border-active'.

export function deriveSurfaces(
  backgroundHex: string,
  surfaceTone: SurfaceTone,
  mode: Mode,
  delta: number
): TokenMap {
  const bg = seedOklch(backgroundHex);
  const tone = SURFACE_TONE[surfaceTone];
  const dir = mode === 'dark' ? 1 : -1;
  const out: TokenMap = {};
  for (const [token, rawStep] of Object.entries(SURFACE_STEPS)) {
    const step = mode === 'light' && FLAT_IN_LIGHT.has(token) ? 0 : rawStep;
    const l = clamp01((bg.l ?? 0) + dir * step * delta);
    out[`--nx-color-${token}`] = formatOklch({
      mode: 'oklch',
      l,
      c: tone.c * (1 - l),
      h: tone.h,
    });
  }
  return out; // keep control-thumb special-case
}
// deriveMode/deriveTheme thread `contract.surfaceTone ?? 'neutral'` into deriveSurfaces + deriveAlpha.
```

- [ ] **Step 4: Run → PASS.** (Light step magnitudes calibrated in Task 9.)
- [ ] **Step 5: Commit** — `git commit -am "feat(core): surfaceTone-tinted surfaces; flat light base; border-default→alpha"`

---

### Task 5: Fixed colorblind-safe chart set

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

- [ ] **Step 1: Provenance** — `grep -E '\--nx-color-(teal-600|lime-700|orange-600|rose-600|indigo-600|teal-200|lime-200|orange-200|rose-200|indigo-200):' packages/core/tokens/primitives/*.json`

- [ ] **Step 2: Failing test**

```ts
it('emits the fixed 5-color chart set, distinct per mode', () => {
  const { light, dark } = deriveTheme({
    appearance: 'light',
    surfaceTone: 'neutral',
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  });
  for (let i = 1; i <= 5; i++) {
    expect(light[`--nx-color-chart-categorical-${i}`]).toBeTruthy();
  }
  expect(light['--nx-color-chart-categorical-1']).not.toBe(
    dark['--nx-color-chart-categorical-1']
  );
});
```

- [ ] **Step 3: Implement**

```ts
const CHART_LIGHT = [
  'oklch(0.62 0.1405 184.704)',
  'oklch(0.61 0.1871 131.589)',
  'oklch(0.62 0.2044 41.116)',
  'oklch(0.58 0.2489 17.585)',
  'oklch(0.49 0.2912 276.966)',
];
const CHART_DARK = [
  'oklch(0.9 0.1682 180.426)',
  'oklch(0.93 0.2278 124.321)',
  'oklch(0.91 0.0819 70.697)',
  'oklch(0.885 0.0771 10.001)',
  'oklch(0.865 0.069 274.039)',
];
function deriveChart(mode: Mode): TokenMap {
  const set = mode === 'dark' ? CHART_DARK : CHART_LIGHT;
  return Object.fromEntries(
    set.map((v, i) => [`--nx-color-chart-categorical-${i + 1}`, v])
  );
}
// deriveMode: add `...deriveChart(mode)`
```

- [ ] **Step 4: Run → PASS**, then `pnpm --filter @nexus/core audit:colorblind` → green. (Derived-value colorblind assertion lives in Task 8.)
- [ ] **Step 5: Commit** — `git commit -am "feat(core): fixed colorblind-safe chart-categorical set"`

---

### Task 6: Alpha / translucent tokens + the alpha borders

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** `deriveAlpha(surfaceTone, mode)` emits two ink families: **tone-ink** (`overlay`, `popover-backdrop`, `border-default-alpha`, `background-hover-alpha`; `popover-alpha` = white light / tone-ink dark) carrying the tone tint; and **contrast-ink** (`border-default`, `border-disabled` = black light / white dark) — the alpha borders moved out of `SURFACE_STEPS` (Task 4). Tests assert the full `oklch(L C H / α)` value, not only α.

- [ ] **Step 1: Failing test (full value, both modes)**

```ts
it('emits tone-ink + contrast-ink alpha tokens with correct L C H α (both modes)', () => {
  const base = {
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  };
  const { light, dark } = deriveTheme({
    appearance: 'light',
    surfaceTone: 'slate',
    ...base,
  });
  // tone-ink overlay: slate hue/chroma, mode-specific alpha
  expect(light['--nx-color-overlay']).toBe('oklch(0.13 0.0400 264.7 / 0.7529)');
  expect(dark['--nx-color-overlay']).toBe('oklch(0.13 0.0400 264.7 / 0.8471)');
  // contrast-ink border-default: black in light, white in dark (NOT tone)
  expect(light['--nx-color-border-default']).toBe('oklch(0.1448 0 0 / 0.0941)');
  expect(dark['--nx-color-border-default']).toBe('oklch(1 0 0 / 0.1882)');
  expect(light['--nx-color-popover-alpha']).toBe('oklch(1 0 0 / 0.9098)');
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
function deriveAlpha(surfaceTone: SurfaceTone, mode: Mode): TokenMap {
  const tone = SURFACE_TONE[surfaceTone];
  const toneInk = (a: number) =>
    `oklch(0.13 ${tone.c.toFixed(4)} ${tone.h.toFixed(1)} / ${a})`;
  const dark = mode === 'dark';
  const contrastInk = (a: number) =>
    dark ? `oklch(1 0 0 / ${a})` : `oklch(0.1448 0 0 / ${a})`;
  return {
    '--nx-color-overlay': toneInk(dark ? 0.8471 : 0.7529),
    '--nx-color-popover-backdrop': toneInk(0.9098),
    '--nx-color-border-default-alpha': toneInk(dark ? 0.1882 : 0.0941),
    '--nx-color-background-hover-alpha': toneInk(0.0627),
    '--nx-color-popover-alpha': dark
      ? toneInk(0.8471)
      : 'oklch(1 0 0 / 0.9098)',
    '--nx-color-border-default': contrastInk(dark ? 0.1882 : 0.0941),
    '--nx-color-border-disabled': contrastInk(dark ? 0.1882 : 0.0941),
  };
}
// deriveMode: add `...deriveAlpha(surfaceTone, mode)`
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): tone-ink + contrast-ink alpha tokens (incl. alpha borders)"`

---

### Task 7: Exact two-mode key parity against the core token JSON

**Files:** Create `packages/core/src/lib/derive-theme.parity.test.ts`

**Interfaces:** Oracle = `@nexus/core`'s own `tokens/semantic/base-slate-{light,dark}.json` (+ the brand + chart semantic sources) — top-level keys are the semantic token names. Assert **exact set equality** (no missing AND no extras) for **both** modes.

- [ ] **Step 1: Write the test**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveTheme } from './derive-theme';

function curatedKeys(mode: 'light' | 'dark'): Set<string> {
  // core-owned sources only — never apps/console
  const files = [
    `base-slate-${mode}`,
    `brands-blue-${mode}`,
    `chart-categorical-default-${mode}`,
  ];
  const keys = new Set<string>();
  for (const f of files) {
    const json = JSON.parse(
      readFileSync(`packages/core/tokens/semantic/${f}.json`, 'utf8')
    );
    for (const k of Object.keys(json)) keys.add(`--nx-color-${k}`);
  }
  return keys;
}

it.each(['light', 'dark'] as const)(
  'deriveTheme %s emits EXACTLY the curated key set',
  (mode) => {
    const t = deriveTheme({
      appearance: mode,
      surfaceTone: 'slate',
      light: {
        accent: '#2563eb',
        background: '#ffffff',
        foreground: '#181818',
      },
      dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
      contrast: 60,
    })[mode];
    const derived = new Set(Object.keys(t));
    const want = curatedKeys(mode);
    expect([...want].filter((k) => !derived.has(k))).toEqual([]); // no missing
    expect([...derived].filter((k) => !want.has(k))).toEqual([]); // no extras
  }
);
```

(Confirm the exact core file names — `ls packages/core/tokens/semantic/` — and adjust `files`. If status/secondary/chart live in a single brand file, include it; the rule is _only_ `packages/core` sources.)

- [ ] **Step 2: Run → FAIL**, listing missing/extras. Add missing keys to their deriver (`nav-border` → `SURFACE_STEPS`); drop any extra. Iterate to `[]`/`[]` both modes.
- [ ] **Step 3: Commit** — `git add packages/core/src/lib/derive-theme.parity.test.ts && git commit -m "test(core): exact two-mode key parity vs the core token source"`

---

### Task 8: APCA sweep (primary + secondary + status, bg AND subtle) + derived colorblind

**Files:** Modify the legibility sweep in `derive-theme.test.ts`

- [ ] **Step 1: Extend the sweep** — across the seed matrix and both modes:

```ts
for (const fam of [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'information',
]) {
  expect(
    apcaLc(
      tokens[`--nx-color-${fam}-foreground`],
      tokens[`--nx-color-${fam}-background`]
    )
  ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
  expect(
    apcaLc(
      tokens[`--nx-color-${fam}-subtle-foreground`],
      tokens[`--nx-color-${fam}-subtle`]
    )
  ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
}
```

- [ ] **Step 2: Derived-value colorblind** — assert the **emitted** `chart-categorical-1..5` (and status backgrounds) are pairwise-distinguishable under the project's colorblind metric (reuse the `audit:colorblind` helper on the derived values, not just the static set). Run → PASS.
- [ ] **Step 3: Commit** — `git commit -am "test(core): APCA sweep (primary+secondary+status, bg+subtle) + derived colorblind"`

---

### Task 9: Tone parity — both modes, all tone-owned tokens, vs the core source

**Files:** Create `packages/core/src/lib/tone-parity.test.ts`; the calibrated `SURFACE_TONE` (Task 4) is the runtime source of truth — no separate test-only seed table.

**Interfaces:** For each `surfaceTone`, every **tone-owned** token (surfaces, nav, `border-active`, `overlay`/alpha) must match the core curated value within tolerance (ΔL ≤ 0.04, ΔC ≤ 0.01, ΔH ≤ 4°, Δα ≤ 0.02) in **both** modes. Curated values resolved from `packages/core/tokens/semantic/base-{tone}-{light,dark}.json` → primitives. **Phase A is not complete until all five tones pass both modes** — an unmatchable token is an explicit, documented public-contract item, not a silent residual.

- [ ] **Step 1: Build the core-sourced oracle** — a helper that resolves `base-{tone}-{mode}.json` `{primitive}` refs against `packages/core/tokens/primitives/*.json` to concrete `oklch()` for the tone-owned set `{muted, container, popover, nav-background, nav-border, border-active, overlay}`.

- [ ] **Step 2: Parity test (both modes, L/C/H/α tolerance)**

```ts
const TONE_TOKENS = [
  'muted',
  'container',
  'popover',
  'nav-background',
  'nav-border',
  'border-active',
  'overlay',
];
function comps(s: string) {
  const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?/)!;
  return { l: +m[1], c: +m[2], h: +m[3], a: m[4] ? +m[4] : 1 };
}

it.each(['slate', 'neutral', 'zinc', 'gray', 'stone'])(
  '%s matches curated within tolerance (both modes)',
  (tone) => {
    for (const mode of ['light', 'dark'] as const) {
      const got = deriveTheme({
        appearance: mode,
        surfaceTone: tone,
        light: {
          accent: '#2563eb',
          background: '#ffffff',
          foreground: '#181818',
        },
        dark: {
          accent: '#2563eb',
          background: '#181818',
          foreground: '#ffffff',
        },
        contrast: TONE_CONTRAST,
      })[mode];
      for (const tok of TONE_TOKENS) {
        const g = comps(got[`--nx-color-${tok}`]),
          w = comps(curatedTone(tone, mode, tok));
        expect(Math.abs(g.l - w.l)).toBeLessThanOrEqual(0.04);
        expect(Math.abs(g.c - w.c)).toBeLessThanOrEqual(0.01);
        if (g.c > 0.002 && w.c > 0.002)
          expect(Math.abs(((g.h - w.h + 540) % 360) - 180)).toBeLessThanOrEqual(
            4
          );
        expect(Math.abs(g.a - w.a)).toBeLessThanOrEqual(0.02);
      }
    }
  }
);
```

- [ ] **Step 3: Calibrate** `SURFACE_TONE[tone]` (+ `TONE_CONTRAST`, + the light step magnitudes) until all five tones pass both modes. Record any genuinely unmatchable token as an explicit contract item.
- [ ] **Step 4: Commit** — `git add packages/core/src/lib/tone-parity.test.ts && git commit -m "feat(core): two-mode tone parity gate (all tone-owned tokens)"`

---

## Done when

- `pnpm test:unit` green: exact two-mode key parity (Task 7), APCA sweep incl. **primary** (Task 8), derived colorblind, and tone parity for **all five tones, both modes** (Task 9).
- `pnpm --filter @nexus/core audit:colorblind` green.
- `pnpm typecheck && pnpm lint` clean.
- `deriveTheme` emits **exactly** the core curated semantic `--nx-color-*` key set (no missing, no extras) — against `@nexus/core`'s own token source, not `apps/console`.
- No tone left on static CSS as a silent follow-up.

Phase B (packaging) consumes this surface; do not start it until Task 7 + Task 9 are green — they freeze the public token contract.
