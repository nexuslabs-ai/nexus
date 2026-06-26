# Phase A — Full-Token Derivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@nexus/core`'s `deriveTheme` so its emitted `--nx-color-*` **key set** equals the curated base+brand+chart set — every token key derived from the contract, none cascading from static CSS. Values are verified by family gates: dark tone-owned values match curated, light tone-owned values match the committed evident-tone fixture, and status/secondary/chart families keep their own exact gates.

**Architecture:** `deriveFamily(name, ramp, mode)` builds a family from a **ramp object** + APCA on-color: primary passes `rampFromSeed(accent)` (brand-derived); the four status families pass the **fixed curated status ramps** (NOT regrubbed through `rampFromSeed`). Warning keeps the orange ramp but promotes its solid tier to `orange.700` (`orange.800`/`orange.900` hover/active) so emitted success/warning clear the derived colorblind gate. A dedicated `deriveSecondary` emits the tone-independent neutral surface family. `deriveSurfaces` tints surface hue/chroma from `surfaceTone` with a per-mode step model (dark stepped / light base-flat). `deriveAlpha` emits the translucent tokens (tone-ink scrims) **and** the alpha-based `border-default`/`border-disabled` (contrast-ink). Chart = fixed curated APCA + colorblind set; light series 1/2 use `teal.700` + `green.700` so marks clear light-paper contrast and remain distinguishable from orange/red under colorblind simulation without bespoke chart-only colors. The parity gates are split deliberately: Task 7 asserts exact two-mode **key** parity against the recursive core token JSON leaves; Task 9 and the family-specific tests assert value parity for the tone/status/secondary/chart surfaces they own.

**Tech Stack:** TypeScript, culori + apca-w3, vitest (`pnpm test:unit`). All work in `packages/core/src/lib/`; the parity oracle is `packages/core/tokens/semantic/*.json` (never `apps/console`).

## Global Constraints

- **APCA gate:** every text/surface pair clears its tier floor (`TIER_THRESHOLDS`); never throws (snap to black/white endpoint). `-subtle-foreground` is APCA-derived, not a hoped-to-pass fixed shade.
- **No `light-dark()`** in emitted CSS — `themeToCss` stays `:root` / `:root.dark`.
- **`deriveTheme` returns DATA** (`TokenMap`); `themeToCss` is the only web applier.
- **Contract may change in Phase A; Phase B freezes the public API.** It carries `surfaceTone: 'stone'|'neutral'|'zinc'|'slate'|'gray'` (optional, default `'neutral'`) — the neutral surface family. `background` remains the input seed; in light, non-neutral tones emit `--nx-color-background` as tinted paper (`PAPER_L`), while `neutral` stays true white. The **tone**, not the background seed, supplies surface/nav/border/alpha hue+chroma.
- **Status hues are fixed and brand-independent** — emit the **curated** green/orange/red/blue ramps, don't regenerate them via `rampFromSeed` (it uses Nexus's perceptual grid, which need not match the curated primitive ramps). Warning uses the orange ramp's `700` tier as the solid background to avoid success/warning colorblind collapse.
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

**Interfaces:** `STATUS_RAMP: Record<'success'|'warning'|'error'|'information', Record<Shade,string>>` = the **curated** green/orange/red/blue ramps. Status = `deriveFamily(name, STATUS_RAMP[name], mode)` — so status hues are the curated ones, not Nexus-grid regenerations. Warning is a deliberate exception only in the solid tier selection: it keeps the orange ramp but uses `orange.700` for `warning-background`, `orange.800` for hover, and `orange.900` for active so emitted success/warning pass the derived colorblind gate.

- [ ] **Step 1: Provenance** — inline the four ramps from the core JSON source (fixed, brand-independent). Do not grep for CSS variable names here; `color.json` is nested JSON. Resolve the primitive hex values to the same OKLCH formatting the generators emit:
      `node --input-type=module -e 'import { readTokenFile, formatTokenValue } from "./packages/core/scripts/utils.js"; const color = readTokenFile("packages/core/tokens/primitives/color.json"); const shades = ["50","100","200","300","400","500","600","700","800","900","950"]; for (const p of ["green","orange","red","blue"]) console.log(p, Object.fromEntries(shades.map((s) => [s, formatTokenValue(color[p][s].$value, "color", [p, s])]))); console.log("warning solid retune", formatTokenValue(color.orange["700"].$value, "color", ["orange", "700"]));'`
      (use the `packages/core` primitive source as canonical).

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
    /* orange-50..950; solid emits 700/800/900 for bg/hover/active */
  },
  error: {
    /* red-50..950 */
  },
  information: {
    /* blue-50..950 */
  },
} satisfies Record<string, Record<Shade, string>>;
// deriveMode: const status = Object.assign({}, ...Object.keys(STATUS_RAMP).map((n) => deriveFamily(n, STATUS_RAMP[n], mode, n === 'warning' ? { background: '700', hover: '800', active: '900' } : undefined)));
```

(Fill each ramp from Step 1's grep. `error.600` is `oklch(0.577 0.2523 27.926)`, etc.)

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): status families from the curated ramps (fixed hues)"`

---

### Task 4: Surface-tone–driven surfaces (flat light base; border-default/disabled removed)

**Files:** Modify the contract type + `SURFACE_STEPS` + `deriveSurfaces` + `deriveMode`/`deriveTheme`; Test: `derive-theme.test.ts`

**Interfaces:** Add `export type SurfaceTone = 'stone'|'neutral'|'zinc'|'slate'|'gray'`; contract gains `surfaceTone?: SurfaceTone` (default `'neutral'`). `SURFACE_TONE` (runtime-owned, the calibrated source of truth) maps each tone → `{ h, lightC, darkC }` — two chroma anchors, because **light is now a tinted _paper_, not pure white** (degree B / mechanism C, baked at the Tonal strength). **Remove `border-default` + `border-disabled` from `SURFACE_STEPS`** (they're alpha, Task 6). Keep `border-active` (opaque tone). `deriveSurfaces(background, surfaceTone, mode, delta)` tints hue/chroma from the tone; only base `container`/`popover` flatten in light. Dark uses a calibrated override step table for the curated 950/900/800/700/400 ladder.

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
  expect(slate['--nx-color-background']).not.toBe(
    neutral['--nx-color-background']
  );
  expect(lOf(slate['--nx-color-background'])).toBeCloseTo(0.987, 3);
  expect(lOf(neutral['--nx-color-background'])).toBeCloseTo(1, 3);
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
// Two baked chroma anchors per tone: lightC = the tinted "paper" (at the chosen
// Tonal strength) and darkC = curated dark. Light is NO LONGER pure white — it's
// tinted paper. neutral stays a true grey (both anchors 0).
const SURFACE_TONE: Record<
  SurfaceTone,
  { h: number; lightC: number; darkC: number }
> = {
  slate: { h: 264.7, lightC: 0.011, darkC: 0.04 },
  gray: { h: 261.7, lightC: 0.008, darkC: 0.027 },
  zinc: { h: 262.8, lightC: 0.005, darkC: 0.005 },
  neutral: { h: 0, lightC: 0, darkC: 0 },
  stone: { h: 70, lightC: 0.008, darkC: 0.006 },
};
const PAPER_L = 0.987; // tinted tones anchor here in light so the tint is displayable (pure white can't hold chroma)
const FLAT_IN_LIGHT = new Set(['container', 'popover']); // base surfaces only
// SURFACE_STEPS: delete 'border-default' and 'border-disabled' entries; keep 'border-active'.
const DARK_SURFACE_STEPS = {
  background: 0,
  'background-hover': 1.6,
  'background-active': 1.6,
  muted: 1.6,
  container: 1.6,
  'container-hover': 3.2,
  'container-active': 1.6,
  popover: 3.2,
  'popover-hover': 4.8,
  'popover-active': 3.2,
  'control-background': 3.2,
  'control-background-hover': 4.8,
  'nav-background': 0,
  'nav-item-hover': 1.6,
  'nav-item-active': 1.6,
  'nav-border': 3.2,
  disabled: 0,
  'border-active': 9.68,
};

export function deriveSurfaces(
  backgroundHex: string,
  surfaceTone: SurfaceTone,
  mode: Mode,
  delta: number
): TokenMap {
  const bg = seedOklch(backgroundHex);
  const tone = SURFACE_TONE[surfaceTone];
  const dark = mode === 'dark';
  const dir = dark ? 1 : -1;
  // light: tinted tones drop from pure white to "paper" so the tint shows; neutral stays white.
  const anchorL = dark ? (bg.l ?? 0) : tone.lightC > 0 ? PAPER_L : (bg.l ?? 1);
  const baseC = dark ? tone.darkC : tone.lightC;
  const out: TokenMap = {};
  for (const [token, rawStep] of Object.entries(SURFACE_STEPS)) {
    const step = dark
      ? (DARK_SURFACE_STEPS[token] ?? rawStep)
      : FLAT_IN_LIGHT.has(token)
        ? 0
        : rawStep;
    const l = clamp01(anchorL + dir * step * delta);
    // tint holds at the paper and rises modestly on deeper light surfaces; dark uses darkC. k (1.4) tuned in Task 9.
    const c = dark ? baseC : baseC * (1 + (1 - l) * 1.4);
    out[`--nx-color-${token}`] = formatOklch({
      mode: 'oklch',
      l,
      c,
      h: tone.h,
    });
  }
  // control-thumb is a fixed white knob in the curated base files; it is not tone-owned.
  out['--nx-color-control-thumb'] = 'oklch(1 0 0)';
  return out;
}
// deriveMode/deriveTheme thread `contract.surfaceTone ?? 'neutral'` into deriveSurfaces + deriveAlpha.
```

- [ ] **Step 4: Run → PASS.** Light surfaces are now tinted **paper** (background ≈ L0.987, not pure `#fff`) at the baked **Tonal** strength; neutral stays true white. The depth multiplier `k` (1.4) + light step magnitudes are calibrated against the light fixture in Task 9.
- [ ] **Step 5: Commit** — `git commit -am "feat(core): surfaceTone-tinted paper (evident light tones); flat base; border-default→alpha"`

---

### Task 5: Fixed colorblind-safe chart set

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

- [ ] **Step 1: Provenance** — resolve the fixed chart primitives from core JSON into generator-formatted OKLCH, not by grepping CSS variable names. Light series 1/2 use curated `teal.700` and `green.700` so the derived chart set clears both APCA on light paper and the derived colorblind gate:
      `node --input-type=module -e 'import { readTokenFile, formatTokenValue } from "./packages/core/scripts/utils.js"; const color = readTokenFile("packages/core/tokens/primitives/color.json"); const sets = { light: [["teal","700"],["green","700"],["orange","600"],["rose","600"],["indigo","600"]], dark: [["teal","200"],["lime","200"],["orange","200"],["rose","200"],["indigo","200"]] }; for (const [mode, entries] of Object.entries(sets)) console.log(mode, entries.map(([p, s]) => formatTokenValue(color[p][s].$value, "color", [p, s])));'`

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
  'oklch(0.52 0.1168 186.391)',
  'oklch(0.52 0.1871 140.022)',
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

**Interfaces:** `deriveAlpha(surfaceTone, mode)` emits two ink families: **tone-ink** (`overlay`, `popover-backdrop`, `border-default-alpha`, `background-hover-alpha`; `popover-alpha` = white light / tone-ink dark) carrying the tone tint; and **contrast-ink** (`border-default`, `border-disabled` = black light / white dark) — the alpha borders moved out of `SURFACE_STEPS` (Task 4). Tests assert the full normalized `oklch(L C H / α)` value from `SURFACE_TONE`, not only α; Task 9 handles source parity against curated primitives by tolerance.

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
  expect(light['--nx-color-popover-backdrop']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.9098)'
  );
  expect(dark['--nx-color-popover-backdrop']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.9098)'
  );
  expect(light['--nx-color-border-default-alpha']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.0941)'
  );
  expect(dark['--nx-color-border-default-alpha']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.1882)'
  );
  expect(light['--nx-color-background-hover-alpha']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.0627)'
  );
  expect(dark['--nx-color-background-hover-alpha']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.0627)'
  );
  expect(light['--nx-color-popover-alpha']).toBe('oklch(1 0 0 / 0.9098)');
  expect(dark['--nx-color-popover-alpha']).toBe(
    'oklch(0.13 0.0400 264.7 / 0.8471)'
  );
  // contrast-ink borders: black in light, white in dark (NOT tone)
  expect(light['--nx-color-border-default']).toBe('oklch(0.1448 0 0 / 0.0941)');
  expect(dark['--nx-color-border-default']).toBe('oklch(1 0 0 / 0.1882)');
  expect(light['--nx-color-border-disabled']).toBe(
    'oklch(0.1448 0 0 / 0.0941)'
  );
  expect(dark['--nx-color-border-disabled']).toBe('oklch(1 0 0 / 0.1882)');
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
function deriveAlpha(surfaceTone: SurfaceTone, mode: Mode): TokenMap {
  const tone = SURFACE_TONE[surfaceTone];
  const toneInk = (
    a: number // ink sits at L0.13 → carries the tone's dark chroma
  ) => `oklch(0.13 ${tone.darkC.toFixed(4)} ${tone.h.toFixed(1)} / ${a})`;
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

**Interfaces:** Oracle = `@nexus/core`'s own `tokens/semantic/base-slate-{light,dark}.json` (+ the brand + chart semantic sources). Semantic files are nested, so collect **recursive color leaves** and join their path segments (`border.default` → `--nx-color-border-default`, `chart.categorical.1` → `--nx-color-chart-categorical-1`). Assert **exact key-set equality** (no missing AND no extras) for **both** modes.

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
  function collectColorLeaves(obj: unknown, path: string[] = []) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    const record = obj as Record<string, unknown>;
    if (record.$type === 'color' && typeof record.$value === 'string') {
      keys.add(`--nx-color-${path.join('-')}`);
      return;
    }
    for (const [key, value] of Object.entries(record)) {
      if (key.startsWith('$')) continue;
      collectColorLeaves(value, [...path, key]);
    }
  }
  for (const f of files) {
    const json = JSON.parse(
      readFileSync(`packages/core/tokens/semantic/${f}.json`, 'utf8')
    );
    collectColorLeaves(json);
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

- [ ] **Step 2: Derived-value contrast + colorblind** — sweep all five `surfaceTone`s × both modes for base text, nav foreground/muted foreground, hover/active surfaces, focus-adjacent surfaces, and chart/status colors on `background`/`container`. Assert the **emitted** `chart-categorical-1..5` and status backgrounds are pairwise-distinguishable under the project's colorblind metric. Feed derived `{ success: green, warning: orange700, error: red, information: blue }` and emitted chart values into the helper; do not rely only on `audit-colorblind.js`'s static `STATUS_PALETTES`.
- [ ] **Step 3: Commit** — `git commit -am "test(core): APCA sweep (primary+secondary+status, bg+subtle) + derived colorblind"`

---

### Task 9: Tone parity — both modes, all classified tone leaves

**Files:** Create `packages/core/src/lib/tone-parity.test.ts` and `packages/core/src/lib/light-tone.fixture.json`. The calibrated `SURFACE_TONE` (Task 4) is the runtime source of truth; the fixture is the frozen **light output oracle**, not a second seed table. If `SURFACE_TONE`, `PAPER_L`, light step magnitudes, or `TONE_CONTRAST` change, regenerate the fixture and review the diff in the same commit.

**Fixture schema:** `light-tone.fixture.json` stores `{ schemaVersion, source, paperL, lightDepthMultiplier, toneContrast, tones }`, where `tones[tone][token]` is the expected emitted `oklch()` value for the canonical light seeds. Do not generate expected light values from `deriveTheme` inside the test; read the frozen fixture so regressions show up as diffs.

**Interfaces:** the gate is **mode-split** (the evident-light-tones change in Task 4 makes light intentionally diverge from curated). In **dark**, every **tone-owned surface/alpha/border** base token matches the **curated** value (`base-{tone}-dark.json` → primitives) within tolerance. In **light**, every tone-owned surface/alpha/border base token matches `light-tone.fixture.json` with tighter tolerance because the visible tint is the product contract. Text leaves are classified as contrast/text ink and remain governed by the APCA sweep because the engine emits opaque APCA-derived text instead of literal alpha text primitives. All base semantic color leaves are classified as one of: `tone-owned`, `contrast/text-ink`, `fixed-white` (`control-thumb`), `status/brand/chart/secondary`, or `intentional-exclusion`. The test fails if a base color leaf is unclassified. **Phase A is not complete until all five tones pass both modes** — an unmatchable token is an explicit, documented public-contract item, not a silent residual.

- [ ] **Step 1: Build the mode-split oracle** — `expectedTone(tone, mode, tok)`: for **dark**, resolve `base-{tone}-dark.json` `{primitive}` refs against `packages/core/tokens/primitives/*.json` to concrete `oklch()`; for **light**, read `packages/core/src/lib/light-tone.fixture.json`. Cover every token in `TONE_TOKENS` below, plus assert zero unclassified recursive color leaves from the base semantic files.

- [ ] **Step 2: Parity test (both modes, token-specific L/C/H/α tolerance)**

```ts
const TONE_CONTRAST = 60;
const LIGHT_TOL = { l: 0.005, c: 0.002, h: 2, a: 0.002 };
const DARK_TOL = { l: 0.04, c: 0.01, h: 8, a: 0.02 };
const TONES = ['slate', 'neutral', 'zinc', 'gray', 'stone'] as const;
const TONE_TOKENS = [
  'background',
  'background-hover',
  'background-hover-alpha',
  'background-active',
  'muted',
  'disabled',
  'container',
  'container-hover',
  'container-active',
  'popover',
  'popover-hover',
  'popover-active',
  'popover-alpha',
  'popover-backdrop',
  'control-background',
  'control-background-hover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
  'border-default-alpha',
  'border-active',
  'overlay',
] as const;

function comps(s: string) {
  const m = s.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?/)!;
  return { l: +m[1], c: +m[2], h: +m[3], a: m[4] ? +m[4] : 1 };
}

function expectNear(got: string, want: string, mode: Mode) {
  const g = comps(got);
  const w = comps(want);
  const t = mode === 'light' ? LIGHT_TOL : DARK_TOL;
  expect(Math.abs(g.l - w.l)).toBeLessThanOrEqual(t.l);
  expect(Math.abs(g.c - w.c)).toBeLessThanOrEqual(t.c);
  if (g.c > 0.01 && w.c > 0.01)
    expect(Math.abs(((g.h - w.h + 540) % 360) - 180)).toBeLessThanOrEqual(t.h);
  expect(Math.abs(g.a - w.a)).toBeLessThanOrEqual(t.a);
}

it.each(TONES)('%s matches the mode-split tone oracle', (tone) => {
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
        background: primitiveHex(tone, '950'),
        foreground: '#ffffff',
      },
      contrast: TONE_CONTRAST,
    })[mode];
    for (const tok of TONE_TOKENS) {
      expectNear(got[`--nx-color-${tok}`], expectedTone(tone, mode, tok), mode);
    }
  }
});

it('keeps non-neutral light paper visibly distinct from neutral', () => {
  const paper = Object.fromEntries(
    TONES.map((tone) => [tone, comps(lightFixture.tones[tone].background)])
  );
  expect(paper.slate.c).toBeGreaterThan(paper.gray.c);
  expect(paper.gray.c).toBeGreaterThan(paper.zinc.c);
  expect(paper.zinc.c).toBeGreaterThan(paper.neutral.c);
  expect(paper.stone.c).toBeGreaterThan(paper.neutral.c);
});
```

- [ ] **Step 3: Calibrate** `SURFACE_TONE[tone]` (+ dark surface steps, + `TONE_CONTRAST`, + the light step magnitudes) until all five tones pass both modes. The initial `TONE_CONTRAST` is `60`; if calibration changes it, record the final value in `light-tone.fixture.json`, the report, and the spec. Record any genuinely unmatchable token as an explicit contract item.
- [ ] **Step 4: Commit** — `git add packages/core/src/lib/tone-parity.test.ts packages/core/src/lib/light-tone.fixture.json && git commit -m "feat(core): two-mode tone parity gate (all tone-owned tokens)"`

---

## Done when

- `pnpm test:unit` green: exact two-mode key parity (Task 7), APCA sweep incl. **primary** (Task 8), derived colorblind, and tone parity for **all five tones, both modes** (Task 9).
- `pnpm --filter @nexus/core audit:colorblind` green.
- `pnpm --filter @nexus/core audit:contrast` green, or the derived-token equivalent is checked in and run by `pnpm test:unit`.
- `pnpm typecheck && pnpm lint` clean.
- `deriveTheme` emits **exactly** the core curated semantic `--nx-color-*` key set (no missing, no extras) — against `@nexus/core`'s own token source, not `apps/console`.
- No tone left on static CSS as a silent follow-up.

Phase B (packaging) consumes this surface; do not start it until Task 7 + Task 9 are green — they freeze the public token contract.
