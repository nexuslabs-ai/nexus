import type { Oklch } from 'culori';

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
