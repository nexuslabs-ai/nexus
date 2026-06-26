import type { Oklch } from 'culori';

import { apcaLc } from './apca';
import { formatOklch } from './oklch-format';
import { type Shade, type Tier, TIER_THRESHOLDS } from './palette';
import { rampFromSeed, seedOklch } from './perceptual-ramp';

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

/**
 * Quietest legible text tier. Start `quiet` of the way from the foreground
 * toward its surface (softer = lower contrast), then walk back toward the
 * foreground until the APCA floor is met — so muted text is as quiet as
 * legibility allows, not as loud as the tier permits. `quiet = 0` returns the
 * foreground itself (full contrast). Never throws: if even the foreground
 * fails the floor, snap to the higher-contrast black/white endpoint.
 */
function quietText(
  fg: Oklch,
  surfaceColor: string,
  floor: number,
  quiet: number
): string {
  const surfL = seedOklch(surfaceColor).l ?? 0;
  const fgL = fg.l ?? 0;
  const c = fg.c ?? 0;
  const h = fg.h ?? 0;
  for (let q = quiet; q > 0; q -= 0.1) {
    const candidate = formatOklch({
      mode: 'oklch',
      l: clamp01(fgL + (surfL - fgL) * q),
      c,
      h,
    });
    if (apcaLc(candidate, surfaceColor) >= floor) return candidate;
  }
  const fgString = formatOklch({ mode: 'oklch', l: fgL, c, h });
  if (apcaLc(fgString, surfaceColor) >= floor) return fgString;
  return apcaLc('oklch(1 0 0)', surfaceColor) >=
    apcaLc('oklch(0 0 0)', surfaceColor)
    ? 'oklch(1 0 0)'
    : 'oklch(0 0 0)';
}

/** Each text token: the surface it sits on, its APCA floor, and how quiet to aim. */
const TEXT_ON: Record<string, { surface: string; tier: Tier; quiet: number }> =
  {
    foreground: { surface: '--nx-color-background', tier: 'body', quiet: 0 },
    'container-foreground': {
      surface: '--nx-color-container',
      tier: 'body',
      quiet: 0,
    },
    'popover-foreground': {
      surface: '--nx-color-popover',
      tier: 'body',
      quiet: 0,
    },
    'nav-foreground': {
      surface: '--nx-color-nav-background',
      tier: 'body',
      quiet: 0,
    },
    'muted-foreground': {
      surface: '--nx-color-background',
      tier: 'ui',
      quiet: 0.4,
    },
    'nav-muted-foreground': {
      surface: '--nx-color-nav-background',
      tier: 'ui',
      quiet: 0.4,
    },
    'muted-foreground-subtle': {
      surface: '--nx-color-background',
      tier: 'incidental',
      quiet: 0.55,
    },
    'disabled-foreground': {
      surface: '--nx-color-disabled',
      tier: 'incidental',
      quiet: 0.5,
    },
  };

/** Text tiers, each guaranteed to clear its APCA floor on its surface. */
export function deriveText(
  foregroundHex: string,
  surfaces: TokenMap
): TokenMap {
  const fg = seedOklch(foregroundHex);
  const out: TokenMap = {};
  for (const [token, { surface, tier, quiet }] of Object.entries(TEXT_ON)) {
    const surfaceColor = surfaces[surface] ?? foregroundHex;
    out[`--nx-color-${token}`] = quietText(
      fg,
      surfaceColor,
      TIER_THRESHOLDS[tier],
      quiet
    );
  }
  return out;
}

/** Pick the on-color (black or white) with the higher APCA contrast against `bg`. */
function readableOn(bg: string): string {
  return apcaLc('oklch(1 0 0)', bg) >= apcaLc('oklch(0 0 0)', bg)
    ? 'oklch(1 0 0)'
    : 'oklch(0 0 0)';
}

/** First shade (in `order`) that clears `floor` against `bg`; else the black/white endpoint. */
function legibleShade(
  ramp: Record<Shade, string>,
  bg: string,
  floor: number,
  order: Shade[]
): string {
  for (const k of order) if (apcaLc(ramp[k], bg) >= floor) return ramp[k];
  return readableOn(bg);
}

/** 11 tokens for a named color family (background, foreground, subtle, borders). */
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

/** The 11-token primary family, from one accent seed. */
export const derivePrimary = (accentHex: string, mode: Mode): TokenMap =>
  deriveFamily('primary', rampFromSeed(accentHex), mode);

/** Tone-independent neutral surface family (9 tokens, no borders). */
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

function deriveMode(seeds: ThemeSeeds, mode: Mode, contrast: number): TokenMap {
  const delta = contrastDelta(contrast);
  const surfaces = deriveSurfaces(seeds.background, mode, delta);
  const text = deriveText(seeds.foreground, surfaces);
  const primary = derivePrimary(seeds.accent, mode);
  const secondary = deriveSecondary(mode);
  return { ...surfaces, ...text, ...primary, ...secondary };
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
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/** Serialize a derived theme to CSS text — light on `:root`, dark on `:root.dark`. */
export function themeToCss(derived: DerivedTheme): string {
  return `${block(':root', derived.light)}\n${block(':root.dark', derived.dark)}\n`;
}
