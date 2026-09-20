import { clampChroma, type Oklch } from 'culori';

import { apcaLc } from './apca';
import { APCA_PAIRS } from './apca-pairs';
import {
  bisect,
  constrainColors,
  contrastTarget,
  normalizeContrast,
} from './contrast';
import { formatOklch } from './oklch-format';
import {
  type Mode,
  type NexusSurfaceTone,
  type Shade,
  TIER_THRESHOLDS,
} from './palette';
import { rampFromSeed, seedOklch } from './perceptual-ramp';
import { getPaletteRamp, getPaletteShade } from './primitive-palette';
import {
  CHART_PALETTE_REFERENCES,
  STATUS_PALETTE_FAMILIES,
} from './semantic-palette-references';
import {
  anchorToStep,
  DARK_SURFACE_LADDER,
  LIGHT_SURFACE_LADDER,
  SURFACE_TOKENS,
  SURFACE_TONE,
  type SurfaceToken,
} from './surface-ladder';

export interface ThemeSeeds {
  /** Drives the primary family ramp. */
  accent: string;
  /** Drives surface lightness. Hue/chroma come from `surfaceTone`. */
  background: string;
  /** Drives text hue/lightness; tinted surface tones cap text chroma. */
  foreground: string;
}

/** The derivation seeds `deriveTheme` consumes — no display preference. */
export interface ThemeDerivationInput {
  surfaceTone?: NexusSurfaceTone;
  light: ThemeSeeds;
  dark: ThemeSeeds;
  /** 0–100 per mode. Higher values strengthen surface and content contrast. */
  contrast: {
    light: number;
    dark: number;
  };
}

export interface NexusThemeContract extends ThemeDerivationInput {
  /** Consumer display preference; not read by `deriveTheme`. */
  appearance: 'light' | 'dark' | 'system';
}

export type TokenMap = Record<string, string>;
export interface DerivedTheme {
  light: TokenMap;
  dark: TokenMap;
}

const clamp01 = (l: number) => Math.max(0.03, Math.min(1, l));

interface ContrastProfile {
  surfaceDelta: number;
  borderAlpha: number;
  hoverAlpha: number;
}

// Border and hover opacities hit their `anchor` value at this contrast and
// interpolate linearly on either side of it.
const CONTRAST_ANCHOR = 60;

function anchoredContrast(
  contrast: number,
  min: number,
  anchor: number,
  max: number
): number {
  const value =
    contrast <= CONTRAST_ANCHOR
      ? min + ((anchor - min) * contrast) / CONTRAST_ANCHOR
      : anchor +
        ((max - anchor) * (contrast - CONTRAST_ANCHOR)) /
          (100 - CONTRAST_ANCHOR);
  return Number(value.toFixed(4));
}

function contrastProfile(mode: Mode, contrast: number): ContrastProfile {
  const dark = mode === 'dark';
  return {
    surfaceDelta: 0.02 + (((dark ? 0.03 : 0.05) - 0.02) * contrast) / 100,
    borderAlpha: anchoredContrast(
      contrast,
      dark ? 0.12 : 0.06,
      dark ? 0.1882 : 0.0941,
      dark ? 0.2337 : 0.1168
    ),
    hoverAlpha: anchoredContrast(
      contrast,
      dark ? 0.04 : 0.035,
      0.0627,
      dark ? 0.09 : 0.085
    ),
  };
}

const WHITE_BASE = 'oklch(1 0 0)';

const isSurfaceToken = (name: string): name is SurfaceToken =>
  (SURFACE_TOKENS as readonly string[]).includes(name);

/** Opaque surface tiers derived from the background seed + contrast Δ. */
export function deriveSurfaces(
  backgroundHex: string,
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  delta: number,
  contrast = 50
): TokenMap {
  const tone = SURFACE_TONE[surfaceTone];
  const dark = mode === 'dark';
  const anchorL = dark
    ? Math.max(0.08, Math.min(0.32, seedOklch(backgroundHex).l))
    : 1;
  const baseC = dark ? tone.darkC : tone.lightC;
  const out: TokenMap = {};
  const ladder = dark ? DARK_SURFACE_LADDER : LIGHT_SURFACE_LADDER;
  const surfaceAt = (token: SurfaceToken, spacing: number) => {
    const step = anchorToStep(ladder[token], mode, surfaceTone);
    const l = clamp01(anchorL + step * spacing);
    const c = !dark && l >= 1 ? 0 : baseC;
    return formatOklch(
      clampChroma({ mode: 'oklch', l, c, h: tone.h }, 'oklch', 'p3')
    );
  };
  const endpoint = dark ? 'oklch(1 0 0)' : 'oklch(0 0 0)';
  const page = surfaceAt('background', 0);
  const pageMaximum = apcaLc(endpoint, page);
  const surfacePairs = APCA_PAIRS.flatMap(({ bg, tier, backdrop }) =>
    !backdrop && isSurfaceToken(bg) ? [{ bg, tier }] : []
  );
  const fits = (spacing: number) =>
    surfacePairs.every(
      ({ bg, tier }) =>
        apcaLc(endpoint, surfaceAt(bg, spacing)) >=
        (dark
          ? Math.min(contrastTarget(tier, contrast), pageMaximum)
          : TIER_THRESHOLDS[tier])
    );
  const spacing = fits(delta) ? delta : bisect(delta, 0, fits);
  for (const token of SURFACE_TOKENS)
    out[`--nx-color-${token}`] = surfaceAt(token, spacing);
  out['--nx-color-control-thumb'] = 'oklch(1 0 0)';
  return out;
}

/**
 * Text seed `quiet` of the way from the foreground toward its surface (softer =
 * lower contrast); `quiet = 0` is the foreground itself. The contrast solver
 * moves it back toward the foreground only as far as legibility requires.
 */
function quietText(fg: Oklch, surfaceColor: string, quiet: number): string {
  const surfL = seedOklch(surfaceColor).l ?? 0;
  const fgL = fg.l ?? 0;
  return formatOklch({
    mode: 'oklch',
    l: clamp01(fgL + (surfL - fgL) * quiet),
    c: fg.c ?? 0,
    h: fg.h ?? 0,
  });
}

/** Each text token: the surface it sits on and how quiet to aim. */
const TEXT_ON: Record<string, { surface: string; quiet: number }> = {
  'container-foreground': { surface: '--nx-color-container', quiet: 0 },
  'popover-foreground': { surface: '--nx-color-popover', quiet: 0 },
  'nav-foreground': { surface: '--nx-color-nav-background', quiet: 0 },
  'nav-muted-foreground': { surface: '--nx-color-nav-background', quiet: 0.4 },
  'disabled-foreground': { surface: '--nx-color-disabled', quiet: 0.5 },
  'muted-foreground': { surface: '--nx-color-background', quiet: 0.5 },
  'muted-foreground-subtle': { surface: '--nx-color-background', quiet: 0.6 },
};

/** Text seeds; the contrast solver makes them legible on every registered background. */
export function deriveText(
  foregroundHex: string,
  surfaces: TokenMap,
  mode: Mode
): TokenMap {
  const fg = seedOklch(foregroundHex);
  // A fixed light reference keeps text strength independent of moving surfaces.
  const textSurface = (name: string) =>
    mode === 'light' ? WHITE_BASE : (surfaces[name] ?? foregroundHex);
  const out: TokenMap = { '--nx-color-foreground': formatOklch(fg) };
  for (const [token, { surface, quiet }] of Object.entries(TEXT_ON))
    out[`--nx-color-${token}`] = quietText(fg, textSurface(surface), quiet);
  return out;
}

/**
 * Fill, subtle, and border seeds for a named color family. The contrast solver
 * adds the black/white `-foreground` label and resolves `-subtle-foreground`.
 */
export function deriveFamily(
  name: string,
  ramp: Readonly<Record<Shade, string>>,
  mode: Mode
): TokenMap {
  const dark = mode === 'dark';
  const p = `--nx-color-${name}`;
  return {
    [`${p}-background`]: ramp['600'],
    [`${p}-background-hover`]: ramp['700'],
    [`${p}-background-active`]: ramp['800'],
    [`${p}-disabled`]: dark ? ramp['950'] : ramp['300'],
    [`${p}-subtle`]: dark ? ramp['950'] : ramp['50'],
    [`${p}-subtle-foreground`]: dark ? ramp['300'] : ramp['600'],
    [`${p}-subtle-hover`]: dark ? ramp['900'] : ramp['100'],
    [`${p}-subtle-active`]: dark ? ramp['800'] : ramp['200'],
    [`--nx-color-border-${name}`]: dark ? ramp['700'] : ramp['200'],
    [`--nx-color-border-${name}-active`]: dark ? ramp['500'] : ramp['400'],
  };
}

function deriveStatus(mode: Mode): TokenMap {
  return Object.assign(
    {},
    ...Object.entries(STATUS_PALETTE_FAMILIES).map(([family, palette]) =>
      deriveFamily(family, getPaletteRamp(palette), mode)
    )
  );
}

function deriveChart(mode: Mode): TokenMap {
  return Object.fromEntries(
    CHART_PALETTE_REFERENCES.map((reference, index) => [
      `--nx-color-chart-categorical-${index + 1}`,
      getPaletteShade(reference.palette, reference[mode]),
    ])
  );
}

function deriveAlpha(
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  profile: ContrastProfile
): TokenMap {
  const tone = SURFACE_TONE[surfaceTone];
  const dark = mode === 'dark';
  const toneInk = (alpha: number) =>
    formatOklch({ mode: 'oklch', l: 0.13, c: tone.darkC, h: tone.h, alpha });
  const contrastInk = (alpha: number) =>
    formatOklch({ mode: 'oklch', l: dark ? 1 : 0.1448, c: 0, h: 0, alpha });

  return {
    '--nx-color-overlay': toneInk(dark ? 0.8471 : 0.7529),
    '--nx-color-popover-backdrop': toneInk(0.9098),
    '--nx-color-border-default-alpha': toneInk(profile.borderAlpha),
    '--nx-color-background-hover-alpha': toneInk(profile.hoverAlpha),
    '--nx-color-border-hairline': contrastInk(0.0941),
    '--nx-color-border-default': contrastInk(profile.borderAlpha),
    '--nx-color-border-disabled': contrastInk(profile.borderAlpha),
  };
}

// P3 cusp gamut for the solid fill, matching the perceptual ramp's emit target.
const FILL_GAMUT = 'p3';
// The primary fill follows the brand seed's own lightness rather than a fixed
// mid-tone shade, so the button *is* the chosen color: a deep navy stays deep
// navy, and #000 stays black. Light mode honors the seed directly, capped so a
// near-white brand still reads as a filled button. Dark mode honors light/mid
// seeds but lifts dark ones toward light — so a black brand becomes a white
// button that stays legible on a dark surface.
const PRIMARY_FILL_LIGHT_CAP = 0.85;
const PRIMARY_DARK_ENDPOINT_LIFT_FLOOR = 0.16;
const PRIMARY_LIGHT_ENDPOINT_CEIL = 0.99;
const PRIMARY_DARK_HONOR_FLOOR = 0.45;
const PRIMARY_DARK_LIFT_EXPONENT = 1.6;
const PRIMARY_HOVER_STEP = 0.05;
const PRIMARY_ACTIVE_STEP = 0.1;
const PRIMARY_ACTIVE_DARK_FILL_STEP = 0.03;
// Endpoint brand interactions follow the same authored Neutral palette as secondary fills.
const endpointL = (shade: Shade): number =>
  seedOklch(getPaletteShade('neutral', shade)).l ?? 0;

function primaryFillLightness(seedL: number, mode: Mode): number {
  if (mode === 'light') return clamp01(Math.min(seedL, PRIMARY_FILL_LIGHT_CAP));
  if (seedL <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR) return 1;
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

function hoverFillTarget(baseL: number): number {
  if (baseL <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR) {
    return endpointL('900');
  }
  if (baseL >= PRIMARY_LIGHT_ENDPOINT_CEIL) return endpointL('100');
  return towardMid(baseL, PRIMARY_HOVER_STEP);
}

function activeFillTarget(baseL: number): number {
  if (baseL <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR) {
    return endpointL('950');
  }
  if (baseL >= PRIMARY_LIGHT_ENDPOINT_CEIL) return endpointL('200');
  return clamp01(
    baseL < 0.5
      ? baseL - PRIMARY_ACTIVE_DARK_FILL_STEP
      : baseL - PRIMARY_ACTIVE_STEP
  );
}

/**
 * Primary family seeds from one accent. Supporting shades (subtle, borders,
 * disabled) come from the seed ramp via {@link deriveFamily}; the solid fills
 * follow the seed's own lightness, and the contrast solver moves any fill its
 * label can't read on.
 */
export function derivePrimary(accentHex: string, mode: Mode): TokenMap {
  const seed = seedOklch(accentHex);
  const h = seed.h ?? 0;
  const c = seed.c ?? 0;
  const fillL = primaryFillLightness(seed.l ?? 0, mode);
  return {
    ...deriveFamily('primary', rampFromSeed(accentHex), mode),
    '--nx-color-primary-background': seedFill(fillL, c, h),
    '--nx-color-primary-background-hover': seedFill(
      hoverFillTarget(fillL),
      c,
      h
    ),
    '--nx-color-primary-background-active': seedFill(
      activeFillTarget(fillL),
      c,
      h
    ),
  };
}

export function deriveSecondary(mode: Mode): TokenMap {
  const d = mode === 'dark';
  const n = getPaletteRamp('neutral');
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

const gamutColor = (value: string): string =>
  formatOklch(clampChroma(seedOklch(value), 'oklch', 'p3'));

// Text in each mode is capped at the opposite mode's surface chroma: light ink
// in dark mode sits closest to the light surfaces' tint, and vice versa.
const textChromaCap = (surfaceTone: NexusSurfaceTone, mode: Mode): number =>
  mode === 'dark'
    ? SURFACE_TONE[surfaceTone].lightC
    : SURFACE_TONE[surfaceTone].darkC;

/** Derive one mode's `--nx-color-*` map, so callers can cache each mode independently. */
export function deriveThemeMode(
  input: ThemeDerivationInput,
  mode: Mode
): TokenMap {
  const surfaceTone = input.surfaceTone ?? 'neutral';
  const seeds = input[mode];
  const contrast = normalizeContrast(input.contrast[mode]);
  const profile = contrastProfile(mode, contrast);
  const surfaces = deriveSurfaces(
    seeds.background,
    surfaceTone,
    mode,
    profile.surfaceDelta,
    contrast
  );
  let foreground = seeds.foreground;
  if (surfaceTone !== 'neutral') {
    const ink = seedOklch(foreground);
    foreground = formatOklch({
      ...ink,
      c: Math.min(ink.c, textChromaCap(surfaceTone, mode)),
    });
  }
  const candidates = {
    ...deriveText(foreground, surfaces, mode),
    ...derivePrimary(seeds.accent, mode),
    ...deriveSecondary(mode),
    ...deriveStatus(mode),
    ...deriveChart(mode),
    ...deriveAlpha(surfaceTone, mode, profile),
    '--nx-color-focus-error': getPaletteShade(
      STATUS_PALETTE_FAMILIES.error,
      mode === 'dark' ? '300' : '600'
    ),
  };
  const map = { ...surfaces };
  for (const [name, value] of Object.entries(candidates))
    map[name] = gamutColor(value);
  const popover = surfaces['--nx-color-popover'];
  if (!popover) throw new Error('deriveThemeMode: missing popover surface');
  map['--nx-color-popover-alpha'] = formatOklch({
    ...seedOklch(popover),
    alpha: 0.94 + (0.06 * contrast) / 100,
  });
  return constrainColors(map, mode, contrast);
}

/**
 * Expand derivation seeds into light + dark `--nx-color-*` maps. Both modes are
 * always derived; the consumer's `appearance` choice selects one at runtime.
 * Only tokens the engine computes are emitted (surfaces, text, borders, primary,
 * secondary, status, chart, alpha/translucent, focus).
 */
export function deriveTheme(input: ThemeDerivationInput): DerivedTheme {
  return {
    light: deriveThemeMode(input, 'light'),
    dark: deriveThemeMode(input, 'dark'),
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
