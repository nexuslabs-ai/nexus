# Phase A — Full-Token Derivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@nexus/core`'s `deriveTheme` so its emitted `--nx-color-*` set **equals** the curated base+brand+chart set — every token derived from the contract, none cascading from static CSS.

**Architecture:** Generalize `derivePrimary` into one reusable `deriveFamily` (solid ramp + APCA on-color) for primary and the four status families; add a **separate** `deriveSecondary` (subtle neutral surface family — secondary is NOT a solid ramp); add a fixed colorblind-safe chart set, a mode-aware fixed-opacity alpha formula, and a per-mode surface-step model (stepped dark / flat light). A token key-parity test makes "every curated key is derived" a hard invariant.

**Tech Stack:** TypeScript, culori + apca-w3, vitest (`pnpm test:unit`). All work is in `packages/core/src/lib/`.

## Global Constraints

- **APCA gate:** every text/surface pair clears its tier floor (`TIER_THRESHOLDS`); never throws (snap to black/white endpoint).
- **No `light-dark()`** in emitted CSS — `themeToCss` stays `:root` / `:root.dark`.
- **`deriveTheme` returns DATA** (`TokenMap`); `themeToCss` is the only web applier. Don't fold serialization into derivation.
- **No new contract inputs** — `{ appearance, light/dark:{accent,background,foreground}, contrast }` is frozen.
- **Tests:** core unit tests live in `packages/core/src/lib/*.test.ts`, import `{ describe, expect, it } from 'vitest'`, run via `pnpm test:unit`.
- **Canonical status seeds** (curated `*-600`): success `oklch(0.62 0.2233 140.055)`, warning `oklch(0.62 0.2044 41.116)`, error `oklch(0.577 0.2523 27.926)`, information `oklch(0.546 0.2205 255.276)`.
- **Secondary is tone-independent neutral grey** (curated references `neutral-*` in every brand file, identical across bases) — derive it from the neutral ramp, NOT the background tone and NOT a solid color ramp.

---

### Task 1: Generalize `derivePrimary` → `deriveFamily`

**Files:**

- Modify: `packages/core/src/lib/derive-theme.ts` (the `derivePrimary` function, ~lines 199–216)
- Test: `packages/core/src/lib/derive-theme.test.ts`

**Interfaces:**

- Produces: `deriveFamily(name: string, seedHex: string, mode: Mode, opts?: { borders?: boolean }): TokenMap` — emits `--nx-color-${name}-{background,background-hover,background-active,foreground,disabled,subtle,subtle-foreground,subtle-hover,subtle-active}` and, when `opts.borders !== false`, `--nx-color-border-${name}` + `--nx-color-border-${name}-active`.
- `derivePrimary(accentHex, mode)` becomes `deriveFamily('primary', accentHex, mode)`.

- [ ] **Step 1: Pin the current output with a snapshot — BEFORE refactoring.** A `deriveFamily('primary') === derivePrimary()` test is tautological once `derivePrimary` is an alias, so it can't catch a regression. Capture the _real current values_ instead:

```ts
// derive-theme.test.ts — add while derivePrimary is still the original implementation
it('primary token values are unchanged by the deriveFamily refactor', () => {
  expect(derivePrimary('#2563eb', 'light')).toMatchInlineSnapshot();
  expect(derivePrimary('#2563eb', 'dark')).toMatchInlineSnapshot();
});
```

- [ ] **Step 2: Fill + freeze the snapshot** — run `pnpm test:unit derive-theme -u` **once, before touching `derivePrimary`**, so vitest writes the real token objects into the `toMatchInlineSnapshot()` calls. Eyeball the filled values (they're the live primary tokens), then **do not pass `-u` again** — the snapshot is now the regression guard.

- [ ] **Step 3: Add the `deriveFamily` shape test** (borders toggle):

```ts
it('deriveFamily omits border tokens when borders:false', () => {
  const out = deriveFamily('secondary', '#888888', 'light', { borders: false });
  expect(out['--nx-color-border-secondary']).toBeUndefined();
  expect(out['--nx-color-secondary-background']).toBeTruthy();
});
```

Run → FAIL (`deriveFamily` not exported).

- [ ] **Step 4: Implement** — replace the body of `derivePrimary` with a generic deriver:

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

- [ ] **Step 5: Run → both tests PASS** (snapshot unchanged, borders test green): `pnpm test:unit derive-theme`.
- [ ] **Step 6: Commit** — `git commit -am "refactor(core): generalize derivePrimary into deriveFamily (snapshot-pinned)"`

---

### Task 2: Add the `secondary` family (dedicated neutral-surface deriver)

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** `deriveSecondary(mode: Mode): TokenMap`. Secondary is a **subtle neutral surface** family — curated maps it to the `neutral-*` ramp (light `bg=100/fg=900/subtle=100`, dark `bg=900/fg=100/subtle=800`), identical across every brand/base. It is **not** `deriveFamily('secondary', …)` (that sets `background=ramp-600`, a strong mid color — wrong). No border tokens.

- [ ] **Step 1: Failing test** — assert secondary is a light surface in light / dark surface in dark, with the inverted foreground (not a mid ramp):

```ts
function L(s: string) {
  return Number(s.match(/oklch\(([\d.]+)/)![1]);
}

it('secondary is a subtle neutral surface family (not a solid ramp)', () => {
  const c = {
    appearance: 'light' as const,
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  };
  const { light, dark } = deriveTheme(c);
  // light: background is a LIGHT neutral surface (L high), foreground is dark
  expect(L(light['--nx-color-secondary-background'])).toBeGreaterThan(0.9);
  expect(L(light['--nx-color-secondary-foreground'])).toBeLessThan(0.3);
  // dark: inverted
  expect(L(dark['--nx-color-secondary-background'])).toBeLessThan(0.3);
  expect(L(dark['--nx-color-secondary-foreground'])).toBeGreaterThan(0.9);
  // neutral: near-zero chroma
  expect(light['--nx-color-secondary-background']).toMatch(
    /oklch\([\d.]+ 0(\.0+)? /
  );
  expect(light['--nx-color-border-secondary']).toBeUndefined();
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Provenance check** — confirm the neutral ramp values are current:
      `grep -hE '\--nx-color-neutral-(50|100|200|300|600|700|800|900|950):' apps/console/public/themes/color.css`

- [ ] **Step 4: Implement** — a fixed neutral ramp + the curated shade mapping:

```ts
const NEUTRAL: Record<string, string> = {
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

export function deriveSecondary(mode: Mode): TokenMap {
  const d = mode === 'dark';
  const n = NEUTRAL;
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
// in deriveMode: add `...deriveSecondary(mode)` to the returned map
```

- [ ] **Step 5: Run → PASS.**
- [ ] **Step 6: Commit** — `git commit -am "feat(core): derive the secondary neutral-surface family"`

---

### Task 3: Add the four status families (fixed canonical hues)

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** Consumes `deriveFamily`. Add module constant `STATUS_SEEDS`. Status families **have** borders.

- [ ] **Step 1: Failing test** (keys present + APCA on background AND subtle)

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
    expect(dark[`--nx-color-border-${s}`]).toBeTruthy();
  }
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement** — constant + fold into `deriveMode`:

```ts
const STATUS_SEEDS: Record<string, string> = {
  success: 'oklch(0.62 0.2233 140.055)',
  warning: 'oklch(0.62 0.2044 41.116)',
  error: 'oklch(0.577 0.2523 27.926)',
  information: 'oklch(0.546 0.2205 255.276)',
};
// in deriveMode, build status and spread it:
const status = Object.assign(
  {},
  ...Object.entries(STATUS_SEEDS).map(([name, seed]) =>
    deriveFamily(name, seed, mode)
  )
);
// return { ...surfaces, ...text, ...primary, ...secondary, ...status, ...chart, ...alpha };
```

- [ ] **Step 4: Run → PASS.** (If a `-subtle-foreground` fails the floor, `quietText`/`readableOn`'s endpoint fallback already guarantees legibility — confirm the subtle deriver uses an APCA-checked on-color, not a fixed ramp shade, for `-subtle-foreground`.)
- [ ] **Step 5: Commit** — `git commit -am "feat(core): derive the four status families from fixed canonical hues"`

---

### Task 4: Per-mode surface-step model (flat light)

**Files:** Modify `deriveSurfaces` in `derive-theme.ts`; Test: `derive-theme.test.ts`

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

- [ ] **Step 3: Implement** — in `deriveSurfaces`, zero the elevation steps in light. Rename the loop var to `rawStep`:

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
for (const [token, rawStep] of Object.entries(SURFACE_STEPS)) {
  const step = mode === 'light' && FLAT_IN_LIGHT.has(token) ? 0 : rawStep;
  // ...existing clamp01(bg.l + dir * step * delta)...
}
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): flat light surfaces, stepped dark (per-mode surface model)"`

---

### Task 5: Fixed colorblind-safe chart-categorical set

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

- [ ] **Step 1: Provenance check** — the constants below are the curated audited set; verify they still match:
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

- [ ] **Step 4: Run → PASS**, then `pnpm --filter @nexus/core audit:colorblind` → green.
- [ ] **Step 5: Commit** — `git commit -am "feat(core): emit the fixed colorblind-safe chart-categorical set"`

---

### Task 6: Mode-aware alpha / translucent tokens

**Files:** Modify `derive-theme.ts`; Test: `derive-theme.test.ts`

**Interfaces:** `deriveAlpha(backgroundHex: string, mode: Mode): TokenMap`. The translucent tokens are **mode-dependent** (verified against curated): `overlay` α `0.7529` light / `0.8471` dark; `border-default-alpha` α `0.0941` light / `0.1882` dark; `popover-alpha` is **white** in light (`oklch(1 0 0 / 0.9098)`) but a dark ink in dark (`α 0.8471`); `popover-backdrop` α `0.9098` both; `background-hover-alpha` α `0.0627` both. The "ink" tint = the background seed's hue/chroma at a fixed dark L (`0.13`), matching the curated `*-a*` tone alphas.

- [ ] **Step 1: Failing test — assert BOTH modes**

```ts
it('emits mode-correct translucent tokens', () => {
  const base = {
    light: { accent: '#2563eb', background: '#ffffff', foreground: '#181818' },
    dark: { accent: '#2563eb', background: '#181818', foreground: '#ffffff' },
    contrast: 60,
  };
  const { light, dark } = deriveTheme({ appearance: 'light', ...base });
  // overlay: alpha differs by mode
  expect(light['--nx-color-overlay']).toMatch(/\/ 0\.7529\)$/);
  expect(dark['--nx-color-overlay']).toMatch(/\/ 0\.8471\)$/);
  // border-default-alpha: alpha differs by mode
  expect(light['--nx-color-border-default-alpha']).toMatch(/\/ 0\.0941\)$/);
  expect(dark['--nx-color-border-default-alpha']).toMatch(/\/ 0\.1882\)$/);
  // popover-alpha: white in light, dark ink in dark
  expect(light['--nx-color-popover-alpha']).toBe('oklch(1 0 0 / 0.9098)');
  expect(dark['--nx-color-popover-alpha']).toMatch(/^oklch\(0\.13 /);
  // backdrop + bg-hover-alpha: same alpha both modes
  expect(light['--nx-color-popover-backdrop']).toMatch(/\/ 0\.9098\)$/);
  expect(light['--nx-color-background-hover-alpha']).toMatch(/\/ 0\.0627\)$/);
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Implement**

```ts
function deriveAlpha(backgroundHex: string, mode: Mode): TokenMap {
  const s = seedOklch(backgroundHex);
  const c = (s.c ?? 0).toFixed(4),
    h = (s.h ?? 0).toFixed(1);
  const ink = (a: number) => `oklch(0.13 ${c} ${h} / ${a})`;
  const dark = mode === 'dark';
  return {
    '--nx-color-overlay': ink(dark ? 0.8471 : 0.7529),
    '--nx-color-popover-backdrop': ink(0.9098),
    '--nx-color-border-default-alpha': ink(dark ? 0.1882 : 0.0941),
    '--nx-color-background-hover-alpha': ink(0.0627),
    '--nx-color-popover-alpha': dark ? ink(0.8471) : 'oklch(1 0 0 / 0.9098)',
  };
}
// in deriveMode: add `...deriveAlpha(seeds.background, mode)`
```

- [ ] **Step 4: Run → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): derive mode-aware translucent/alpha tokens"`

---

### Task 7: Token KEY-parity invariant (derived keys == curated keys, incl. charts)

**Files:** Test: `packages/core/src/lib/derive-theme.parity.test.ts` (new)

**Interfaces:** Consumes `deriveTheme`. Reads the curated key set from `base-slate.css` + `brands-blue.css` **+ `chart-categorical-default.css`** (chart tokens live in their own file — without it the parity gate never proves chart coverage). This asserts **key** parity (names), not value parity.

- [ ] **Step 1: Write the test**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { deriveTheme } from './derive-theme';

const PRIMITIVE = /-(50|100|200|300|400|500|600|700|800|900|950|base|a\d+)$/;
function curatedKeys(): Set<string> {
  const css = ['base-slate', 'brands-blue', 'chart-categorical-default']
    .map((f) => readFileSync(`apps/console/public/themes/${f}.css`, 'utf8'))
    .join('\n');
  const keys = new Set<string>();
  for (const m of css.matchAll(/(--nx-color-[\w-]+):/g)) {
    if (!PRIMITIVE.test(m[1])) keys.add(m[1]); // chart-categorical-1..5 survive (not primitives)
  }
  return keys;
}

it('deriveTheme emits every curated semantic --nx-color-* key (key parity)', () => {
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

- [ ] **Step 2: Run → FAIL**, listing remaining underived keys (e.g. `nav-border`, any stray border/control token). Add each to its deriver (`nav-border` → `SURFACE_STEPS`, etc.) until `missing` is `[]`.
- [ ] **Step 3: Run → PASS.**
- [ ] **Step 4: Commit** — `git commit -am "test(core): assert deriveTheme key-parity with the full curated set (incl. charts)"`

---

### Task 8: Extend the APCA legibility sweep (background AND subtle) + colorblind

**Files:** Modify the legibility sweep in `derive-theme.test.ts`

**Interfaces:** Across the sweep's seed matrix and both modes, assert, for every status family **and secondary**: `-foreground` on `-background`, **and** `-subtle-foreground` on `-subtle`.

- [ ] **Step 1: Extend the sweep** — inside the existing loop over seed contracts/modes:

```ts
for (const fam of ['success', 'warning', 'error', 'information', 'secondary']) {
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

- [ ] **Step 2: Run → PASS.** If a `-subtle-foreground` fails, make that token APCA-derived (run it through the same `readableOn`/`quietText` check against its subtle surface) rather than a fixed ramp shade. Re-run → PASS.
- [ ] **Step 3: Commit** — `git commit -am "test(core): APCA sweep covers status + secondary on background AND subtle"`

---

### Task 9: Tone-seed calibration + the cutover gate (no silent escape hatch)

**Files:** Test: `packages/core/src/lib/tone-parity.test.ts` (new); fixture: `tone-curated.fixture.json`; data: a `TONE_SEEDS` constant.

**Interfaces:** For each of the 5 named tones, the derived surfaces must be within tolerance of today's curated values. **Phase A is not complete until all five tones pass** — there is no "ship anyway and keep the curated file" follow-up. If a tone genuinely cannot be matched, that is a blocking decision: either fix the derivation or make those specific tokens an _explicit, documented_ item of the public package contract (Phase B), not a silent residual.

- [ ] **Step 1: Build the curated fixture** — run the extraction (the approach in `reports/curated-vs-engine-tones.html` / a small node script over `base-*.css` + `color.css`) to get curated `{background,muted,container,popover,border-default}` per tone/mode; write `tone-curated.fixture.json`.

- [ ] **Step 2: Write the parity test** (dark surfaces; light is flat by Q4 so background drives it):

```ts
import curated from './tone-curated.fixture.json';
const L = (s: string) => Number(s.match(/oklch\(([\d.]+)/)![1]);

it.each(['slate', 'neutral', 'zinc', 'gray', 'stone'])(
  'engine reproduces the %s tone within tolerance (dark)',
  (tone) => {
    const seed = TONE_SEEDS[tone]; // { light:{accent,background,foreground}, dark:{...} }
    const { dark } = deriveTheme({
      appearance: 'dark',
      light: seed.light,
      dark: seed.dark,
      contrast: TONE_CONTRAST,
    });
    for (const tok of ['container', 'popover', 'muted']) {
      expect(
        Math.abs(L(dark[`--nx-color-${tok}`]) - L(curated[tone].dark[tok]))
      ).toBeLessThanOrEqual(0.04);
    }
  }
);
```

- [ ] **Step 3: Calibrate** — start `TONE_SEEDS[tone]` = the curated background/foreground; run; if a surface exceeds tolerance, adjust `TONE_CONTRAST` (curated dark sits near Δ≈0.09 → contrast ≈ 90) and/or the seed L until green. **All five must pass** before this task is done.
- [ ] **Step 4: Run → PASS for all five.**
- [ ] **Step 5: Commit** — `git commit -am "feat(core): calibrate 5 tone seeds; full-parity cutover gate"`

---

## Done when

- `pnpm test:unit` green: the key-parity invariant (Task 7), the extended APCA sweep (Task 8, background + subtle), and tone parity for **all five** tones (Task 9).
- `pnpm --filter @nexus/core audit:colorblind` green.
- `pnpm typecheck && pnpm lint` clean.
- A `deriveTheme` call emits **every** curated semantic `--nx-color-*` key (incl. `chart-categorical-*`) — verified, not asserted by hand.
- No tone left on static CSS as a silent follow-up: every named tone is either derived within tolerance or its residual tokens are an explicit, documented public-contract item.

Phase B (packaging) consumes this surface; do not start it until Task 7 + Task 9 are green (the token set is the public contract B freezes).
