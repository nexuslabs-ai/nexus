# Codex Theming Engine — Implementation Plan (Phase 1: `@nexus/core`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pure, browser-safe `deriveTheme(contract)` to `@nexus/core` that expands ~3 color seeds + a contrast scalar into the full `--nx-color-*` semantic token set, with every text/surface pair guaranteed to clear its APCA tier.

**Architecture:** Reuse the existing OKLCH/perceptual-grid/APCA math (`adjust-contrast.ts`, `palette.ts`). New pure functions: a P3-cusp **ramp** generator (accent → 11 shades), a **surface** L-ladder (background + contrast → elevation tiers), an APCA-gated **text** deriver (foreground + surfaces → legible text tiers), a **primary-family** mapper, and a `themeToCss` serializer. No UI, no DOM — just `contract → { light, dark } token maps`.

**Tech Stack:** TypeScript (ESM), `culori` (OKLCH math), `apca-w3` (contrast), `vitest` (unit tests). Built with `tsup` to `dist/runtime`.

**Scope note:** This plan is the engine only — it is independently testable and shippable. The console `useDerivedTheme` hook and the pixel-faithful Appearance screen (spec §7–§9) are a **follow-up plan** that consumes the built engine. Spec: `docs/superpowers/specs/2026-06-09-codex-appearance-theming-design.md`.

---

## File Structure

All new files live in `packages/core/src/lib/` beside the existing `adjust-contrast.ts` / `palette.ts`, and are exported from `packages/core/src/index.ts`.

| File                                       | Responsibility                                                                                                                                         |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/core/src/lib/apca.ts`            | `apcaLc(fg, bg)` — absolute APCA Lc of two CSS colors. Thin reuse of `apca-w3` + `culori`.                                                             |
| `packages/core/src/lib/perceptual-ramp.ts` | `seedOklch`, `formatOklch`, `pinnedOklch`, `rampFromSeed` — browser-safe port of the build's pinned-ramp math (static JSON import, no `fs`).           |
| `packages/core/src/lib/derive-theme.ts`    | Types (`ThemeSeeds`, `CodexThemeContract`, `DerivedTheme`, `TokenMap`) + `deriveSurfaces`, `deriveText`, `derivePrimary`, `deriveTheme`, `themeToCss`. |
| `packages/core/src/lib/*.test.ts`          | One test file per source file above.                                                                                                                   |
| `packages/core/src/index.ts`               | Modify: re-export the new public API.                                                                                                                  |

Helpers reused (already exported / present): `adjustContrast` (`adjust-contrast.ts`), `PERCEPTUAL_L_GRID` / `SHADES` / `Shade` / `Tier` / `TIER_THRESHOLDS` (`palette.ts`).

**Run a single test file:** `pnpm exec vitest run --project=unit packages/core/src/lib/<name>.test.ts`
**Run all unit tests:** `pnpm test:unit`

---

## Task 1: `apcaLc` helper

**Files:**

- Create: `packages/core/src/lib/apca.ts`
- Test: `packages/core/src/lib/apca.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/core/src/lib/apca.test.ts
import { describe, expect, it } from 'vitest';

import { apcaLc } from './apca';

describe('apcaLc', () => {
  it('is high for black on white', () => {
    expect(apcaLc('#000000', '#ffffff')).toBeGreaterThan(100);
  });

  it('is ~0 for identical colors', () => {
    expect(apcaLc('#888888', '#888888')).toBeLessThan(1);
  });

  it('accepts oklch strings (what the engine produces)', () => {
    expect(apcaLc('oklch(1 0 0)', 'oklch(0.12 0 0)')).toBeGreaterThan(75);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/apca.test.ts`
Expected: FAIL — `Failed to resolve import "./apca"`.

- [ ] **Step 3: Write the implementation**

```ts
// packages/core/src/lib/apca.ts
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { clampChroma, converter, oklch, parse } from 'culori';

const toRgb = converter('rgb');

function toSrgbInts(input: string): [number, number, number] {
  const parsed = parse(input);
  if (!parsed) throw new Error(`apca: cannot parse color '${input}'`);
  const converted = oklch(parsed);
  if (!converted) throw new Error(`apca: cannot convert '${input}' to OKLCH`);
  const rgb = toRgb(clampChroma(converted, 'oklch', 'rgb'));
  const channel = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

/**
 * Absolute APCA Lc of `foreground` on `background`. Both accept any CSS color
 * string culori can parse (hex, rgb, oklch). Inputs must be opaque — alpha is
 * not pre-blended (mirrors the engine, which only emits opaque colors).
 */
export function apcaLc(foreground: string, background: string): number {
  return Math.abs(
    APCAcontrast(
      sRGBtoY(toSrgbInts(foreground)),
      sRGBtoY(toSrgbInts(background))
    ) as number
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/apca.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/apca.ts packages/core/src/lib/apca.test.ts
git commit -m "feat(core): add apcaLc contrast helper"
```

---

## Task 2: Perceptual ramp (accent → shades)

**Files:**

- Create: `packages/core/src/lib/perceptual-ramp.ts`
- Test: `packages/core/src/lib/perceptual-ramp.test.ts`

Ports the build's `hexToOklchPinned` math (`scripts/lib/perceptual-grid.js`) to browser-safe TS: pinned lightness from `PERCEPTUAL_L_GRID`, chroma at the P3 cusp × 0.95, optionally capped at the seed's own chroma (decision §10.5 → cusp capped at seed).

- [ ] **Step 1: Write the failing test**

```ts
// packages/core/src/lib/perceptual-ramp.test.ts
import { parse, oklch } from 'culori';
import { describe, expect, it } from 'vitest';

import { PERCEPTUAL_L_GRID, SHADES } from './palette';
import {
  formatOklch,
  pinnedOklch,
  rampFromSeed,
  seedOklch,
} from './perceptual-ramp';

function lOf(oklchStr: string): number {
  return oklch(parse(oklchStr)!)!.l!;
}

describe('pinnedOklch', () => {
  it('pins lightness to the grid value for the shade', () => {
    // L comes from the grid, not the seed, so a dark seed still yields a light shade-50
    expect(lOf(pinnedOklch('#1e3a8a', '50'))).toBeCloseTo(
      PERCEPTUAL_L_GRID['50'],
      2
    );
    expect(lOf(pinnedOklch('#1e3a8a', '600'))).toBeCloseTo(
      PERCEPTUAL_L_GRID['600'],
      2
    );
  });

  it('caps chroma at the seed when capAtSeedChroma (default)', () => {
    // a near-grey seed must not bloom into a vivid ramp
    const grey = oklch(parse('#6b7280')!)!;
    const shade = oklch(parse(pinnedOklch('#6b7280', '500'))!)!;
    expect(shade.c!).toBeLessThanOrEqual((grey.c ?? 0) + 1e-6);
  });
});

describe('rampFromSeed', () => {
  it('returns all 11 shades', () => {
    const ramp = rampFromSeed('#339cff');
    expect(Object.keys(ramp).sort()).toEqual([...SHADES].sort());
  });

  it('descends in lightness 50 → 950', () => {
    const ramp = rampFromSeed('#339cff');
    expect(lOf(ramp['50'])).toBeGreaterThan(lOf(ramp['500']));
    expect(lOf(ramp['500'])).toBeGreaterThan(lOf(ramp['950']));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/perceptual-ramp.test.ts`
Expected: FAIL — `Failed to resolve import "./perceptual-ramp"`.

- [ ] **Step 3: Write the implementation**

```ts
// packages/core/src/lib/perceptual-ramp.ts
import { clampChroma, oklch, type Oklch, parse } from 'culori';

import { PERCEPTUAL_L_GRID, type Shade, SHADES } from './palette';

// emit ships P3 chroma (browsers gamut-map at render); sit just inside the cusp.
const EMIT_GAMUT = 'p3';
const CUSP_FRACTION = 0.95;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Parse any CSS color string to OKLCH. Throws on unparseable input. */
export function seedOklch(input: string): Oklch {
  const parsed = parse(input);
  if (!parsed)
    throw new Error(`perceptual-ramp: cannot parse color '${input}'`);
  const converted = oklch(parsed);
  if (!converted)
    throw new Error(`perceptual-ramp: cannot convert '${input}' to OKLCH`);
  return converted;
}

/** Format an OKLCH color to the project's spot-check string form. */
export function formatOklch(color: Oklch): string {
  const finite = (v: number | undefined) =>
    typeof v === 'number' && Number.isFinite(v) ? v : 0;
  const l = round(finite(color.l), 4);
  const c = round(finite(color.c), 4);
  const h = c && color.h !== undefined ? round(finite(color.h), 3) : 0;
  return `oklch(${l} ${c} ${h})`;
}

export interface RampOptions {
  /** Cap cusp chroma at the seed's own chroma so a muted accent stays muted. @default true */
  capAtSeedChroma?: boolean;
}

/** One shade: pinned L at the seed's hue, chroma at the P3 cusp (optionally capped at the seed). */
export function pinnedOklch(
  seedHex: string,
  shade: Shade,
  options: RampOptions = {}
): string {
  const { capAtSeedChroma = true } = options;
  const seed = seedOklch(seedHex);
  const l = PERCEPTUAL_L_GRID[shade];
  const hue = seed.h ?? 0;
  const seedC = seed.c ?? 0;

  // Max chroma in P3 at this (L, hue): start past the gamut and clamp inward.
  const cuspC =
    clampChroma({ mode: 'oklch', l, c: 0.5, h: hue }, 'oklch', EMIT_GAMUT).c ??
    0;
  let chroma = cuspC * CUSP_FRACTION;
  if (capAtSeedChroma && seedC > 0) chroma = Math.min(chroma, seedC);

  const target: Oklch = { mode: 'oklch', l, c: chroma, h: hue };
  return formatOklch(clampChroma(target, 'oklch', EMIT_GAMUT));
}

export type Ramp = Record<Shade, string>;

/** Full 50→950 ramp from one seed color. */
export function rampFromSeed(seedHex: string, options: RampOptions = {}): Ramp {
  const ramp = {} as Ramp;
  for (const shade of SHADES)
    ramp[shade] = pinnedOklch(seedHex, shade, options);
  return ramp;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/perceptual-ramp.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/perceptual-ramp.ts packages/core/src/lib/perceptual-ramp.test.ts
git commit -m "feat(core): add perceptual ramp generator (browser-safe)"
```

---

## Task 3: Types + surface derivation

**Files:**

- Create: `packages/core/src/lib/derive-theme.ts`
- Test: `packages/core/src/lib/derive-theme.test.ts`

Surfaces are an L-ladder from the page background: dark mode elevates **lighter** (+), light mode recedes **darker** (−). The contrast scalar sets the step size `Δ = lerp(Δ_min, Δ_max, contrast/100)`. **`Δ_min`/`Δ_max` and the per-token steps are the tunable contrast formula (spec §10.1).**

- [ ] **Step 1: Write the failing test**

```ts
// packages/core/src/lib/derive-theme.test.ts
import { parse, oklch } from 'culori';
import { describe, expect, it } from 'vitest';

import { deriveSurfaces } from './derive-theme';

function lOf(oklchStr: string): number {
  return oklch(parse(oklchStr)!)!.l!;
}

describe('deriveSurfaces', () => {
  it('keeps background at the seed lightness', () => {
    const s = deriveSurfaces('#181818', 'dark', 0.05);
    expect(lOf(s['--nx-color-background'])).toBeCloseTo(lOf('#181818'), 1);
  });

  it('elevates container lighter than background in dark mode', () => {
    const s = deriveSurfaces('#181818', 'dark', 0.05);
    expect(lOf(s['--nx-color-container'])).toBeGreaterThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('recedes hover darker than background in light mode', () => {
    const s = deriveSurfaces('#ffffff', 'light', 0.05);
    expect(lOf(s['--nx-color-background-hover'])).toBeLessThan(
      lOf(s['--nx-color-background'])
    );
  });

  it('widens the ladder as contrast (delta) grows', () => {
    const lo = deriveSurfaces('#181818', 'dark', 0.02);
    const hi = deriveSurfaces('#181818', 'dark', 0.08);
    const spread = (s: Record<string, string>) =>
      lOf(s['--nx-color-popover']) - lOf(s['--nx-color-background']);
    expect(spread(hi)).toBeGreaterThan(spread(lo));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: FAIL — `deriveSurfaces is not exported` / import error.

- [ ] **Step 3: Write the implementation**

```ts
// packages/core/src/lib/derive-theme.ts
import { type Oklch } from 'culori';

import { formatOklch, seedOklch } from './perceptual-ramp';

export interface ThemeSeeds {
  /** Drives the primary family ramp. */
  accent: string;
  /** Drives the surface tiers. */
  background: string;
  /** Drives the text tiers. */
  foreground: string;
}

export interface CodexThemeContract {
  appearance: 'light' | 'dark' | 'system';
  light: ThemeSeeds;
  dark: ThemeSeeds;
  /** 0–100. Separation between background↔surfaces and foreground↔text. */
  contrast: number;
}

export type Mode = 'light' | 'dark';
export type TokenMap = Record<string, string>;
export interface DerivedTheme {
  light: TokenMap;
  dark: TokenMap;
}

// --- Tunable contrast model (spec §10.1) ---------------------------------
const DELTA_MIN = 0.02;
const DELTA_MAX = 0.08;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (l: number) => Math.max(0.03, Math.min(0.99, l));

/** Δ (per-step lightness offset) for a 0–100 contrast value. */
export function contrastDelta(contrast: number): number {
  const t = Math.max(0, Math.min(100, contrast)) / 100;
  return lerp(DELTA_MIN, DELTA_MAX, t);
}

/** Steps (in Δ units) each opaque surface sits from the page background. */
const SURFACE_STEPS: Record<string, number> = {
  background: 0,
  'background-hover': 1,
  'background-active': 1.4,
  muted: 1,
  container: 1,
  'container-hover': 1.8,
  'container-active': 1.4,
  popover: 1.8,
  'popover-hover': 2.6,
  'popover-active': 1.8,
  'control-background': 1.4,
  'control-background-hover': 2.2,
  'nav-background': 0.6,
  'nav-item-hover': 1.6,
  'nav-item-active': 1.6,
  disabled: 0.8,
  'border-default': 2.4,
  'border-active': 3.2,
  'border-disabled': 0.8,
};

/** Opaque surface tiers derived from the background seed + contrast Δ. */
export function deriveSurfaces(
  backgroundHex: string,
  mode: Mode,
  delta: number
): TokenMap {
  const bg = seedOklch(backgroundHex);
  const dir = mode === 'dark' ? 1 : -1;
  const c = bg.c ?? 0;
  const h = bg.h ?? 0;
  const out: TokenMap = {};
  for (const [token, step] of Object.entries(SURFACE_STEPS)) {
    const color: Oklch = {
      mode: 'oklch',
      l: clamp01((bg.l ?? 0) + dir * step * delta),
      c,
      h,
    };
    out[`--nx-color-${token}`] = formatOklch(color);
  }
  // control-thumb is always a near-white knob (matches base presets in both themes).
  out['--nx-color-control-thumb'] = formatOklch({
    mode: 'oklch',
    l: mode === 'dark' ? 0.97 : 0.99,
    c: c * 0.3,
    h,
  });
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/derive-theme.ts packages/core/src/lib/derive-theme.test.ts
git commit -m "feat(core): derive surface tiers from background + contrast"
```

---

## Task 4: APCA-gated text derivation

**Files:**

- Modify: `packages/core/src/lib/derive-theme.ts`
- Modify: `packages/core/src/lib/derive-theme.test.ts`

Primary foregrounds keep the seed when it already clears `body` on its surface, else snap via `adjustContrast`. Muted tiers always snap to their tier floor (`as quiet as legibility allows`). `safeContrast` never throws — on an unreachable tier it falls back to the maximum-contrast endpoint.

- [ ] **Step 1: Write the failing test (append)**

```ts
// append to packages/core/src/lib/derive-theme.test.ts
import { deriveText } from './derive-theme';
import { apcaLc } from './apca';
import { TIER_THRESHOLDS } from './palette';

describe('deriveText', () => {
  const surfaces = deriveSurfaces('#181818', 'dark', 0.05);

  it('keeps a white foreground that already passes body', () => {
    const t = deriveText('#ffffff', surfaces, 'dark');
    expect(lOf(t['--nx-color-foreground'])).toBeGreaterThan(0.97); // still ~white
  });

  it('produces foreground that clears the body tier on background', () => {
    const t = deriveText('#ffffff', surfaces, 'dark');
    expect(
      apcaLc(t['--nx-color-foreground'], surfaces['--nx-color-background'])
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.body);
  });

  it('muted-foreground clears ui and is quieter than foreground', () => {
    const t = deriveText('#ffffff', surfaces, 'dark');
    expect(
      apcaLc(
        t['--nx-color-muted-foreground'],
        surfaces['--nx-color-background']
      )
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
    expect(lOf(t['--nx-color-muted-foreground'])).toBeLessThan(
      lOf(t['--nx-color-foreground'])
    );
  });

  it('does not throw on a pathological mid-grey pairing', () => {
    const mid = deriveSurfaces('#7d7d7d', 'light', 0.05);
    expect(() => deriveText('#808080', mid, 'light')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: FAIL — `deriveText is not exported`.

- [ ] **Step 3: Write the implementation (append to derive-theme.ts)**

```ts
// append to packages/core/src/lib/derive-theme.ts
import { adjustContrast } from './adjust-contrast';
import { apcaLc } from './apca';
import { type Tier, TIER_THRESHOLDS } from './palette';

/** adjustContrast, but never throws: on an unreachable tier, return the max-contrast endpoint. */
function safeContrast(input: string, background: string, tier: Tier): string {
  try {
    return adjustContrast(input, { background, tier });
  } catch {
    // No shade hit the tier — pick the endpoint furthest from the surface.
    const white = 'oklch(1 0 0)';
    const black = 'oklch(0 0 0)';
    return apcaLc(white, background) >= apcaLc(black, background)
      ? white
      : black;
  }
}

/** Each text token: the surface var it sits on + the APCA tier it must clear. */
const TEXT_ON: Record<string, { surface: string; tier: Tier }> = {
  foreground: { surface: '--nx-color-background', tier: 'body' },
  'container-foreground': { surface: '--nx-color-container', tier: 'body' },
  'popover-foreground': { surface: '--nx-color-popover', tier: 'body' },
  'nav-foreground': { surface: '--nx-color-nav-background', tier: 'body' },
  'muted-foreground': { surface: '--nx-color-background', tier: 'ui' },
  'nav-muted-foreground': { surface: '--nx-color-nav-background', tier: 'ui' },
  'muted-foreground-subtle': {
    surface: '--nx-color-background',
    tier: 'incidental',
  },
  'disabled-foreground': { surface: '--nx-color-disabled', tier: 'incidental' },
};

const BODY_TOKENS = new Set([
  'foreground',
  'container-foreground',
  'popover-foreground',
  'nav-foreground',
]);

/** Text tiers, each guaranteed to clear its APCA floor on its surface. */
export function deriveText(
  foregroundHex: string,
  surfaces: TokenMap,
  _mode: Mode
): TokenMap {
  const out: TokenMap = {};
  for (const [token, { surface, tier }] of Object.entries(TEXT_ON)) {
    const surfaceColor = surfaces[surface];
    // Primary (body) text keeps the seed when it already passes — pure white stays white.
    if (
      BODY_TOKENS.has(token) &&
      apcaLc(foregroundHex, surfaceColor) >= TIER_THRESHOLDS[tier]
    ) {
      out[`--nx-color-${token}`] = formatOklch(seedOklch(foregroundHex));
      continue;
    }
    out[`--nx-color-${token}`] = safeContrast(
      foregroundHex,
      surfaceColor,
      tier
    );
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: PASS (8 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/derive-theme.ts packages/core/src/lib/derive-theme.test.ts
git commit -m "feat(core): derive APCA-gated text tiers"
```

---

## Task 5: Primary family from accent

**Files:**

- Modify: `packages/core/src/lib/derive-theme.ts`
- Modify: `packages/core/src/lib/derive-theme.test.ts`

Maps the accent ramp to the 9 primary states exactly as `brands-blue.css` does, picking the readable on-primary foreground (black/white) by APCA.

- [ ] **Step 1: Write the failing test (append)**

```ts
// append to packages/core/src/lib/derive-theme.test.ts
import { derivePrimary } from './derive-theme';

describe('derivePrimary', () => {
  it('maps primary-background to the 600 shade of the accent ramp', () => {
    const p = derivePrimary('#339cff', 'light');
    expect(p['--nx-color-primary-background']).toBeDefined();
    // hover is darker (700) than background (600)
    expect(lOf(p['--nx-color-primary-background-hover'])).toBeLessThan(
      lOf(p['--nx-color-primary-background'])
    );
  });

  it('picks an on-primary foreground that clears the ui tier', () => {
    const p = derivePrimary('#339cff', 'light');
    expect(
      apcaLc(
        p['--nx-color-primary-foreground'],
        p['--nx-color-primary-background']
      )
    ).toBeGreaterThanOrEqual(TIER_THRESHOLDS.ui);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: FAIL — `derivePrimary is not exported`.

- [ ] **Step 3: Write the implementation (append to derive-theme.ts)**

```ts
// append to packages/core/src/lib/derive-theme.ts
import { rampFromSeed } from './perceptual-ramp';

const WHITE = 'oklch(1 0 0)';
const BLACK = 'oklch(0 0 0)';

/** Pick the on-color (black or white) with the higher APCA contrast against `bg`. */
function readableOn(bg: string): string {
  return apcaLc(WHITE, bg) >= apcaLc(BLACK, bg) ? WHITE : BLACK;
}

/** The 9-state primary family + primary borders, from one accent seed. */
export function derivePrimary(accentHex: string, mode: Mode): TokenMap {
  const r = rampFromSeed(accentHex);
  const dark = mode === 'dark';
  return {
    '--nx-color-primary-background': r['600'],
    '--nx-color-primary-background-hover': r['700'],
    '--nx-color-primary-background-active': r['800'],
    '--nx-color-primary-foreground': readableOn(r['600']),
    '--nx-color-primary-disabled': dark ? r['950'] : r['300'],
    '--nx-color-primary-subtle': dark ? r['950'] : r['50'],
    '--nx-color-primary-subtle-foreground': dark ? r['300'] : r['600'],
    '--nx-color-primary-subtle-hover': dark ? r['900'] : r['100'],
    '--nx-color-primary-subtle-active': dark ? r['800'] : r['200'],
    '--nx-color-border-primary': dark ? r['700'] : r['200'],
    '--nx-color-border-primary-active': dark ? r['500'] : r['400'],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: PASS (10 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/derive-theme.ts packages/core/src/lib/derive-theme.test.ts
git commit -m "feat(core): derive primary family from accent"
```

---

## Task 6: `deriveTheme` + `themeToCss`

**Files:**

- Modify: `packages/core/src/lib/derive-theme.ts`
- Modify: `packages/core/src/lib/derive-theme.test.ts`

Assembles the per-mode maps for both light and dark blocks, and serializes to the same `html {}` / `html.dark {}` shape the preset CSS files use.

- [ ] **Step 1: Write the failing test (append)**

```ts
// append to packages/core/src/lib/derive-theme.test.ts
import {
  deriveTheme,
  themeToCss,
  type CodexThemeContract,
} from './derive-theme';

const CONTRACT: CodexThemeContract = {
  appearance: 'dark',
  light: { accent: '#2563eb', background: '#ffffff', foreground: '#0a0a0a' },
  dark: { accent: '#339cff', background: '#181818', foreground: '#ffffff' },
  contrast: 60,
};

describe('deriveTheme', () => {
  it('returns light and dark maps with the core tokens', () => {
    const d = deriveTheme(CONTRACT);
    for (const map of [d.light, d.dark]) {
      expect(map['--nx-color-background']).toBeDefined();
      expect(map['--nx-color-foreground']).toBeDefined();
      expect(map['--nx-color-primary-background']).toBeDefined();
      expect(map['--nx-color-container']).toBeDefined();
    }
  });

  it('uses the per-theme seed blocks', () => {
    const d = deriveTheme(CONTRACT);
    expect(lOf(d.dark['--nx-color-background'])).toBeLessThan(0.3); // dark seed
    expect(lOf(d.light['--nx-color-background'])).toBeGreaterThan(0.9); // light seed
  });
});

describe('themeToCss', () => {
  it('emits html and html.dark blocks', () => {
    const css = themeToCss(deriveTheme(CONTRACT));
    expect(css).toMatch(/html\s*\{/);
    expect(css).toMatch(/html\.dark\s*\{/);
    expect(css).toContain('--nx-color-background:');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: FAIL — `deriveTheme is not exported`.

- [ ] **Step 3: Write the implementation (append to derive-theme.ts)**

```ts
// append to packages/core/src/lib/derive-theme.ts

function deriveMode(seeds: ThemeSeeds, mode: Mode, contrast: number): TokenMap {
  const delta = contrastDelta(contrast);
  const surfaces = deriveSurfaces(seeds.background, mode, delta);
  const text = deriveText(seeds.foreground, surfaces, mode);
  const primary = derivePrimary(seeds.accent, mode);
  return { ...surfaces, ...text, ...primary };
}

/**
 * Expand a contract into light + dark `--nx-color-*` maps. Only the tokens the
 * engine computes are emitted (surfaces, text, borders, primary); status and
 * secondary families keep cascading from the loaded base/brand preset.
 */
export function deriveTheme(contract: CodexThemeContract): DerivedTheme {
  return {
    light: deriveMode(contract.light, 'light', contract.contrast),
    dark: deriveMode(contract.dark, 'dark', contract.contrast),
  };
}

function block(selector: string, map: TokenMap): string {
  const body = Object.entries(map)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/** Serialize a derived theme to CSS text — light on `html`, dark on `html.dark`. */
export function themeToCss(derived: DerivedTheme): string {
  return `${block('html', derived.light)}\n${block('html.dark', derived.dark)}\n`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: PASS (14 tests total).

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/lib/derive-theme.ts packages/core/src/lib/derive-theme.test.ts
git commit -m "feat(core): assemble deriveTheme + themeToCss serializer"
```

---

## Task 7: The legibility invariant (APCA sweep)

**Files:**

- Modify: `packages/core/src/lib/derive-theme.test.ts`

The load-bearing guarantee: across many free-form contracts, **every** derived text tier clears its APCA floor on its surface — Codex's manual slider can't, but Nexus's gate does. (Seeds are drawn deterministically — no `Math.random`, which is unavailable in this repo's test env and would break determinism.)

- [ ] **Step 1: Write the test (append)**

```ts
// append to packages/core/src/lib/derive-theme.test.ts

// Deterministic spread of dark + light contracts (no RNG — reproducible).
const SWEEP_SEEDS: ReadonlyArray<{
  accent: string;
  background: string;
  foreground: string;
  mode: 'light' | 'dark';
}> = [
  {
    accent: '#339cff',
    background: '#181818',
    foreground: '#ffffff',
    mode: 'dark',
  },
  {
    accent: '#0ea5e9',
    background: '#0b0f14',
    foreground: '#e6edf3',
    mode: 'dark',
  },
  {
    accent: '#e0651a',
    background: '#faf9f7',
    foreground: '#1a1714',
    mode: 'light',
  },
  {
    accent: '#16a34a',
    background: '#ffffff',
    foreground: '#0a0a0a',
    mode: 'light',
  },
  {
    accent: '#a855f7',
    background: '#101014',
    foreground: '#f5f3ff',
    mode: 'dark',
  },
  {
    accent: '#db2777',
    background: '#1c1117',
    foreground: '#fde7f1',
    mode: 'dark',
  },
];

describe('legibility invariant: every text tier clears its APCA floor', () => {
  it.each(SWEEP_SEEDS)(
    'contract %#',
    ({ accent, background, foreground, mode }) => {
      const seeds = { accent, background, foreground };
      const contract: CodexThemeContract = {
        appearance: mode,
        light: seeds,
        dark: seeds,
        contrast: 55,
      };
      const map = deriveTheme(contract)[mode];

      const checks: Array<[string, string, keyof typeof TIER_THRESHOLDS]> = [
        ['--nx-color-foreground', '--nx-color-background', 'body'],
        ['--nx-color-container-foreground', '--nx-color-container', 'body'],
        ['--nx-color-popover-foreground', '--nx-color-popover', 'body'],
        ['--nx-color-nav-foreground', '--nx-color-nav-background', 'body'],
        ['--nx-color-muted-foreground', '--nx-color-background', 'ui'],
        [
          '--nx-color-muted-foreground-subtle',
          '--nx-color-background',
          'incidental',
        ],
        [
          '--nx-color-primary-foreground',
          '--nx-color-primary-background',
          'ui',
        ],
      ];

      for (const [fg, bg, tier] of checks) {
        expect(
          apcaLc(map[fg], map[bg]),
          `${fg} on ${bg}`
        ).toBeGreaterThanOrEqual(TIER_THRESHOLDS[tier]);
      }
    }
  );
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec vitest run --project=unit packages/core/src/lib/derive-theme.test.ts`
Expected: PASS. If a tier fails for a realistic (non-pathological) contract, **tune the contrast/surface model in Task 3**, not the threshold — the threshold is the contract.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/lib/derive-theme.test.ts
git commit -m "test(core): APCA legibility sweep across free-form contracts"
```

---

## Task 8: Export the public API + build

**Files:**

- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Add exports**

```ts
// append to packages/core/src/index.ts
export type {
  CodexThemeContract,
  DerivedTheme,
  Mode,
  ThemeSeeds,
  TokenMap,
} from './lib/derive-theme';
export {
  contrastDelta,
  derivePrimary,
  deriveSurfaces,
  deriveText,
  deriveTheme,
  themeToCss,
} from './lib/derive-theme';
export { apcaLc } from './lib/apca';
export { pinnedOklch, rampFromSeed } from './lib/perceptual-ramp';
```

- [ ] **Step 2: Typecheck + full unit suite + build**

Run: `pnpm --filter @nexus/core typecheck && pnpm test:unit && pnpm --filter @nexus/core build`
Expected: typecheck clean; all unit tests PASS; `tsup` emits `dist/runtime/index.js` + `index.d.ts` containing `deriveTheme`.

- [ ] **Step 3: Verify the built type surface**

Run: `grep -c "deriveTheme" packages/core/dist/runtime/index.d.ts`
Expected: ≥ 1 (the engine is in the public build the console will import).

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/index.ts
git commit -m "feat(core): export the runtime theme-derivation engine"
```

---

## Self-Review (completed)

**Spec coverage (§6 engine):** accent→ramp = Tasks 2,5; bg+contrast→surfaces = Task 3; fg+contrast→APCA-gated text = Task 4; primary family map = Task 5; assemble + serialize = Task 6; APCA guarantee = Task 7; "keep status/secondary from preset" = realized by emitting only the computed subset (Task 6 docstring). Decision §10.5 (chroma cap) = Task 2. Decision §10.1 (contrast formula) = Task 3 constants, flagged tunable. Out of this plan's scope (own follow-up plan): §7 console hook, §8 screen, §9 import/export, typography/pref knobs.

**Placeholder scan:** none — every step has runnable code or an exact command.

**Type consistency:** `TokenMap`/`Mode`/`ThemeSeeds`/`CodexThemeContract`/`DerivedTheme` defined in Task 3, used consistently in 4–8. `seedOklch`/`formatOklch` defined Task 2, imported in Task 3. `apcaLc` defined Task 1, used in 4,5,7. `adjustContrast`/`TIER_THRESHOLDS`/`Tier`/`PERCEPTUAL_L_GRID`/`SHADES`/`Shade` are pre-existing exports from `adjust-contrast.ts`/`palette.ts`. `rampFromSeed` returns `Ramp = Record<Shade,string>`; consumed by index `r['600']` etc. — consistent.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-09-codex-theming-engine.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach? (Or: should I first write the **Phase 2 follow-up plan** — the console `useDerivedTheme` hook + the pixel-faithful Appearance screen — so both are ready before any code lands?)
