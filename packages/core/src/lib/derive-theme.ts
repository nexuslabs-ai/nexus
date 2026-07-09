import { clampChroma, type Oklch } from 'culori';

import { apcaLc } from './apca';
import { formatOklch } from './oklch-format';
import { type Shade, type Tier, TIER_THRESHOLDS } from './palette';
import { rampFromSeed, seedOklch } from './perceptual-ramp';

export interface ThemeSeeds {
  /** Drives the primary family ramp. */
  accent: string;
  /** Drives surface lightness. Hue/chroma come from `surfaceTone`. */
  background: string;
  /** Drives the text tiers. */
  foreground: string;
}

export type NexusSurfaceTone = 'stone' | 'neutral' | 'zinc' | 'slate' | 'gray';

/** The derivation seeds `deriveTheme` consumes — no display preference. */
export interface ThemeDerivationInput {
  surfaceTone?: NexusSurfaceTone;
  light: ThemeSeeds;
  dark: ThemeSeeds;
  /** 0–100. Separation between background↔surfaces and foreground↔text. */
  contrast: number;
}

export interface NexusThemeContract extends ThemeDerivationInput {
  /** Consumer display preference; not read by `deriveTheme`. */
  appearance: 'light' | 'dark' | 'system';
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
const CONTRAST_ANCHOR = 60;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (l: number) => Math.max(0.03, Math.min(1, l));
const clampContrast = (contrast: number) =>
  Math.max(0, Math.min(100, contrast));

interface ContrastProfile {
  surfaceDelta: number;
  borderAlpha: number;
  hoverAlpha: number;
}

const SURFACE_TONE: Record<
  NexusSurfaceTone,
  { h: number; lightC: number; darkC: number }
> = {
  slate: { h: 264.7, lightC: 0.011, darkC: 0.04 },
  gray: { h: 261.7, lightC: 0.008, darkC: 0.027 },
  zinc: { h: 262.8, lightC: 0.005, darkC: 0.005 },
  neutral: { h: 0, lightC: 0, darkC: 0 },
  stone: { h: 70, lightC: 0.008, darkC: 0.006 },
};

const PAGE_L_LIGHT = 1;
const LIGHT_CHROMA_DEPTH_MULTIPLIER = 1.4;
const FOCUS_APCA_FLOOR = 45;

function anchoredContrastLerp(
  contrast: number,
  min: number,
  anchor: number,
  max: number
): number {
  const c = clampContrast(contrast);
  if (c === CONTRAST_ANCHOR) return anchor;
  const value =
    c < CONTRAST_ANCHOR
      ? lerp(min, anchor, c / CONTRAST_ANCHOR)
      : lerp(anchor, max, (c - CONTRAST_ANCHOR) / (100 - CONTRAST_ANCHOR));
  return Number(value.toFixed(4));
}

function contrastProfile(mode: Mode, contrast: number): ContrastProfile {
  const dark = mode === 'dark';
  return {
    surfaceDelta: lerp(DELTA_MIN, DELTA_MAX, clampContrast(contrast) / 100),
    borderAlpha: anchoredContrastLerp(
      contrast,
      dark ? 0.12 : 0.06,
      dark ? 0.1882 : 0.0941,
      dark ? 0.2337 : 0.1168
    ),
    hoverAlpha: anchoredContrastLerp(
      contrast,
      dark ? 0.04 : 0.035,
      0.0627,
      dark ? 0.09 : 0.085
    ),
  };
}

/**
 * Canonical opaque-surface token set. Both regime step tables are typed against
 * these keys, so a surface added here must be given a light and dark step — a
 * missing or stray entry fails typecheck instead of silently falling back.
 */
const SURFACE_TOKENS = [
  'background',
  'background-hover',
  'background-active',
  'muted',
  'container',
  'container-hover',
  'container-active',
  'popover',
  'popover-hover',
  'popover-active',
  'control-background',
  'control-background-hover',
  'nav-background',
  'nav-item-hover',
  'nav-item-active',
  'nav-border',
  'disabled',
  'border-active',
] as const;

type SurfaceToken = (typeof SURFACE_TOKENS)[number];

/** Steps (in Δ units) each opaque surface sits from the page background. */
type SurfaceSteps = Record<SurfaceToken, number>;

const DARK_SURFACE_STEPS: SurfaceSteps = {
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
  'nav-background': 1.6,
  'nav-item-hover': 3.2,
  'nav-item-active': 3.2,
  'nav-border': 3.2,
  disabled: 1.6,
  'border-active': 9.68,
};

const LIGHT_SURFACE_STEPS: SurfaceSteps = {
  background: 0,
  'background-hover': -0.27,
  'background-active': -1.38,
  muted: -0.54,
  container: 0,
  'container-hover': -0.54,
  'container-active': -0.98,
  popover: 0,
  'popover-hover': -0.98,
  'popover-active': -0.98,
  'control-background': -1.38,
  'control-background-hover': -2.32,
  'nav-background': -0.54,
  'nav-item-hover': -1.38,
  'nav-item-active': -1.38,
  'nav-border': -1.38,
  disabled: -0.98,
  'border-active': -6.07,
};

/** Opaque surface tiers derived from the background seed + contrast Δ. */
export function deriveSurfaces(
  backgroundHex: string,
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  delta: number
): TokenMap {
  const bg = seedOklch(backgroundHex);
  const tone = SURFACE_TONE[surfaceTone];
  const dark = mode === 'dark';
  const anchorL = dark ? (bg.l ?? 0) : PAGE_L_LIGHT;
  const baseC = dark ? tone.darkC : tone.lightC;
  const out: TokenMap = {};
  for (const token of SURFACE_TOKENS) {
    const step = dark ? DARK_SURFACE_STEPS[token] : LIGHT_SURFACE_STEPS[token];
    const l = clamp01(anchorL + step * delta);
    const c = dark
      ? baseC
      : l >= 1
        ? 0
        : baseC * (1 + (1 - l) * LIGHT_CHROMA_DEPTH_MULTIPLIER);
    const color: Oklch = {
      mode: 'oklch',
      l,
      c,
      h: tone.h,
    };
    out[`--nx-color-${token}`] = formatOklch(color);
  }
  out['--nx-color-control-thumb'] = 'oklch(1 0 0)';
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
      surface: '--nx-color-muted',
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

function apcaSafeAgainst(color: string, bg: string, mode: Mode): string {
  const seed = seedOklch(color);
  const c = seed.c ?? 0;
  const h = seed.h ?? 0;
  const initialL = seed.l ?? (mode === 'dark' ? 1 : 0);
  const direction = mode === 'dark' ? 1 : -1;
  for (let step = 0; step <= 100; step += 1) {
    const candidate = formatOklch({
      mode: 'oklch',
      l: clamp01(initialL + direction * step * 0.01),
      c,
      h,
    });
    if (apcaLc(candidate, bg) >= FOCUS_APCA_FLOOR) return candidate;
  }
  return readableOn(bg);
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

/** Which ramp shades back a family's solid background/hover/active fills. */
interface SolidShades {
  background?: Shade;
  hover?: Shade;
  active?: Shade;
}

/** 11 tokens for a named color family (background, foreground, subtle, borders). */
export function deriveFamily(
  name: string,
  ramp: Record<Shade, string>,
  mode: Mode,
  solid: SolidShades = {}
): TokenMap {
  const dark = mode === 'dark';
  const p = `--nx-color-${name}`;
  const subtle = dark ? ramp['950'] : ramp['50'];
  const background = solid.background ?? '600';
  const hover = solid.hover ?? '700';
  const active = solid.active ?? '800';
  return {
    [`${p}-background`]: ramp[background],
    [`${p}-background-hover`]: ramp[hover],
    [`${p}-background-active`]: ramp[active],
    [`${p}-foreground`]: readableOn(ramp[background]),
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

const STATUS_FAMILIES = ['success', 'warning', 'error', 'information'] as const;

type StatusFamily = (typeof STATUS_FAMILIES)[number];

export const STATUS_RAMP = {
  success: {
    '50': 'oklch(0.982 0.035 137.785)',
    '100': 'oklch(0.96 0.0789 139.835)',
    '200': 'oklch(0.925 0.1596 139.892)',
    '300': 'oklch(0.87 0.3119 139.843)',
    '400': 'oklch(0.79 0.2864 140.349)',
    '500': 'oklch(0.72 0.2591 140.014)',
    '600': 'oklch(0.62 0.2233 140.055)',
    '700': 'oklch(0.52 0.1871 140.022)',
    '800': 'oklch(0.43 0.1534 139.623)',
    '900': 'oklch(0.34 0.1216 139.757)',
    '950': 'oklch(0.25 0.0887 139.4)',
  },
  warning: {
    '50': 'oklch(0.98 0.0185 73.684)',
    '100': 'oklch(0.955 0.0435 75.164)',
    '200': 'oklch(0.91 0.0819 70.697)',
    '300': 'oklch(0.84 0.142 66.29)',
    '400': 'oklch(0.78 0.1803 55.934)',
    '500': 'oklch(0.71 0.2099 47.604)',
    '600': 'oklch(0.62 0.2044 41.116)',
    '700': 'oklch(0.52 0.1809 38.402)',
    '800': 'oklch(0.43 0.153 37.304)',
    '900': 'oklch(0.34 0.1188 38.172)',
    '950': 'oklch(0.25 0.091 36.259)',
  },
  error: {
    '50': 'oklch(0.971 0.0176 28.865)',
    '100': 'oklch(0.936 0.0399 27.342)',
    '200': 'oklch(0.885 0.0747 27.394)',
    '300': 'oklch(0.808 0.1333 28.058)',
    '400': 'oklch(0.704 0.2267 27.842)',
    '500': 'oklch(0.637 0.2786 27.978)',
    '600': 'oklch(0.577 0.2523 27.926)',
    '700': 'oklch(0.505 0.2209 27.946)',
    '800': 'oklch(0.42 0.1838 28.144)',
    '900': 'oklch(0.34 0.1487 28.057)',
    '950': 'oklch(0.25 0.1094 28.309)',
  },
  information: {
    '50': 'oklch(0.97 0.0152 252.81)',
    '100': 'oklch(0.932 0.0342 257.472)',
    '200': 'oklch(0.882 0.0612 253.613)',
    '300': 'oklch(0.809 0.1012 254.248)',
    '400': 'oklch(0.707 0.1599 255.225)',
    '500': 'oklch(0.623 0.2112 255.145)',
    '600': 'oklch(0.546 0.2205 255.276)',
    '700': 'oklch(0.488 0.197 255.267)',
    '800': 'oklch(0.41 0.1633 254.871)',
    '900': 'oklch(0.33 0.1316 254.902)',
    '950': 'oklch(0.25 0.1042 256.214)',
  },
} satisfies Record<StatusFamily, Record<Shade, string>>;

function deriveStatus(mode: Mode): TokenMap {
  const out: TokenMap = {};
  for (const family of STATUS_FAMILIES) {
    const solid: SolidShades =
      family === 'warning'
        ? { background: '700', hover: '800', active: '900' }
        : {};
    Object.assign(out, deriveFamily(family, STATUS_RAMP[family], mode, solid));
  }
  return out;
}

export const CHART_LIGHT = [
  'oklch(0.52 0.1168 186.391)',
  'oklch(0.52 0.1871 140.022)',
  'oklch(0.62 0.2044 41.116)',
  'oklch(0.58 0.2489 17.585)',
  'oklch(0.49 0.2912 276.966)',
] as const;

export const CHART_DARK = [
  'oklch(0.9 0.1682 180.426)',
  'oklch(0.93 0.2278 124.321)',
  'oklch(0.91 0.0819 70.697)',
  'oklch(0.885 0.0771 10.001)',
  'oklch(0.865 0.069 274.039)',
] as const;

function deriveChart(mode: Mode): TokenMap {
  const set = mode === 'dark' ? CHART_DARK : CHART_LIGHT;
  return Object.fromEntries(
    set.map((value, index) => [
      `--nx-color-chart-categorical-${index + 1}`,
      value,
    ])
  );
}

function formatAlpha(alpha: number): string {
  return alpha.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function deriveAlpha(
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  profile: ContrastProfile
): TokenMap {
  const tone = SURFACE_TONE[surfaceTone];
  const dark = mode === 'dark';
  const toneInk = (alpha: number) =>
    `oklch(0.13 ${tone.darkC.toFixed(4)} ${tone.h.toFixed(1)} / ${formatAlpha(alpha)})`;
  const contrastInk = (alpha: number) =>
    dark
      ? `oklch(1 0 0 / ${formatAlpha(alpha)})`
      : `oklch(0.1448 0 0 / ${formatAlpha(alpha)})`;

  return {
    '--nx-color-overlay': toneInk(dark ? 0.8471 : 0.7529),
    '--nx-color-popover-backdrop': toneInk(0.9098),
    '--nx-color-border-default-alpha': toneInk(profile.borderAlpha),
    '--nx-color-background-hover-alpha': toneInk(profile.hoverAlpha),
    '--nx-color-popover-alpha': dark
      ? toneInk(0.7529)
      : 'oklch(1 0 0 / 0.7529)',
    '--nx-color-border-hairline': contrastInk(0.0941),
    '--nx-color-border-default': contrastInk(profile.borderAlpha),
    '--nx-color-border-disabled': contrastInk(profile.borderAlpha),
  };
}

function deriveFocus(
  mode: Mode,
  surfaces: TokenMap,
  primary: TokenMap
): TokenMap {
  const errorSeed = STATUS_RAMP.error[mode === 'dark' ? '300' : '600'];
  const background =
    surfaces['--nx-color-background'] ??
    (mode === 'dark' ? 'oklch(0 0 0)' : 'oklch(1 0 0)');
  const primaryFocus = primary['--nx-color-primary-subtle-foreground'];

  if (primaryFocus === undefined) {
    throw new Error(
      'deriveFocus: missing --nx-color-primary-subtle-foreground'
    );
  }

  return {
    '--nx-color-focus-default': apcaSafeAgainst(primaryFocus, background, mode),
    '--nx-color-focus-error': apcaSafeAgainst(errorSeed, background, mode),
  };
}

/** Tone-independent neutral surface family (9 tokens, no borders). */
export const NEUTRAL = {
  '50': 'oklch(0.985 0 0)',
  '100': 'oklch(0.945 0 0)',
  '200': 'oklch(0.87 0 0)',
  '300': 'oklch(0.765 0 0)',
  '600': 'oklch(0.46 0 0)',
  '700': 'oklch(0.385 0 0)',
  '800': 'oklch(0.297 0 0)',
  '900': 'oklch(0.207 0 0)',
  '950': 'oklch(0.118 0 0)',
} satisfies Record<Exclude<Shade, '400' | '500'>, string>;

// P3 cusp gamut for the solid fill, matching the perceptual ramp's emit target.
const FILL_GAMUT = 'p3';
// The primary fill follows the brand seed's own lightness rather than a fixed
// mid-tone shade, so the button *is* the chosen color: a deep navy stays deep
// navy, and #000 stays black. Light mode honors the seed directly, capped so a
// near-white brand still reads as a filled button. Dark mode honors light/mid
// seeds but lifts dark ones toward light — so a black brand becomes a white
// button that stays legible on a dark surface.
const PRIMARY_FILL_LIGHT_CAP = 0.85;
const PRIMARY_DARK_HONOR_FLOOR = 0.45;
const PRIMARY_DARK_LIFT_EXPONENT = 1.6;
const PRIMARY_HOVER_STEP = 0.05;
const PRIMARY_ACTIVE_STEP = 0.1;

function primaryFillLightness(seedL: number, mode: Mode): number {
  if (mode === 'light') return clamp01(Math.min(seedL, PRIMARY_FILL_LIGHT_CAP));
  if (seedL >= PRIMARY_DARK_HONOR_FLOOR) return clamp01(seedL);
  // Below the floor, lift toward white so a dark seed stays legible on a dark
  // surface. The coefficient is `1 - floor` so the curve meets the honor branch
  // exactly at the floor (continuous, no jump); the exponent shapes how hard
  // near-black seeds push toward white.
  const t = seedL / PRIMARY_DARK_HONOR_FLOOR;
  return clamp01(
    1 - (1 - PRIMARY_DARK_HONOR_FLOOR) * Math.pow(t, PRIMARY_DARK_LIFT_EXPONENT)
  );
}

// Hover/active nudge the fill toward mid-grey so the state change reads at any
// fill lightness: dark fills lighten, light fills darken.
const towardMid = (l: number, step: number): number =>
  clamp01(l < 0.5 ? l + step : l - step);

const seedFill = (l: number, c: number, h: number): string =>
  formatOklch(clampChroma({ mode: 'oklch', l, c, h }, 'oklch', FILL_GAMUT));

const bestOnColorLc = (fill: string): number =>
  Math.max(apcaLc('oklch(1 0 0)', fill), apcaLc('oklch(0 0 0)', fill));

// Honoring the seed's lightness can land the fill in a mid band where neither a
// black nor white label clears the ui tier. Nudge the fill toward whichever
// extreme its better on-color already prefers until a pure label passes — a
// no-op for dark or saturated seeds, active only in that band.
function legibleFillLightness(l: number, c: number, h: number): number {
  const fill = seedFill(l, c, h);
  if (bestOnColorLc(fill) >= TIER_THRESHOLDS.ui) return l;
  const dir =
    apcaLc('oklch(1 0 0)', fill) >= apcaLc('oklch(0 0 0)', fill) ? -1 : 1;
  for (let step = 1; step <= 100; step += 1) {
    const candidate = clamp01(l + dir * step * 0.01);
    if (bestOnColorLc(seedFill(candidate, c, h)) >= TIER_THRESHOLDS.ui) {
      return candidate;
    }
  }
  return l;
}

// The base, hover, and active fills share one `-foreground` label, so nudging
// hover/active toward mid can erode that fixed label below the ui tier even
// though the base fill cleared it. Nudge toward mid for the state cue, but stop
// at the furthest point where the shared label still clears — legibility of the
// label outranks the size of the state cue in the rare mid-band. The base fill
// clears by construction, so it is always a legible fallback.
function stateFillLightness(
  baseL: number,
  step: number,
  label: string,
  c: number,
  h: number
): number {
  const target = towardMid(baseL, step);
  const dir = target >= baseL ? 1 : -1;
  const span = Math.round(Math.abs(target - baseL) * 100);
  for (let s = span; s >= 1; s -= 1) {
    const candidate = clamp01(baseL + dir * s * 0.01);
    if (apcaLc(label, seedFill(candidate, c, h)) >= TIER_THRESHOLDS.ui) {
      return candidate;
    }
  }
  return baseL;
}

/**
 * The 11-token primary family from one accent seed. Supporting shades (subtle,
 * borders, disabled) come from the seed ramp via {@link deriveFamily}; the solid
 * fill and its on-color follow the seed's own lightness.
 */
export function derivePrimary(accentHex: string, mode: Mode): TokenMap {
  const seed = seedOklch(accentHex);
  const h = seed.h ?? 0;
  const c = seed.c ?? 0;
  const fillL = legibleFillLightness(
    primaryFillLightness(seed.l ?? 0, mode),
    c,
    h
  );
  const background = seedFill(fillL, c, h);
  const label = readableOn(background);
  return {
    ...deriveFamily('primary', rampFromSeed(accentHex), mode),
    '--nx-color-primary-background': background,
    '--nx-color-primary-background-hover': seedFill(
      stateFillLightness(fillL, PRIMARY_HOVER_STEP, label, c, h),
      c,
      h
    ),
    '--nx-color-primary-background-active': seedFill(
      stateFillLightness(fillL, PRIMARY_ACTIVE_STEP, label, c, h),
      c,
      h
    ),
    '--nx-color-primary-foreground': label,
  };
}

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

function deriveMode(
  seeds: ThemeSeeds,
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  contrast: number
): TokenMap {
  const profile = contrastProfile(mode, contrast);
  const surfaces = deriveSurfaces(
    seeds.background,
    surfaceTone,
    mode,
    profile.surfaceDelta
  );
  const text = deriveText(seeds.foreground, surfaces);
  const primary = derivePrimary(seeds.accent, mode);
  const secondary = deriveSecondary(mode);
  const status = deriveStatus(mode);
  const chart = deriveChart(mode);
  const alpha = deriveAlpha(surfaceTone, mode, profile);
  const focus = deriveFocus(mode, surfaces, primary);
  return {
    ...surfaces,
    ...text,
    ...primary,
    ...secondary,
    ...status,
    ...chart,
    ...alpha,
    ...focus,
  };
}

/**
 * Expand derivation seeds into light + dark `--nx-color-*` maps. Both modes are
 * always derived; the consumer's `appearance` choice selects one at runtime.
 * Only tokens the engine computes are emitted (surfaces, text, borders, primary,
 * secondary, status, chart, alpha/translucent, focus).
 */
export function deriveTheme(input: ThemeDerivationInput): DerivedTheme {
  const surfaceTone = input.surfaceTone ?? 'neutral';
  return {
    light: deriveMode(input.light, surfaceTone, 'light', input.contrast),
    dark: deriveMode(input.dark, surfaceTone, 'dark', input.contrast),
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
