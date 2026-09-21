import type { Oklch } from 'culori';

import { measureApca } from './apca';
import { APCA_PAIRS } from './apca-pairs';
import {
  constrainColors,
  contrastForPair,
  contrastTarget,
  normalizeContrast,
  pairTarget,
} from './contrast';
import { formatOklch } from './oklch-format';
import {
  type Mode,
  type NexusSurfaceTone,
  type Shade,
  type Tier,
  TIER_THRESHOLDS,
} from './palette';
import { rampFromSeed, seedOklch } from './perceptual-ramp';
import { readPaletteRamp, readPaletteShade } from './primitive-palette';
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
} from './surface-ladder';
import { clampThemeChroma } from './theme-gamut';
import {
  type ThemeInspection,
  ThemeTrace,
  type ThemeTraceEvent,
} from './theme-inspection';

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

function anchoredContrast(
  contrast: number,
  min: number,
  anchor: number,
  max: number
): number {
  const c = normalizeContrast(contrast);
  const value =
    c <= 60
      ? min + ((anchor - min) * c) / 60
      : anchor + ((max - anchor) * (c - 60)) / 40;
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

const FOCUS_APCA_FLOOR = 45;
const BLACK_BASE = 'oklch(0.1448 0 0)';
const WHITE_BASE = 'oklch(1 0 0)';

/** Opaque surface tiers derived from the background seed + contrast Δ. */
export function deriveSurfaces(
  backgroundHex: string,
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  delta: number,
  contrast = 50,
  trace?: ThemeTrace
): TokenMap {
  const tone = SURFACE_TONE[surfaceTone];
  const dark = mode === 'dark';
  const seedL = dark ? seedOklch(backgroundHex).l : 1;
  const anchorL = dark ? Math.max(0.08, Math.min(0.32, seedL)) : 1;
  trace?.decision('surface-anchor', {
    background: backgroundHex,
    tone: surfaceTone,
    seedLightness: dark ? seedL : null,
    anchorLightness: anchorL,
    delta,
    contrast,
    branch: dark ? 'dark-clamp' : 'white-plane',
  });
  const baseC = dark ? tone.darkC : tone.lightC;
  const out: TokenMap = {};
  const ladder = dark ? DARK_SURFACE_LADDER : LIGHT_SURFACE_LADDER;
  const surfaceAt = (
    token: (typeof SURFACE_TOKENS)[number],
    spacing: number
  ) => {
    const step = anchorToStep(ladder[token], mode, surfaceTone);
    const l = clamp01(anchorL + step * spacing);
    const c = !dark && l >= 1 ? 0 : baseC;
    const color = formatOklch(
      clampThemeChroma({ mode: 'oklch', l, c, h: tone.h }, 'p3', trace)
    );
    trace?.decision('surface-candidate', {
      token: `--nx-color-${token}`,
      step,
      spacing,
      lightness: l,
      chroma: c,
      hue: tone.h,
      color,
    });
    return color;
  };
  const endpoint = dark ? 'oklch(1 0 0)' : 'oklch(0 0 0)';
  const page = surfaceAt('background', 0);
  const pageMaximum = measureApca(endpoint, page, trace);
  const surfacePairs = APCA_PAIRS.filter(
    (pair) =>
      !pair.backdrop &&
      SURFACE_TOKENS.includes(pair.bg as (typeof SURFACE_TOKENS)[number])
  );
  const fits = (spacing: number) => {
    let evaluated = 0;
    const passed = surfacePairs.every((pair) => {
      const surface = surfaceAt(
        pair.bg as (typeof SURFACE_TOKENS)[number],
        spacing
      );
      const target = dark
        ? Math.min(contrastTarget(pair.tier, contrast), pageMaximum)
        : TIER_THRESHOLDS[pair.tier];
      evaluated += 1;
      const pairTrace = trace?.at('surfaces', `--nx-color-${pair.bg}`);
      pairTrace?.decision('surface-constraint', {
        foreground: pair.fg,
        background: pair.bg,
        tier: pair.tier,
        requested: dark
          ? contrastTarget(pair.tier, contrast)
          : TIER_THRESHOLDS[pair.tier],
        target,
        pageMaximum,
      });
      return measureApca(endpoint, surface, pairTrace, target) >= target;
    });
    trace?.decision('surface-spacing-check', {
      spacing,
      passed,
      evaluated,
      unevaluated: surfacePairs.length - evaluated,
    });
    return passed;
  };
  let spacing = delta;
  if (!fits(spacing)) {
    let low = 0;
    let high = delta;
    for (let i = 0; i < 12; i++) {
      const middle = (low + high) / 2;
      trace?.decision('surface-spacing-bisection', {
        iteration: i,
        low,
        high,
        middle,
      });
      if (fits(middle)) low = middle;
      else high = middle;
    }
    spacing = low;
  }
  trace?.decision('surface-spacing-result', {
    requested: delta,
    spacing,
    pageMaximum,
  });
  for (const token of SURFACE_TOKENS)
    out[`--nx-color-${token}`] = surfaceAt(token, spacing);
  out['--nx-color-control-thumb'] = 'oklch(1 0 0)';
  trace?.assignments(out, 'surface-ladder');
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
  quiet: number,
  trace?: ThemeTrace
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
    trace?.decision('quiet-text-candidate', { quiet: q, candidate, floor });
    if (measureApca(candidate, surfaceColor, trace, floor) >= floor)
      return candidate;
  }
  const fgString = formatOklch({ mode: 'oklch', l: fgL, c, h });
  trace?.decision('quiet-text-seed', { color: fgString, floor });
  if (measureApca(fgString, surfaceColor, trace, floor) >= floor)
    return fgString;
  trace?.decision('quiet-text-endpoint-fallback', { floor });
  return measureApca('oklch(1 0 0)', surfaceColor, trace) >=
    measureApca('oklch(0 0 0)', surfaceColor, trace)
    ? 'oklch(1 0 0)'
    : 'oklch(0 0 0)';
}

/** Each text token: the surface it sits on, its APCA floor, and how quiet to aim. */
const TEXT_ON: Record<string, { surface: string; tier: Tier; quiet: number }> =
  {
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
    'nav-muted-foreground': {
      surface: '--nx-color-nav-background',
      tier: 'ui',
      quiet: 0.4,
    },
    'disabled-foreground': {
      surface: '--nx-color-disabled',
      tier: 'incidental',
      quiet: 0.5,
    },
  };

/** Text candidates; shared-background constraints are resolved after composition. */
export function deriveText(
  foregroundHex: string,
  surfaces: TokenMap,
  mode: Mode,
  trace?: ThemeTrace
): TokenMap {
  const fg = seedOklch(foregroundHex);
  const out: TokenMap = {};
  // A fixed light reference keeps text strength independent of moving surfaces.
  const textSurface = (name: string) =>
    mode === 'light' ? WHITE_BASE : (surfaces[name] ?? foregroundHex);
  for (const [token, { surface, tier, quiet }] of Object.entries(TEXT_ON)) {
    out[`--nx-color-${token}`] = quietText(
      fg,
      textSurface(surface),
      TIER_THRESHOLDS[tier],
      quiet,
      trace?.at('text', `--nx-color-${token}`)
    );
  }
  return {
    ...out,
    '--nx-color-foreground': formatOklch(fg),
    '--nx-color-muted-foreground': quietText(
      fg,
      textSurface('--nx-color-background'),
      TIER_THRESHOLDS.incidental,
      0.5,
      trace?.at('text', '--nx-color-muted-foreground')
    ),
    '--nx-color-muted-foreground-subtle': quietText(
      fg,
      textSurface('--nx-color-background'),
      TIER_THRESHOLDS.incidental,
      0.6,
      trace?.at('text', '--nx-color-muted-foreground-subtle')
    ),
  };
}

/** Pick the on-color (black or white) with the higher APCA contrast against `bg`. */
function readableOn(bg: string, trace?: ThemeTrace): string {
  return measureApca('oklch(1 0 0)', bg, trace) >=
    measureApca('oklch(0 0 0)', bg, trace)
    ? 'oklch(1 0 0)'
    : 'oklch(0 0 0)';
}

function firstBackground(backgrounds: string[]): string {
  const bg = backgrounds[0];
  if (bg === undefined) {
    throw new Error('Expected at least one APCA background.');
  }
  return bg;
}

function apcaSafeAgainstAll(
  color: string,
  backgrounds: string[],
  mode: Mode,
  trace?: ThemeTrace
): string {
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
    let evaluated = 0;
    const passed = backgrounds.every((bg) => {
      evaluated += 1;
      return (
        measureApca(candidate, bg, trace, FOCUS_APCA_FLOOR) >= FOCUS_APCA_FLOOR
      );
    });
    trace?.decision('focus-candidate', {
      step,
      candidate,
      passed,
      evaluated,
      unevaluated: backgrounds.length - evaluated,
    });
    if (passed) return candidate;
  }
  trace?.decision('focus-endpoint-fallback', {
    background: firstBackground(backgrounds),
  });
  return readableOn(firstBackground(backgrounds), trace);
}

/** First shade (in `order`) that clears `floor` against `bg`; else the black/white endpoint. */
function legibleShade(
  ramp: Readonly<Record<Shade, string>>,
  bg: string,
  floor: number,
  order: Shade[],
  trace?: ThemeTrace
): string {
  for (const k of order) {
    trace?.decision('family-shade-candidate', {
      shade: k,
      color: ramp[k],
      floor,
    });
    if (measureApca(ramp[k], bg, trace, floor) >= floor) return ramp[k];
  }
  trace?.decision('family-endpoint-fallback', { background: bg });
  return readableOn(bg, trace);
}

function legibleShadeAcross(
  ramp: Readonly<Record<Shade, string>>,
  backgrounds: string[],
  floor: number,
  order: Shade[],
  trace?: ThemeTrace
): string {
  for (const k of order) {
    let evaluated = 0;
    const passed = backgrounds.every((bg) => {
      evaluated += 1;
      return measureApca(ramp[k], bg, trace, floor) >= floor;
    });
    trace?.decision('family-shade-across-candidate', {
      shade: k,
      color: ramp[k],
      floor,
      passed,
      evaluated,
      unevaluated: backgrounds.length - evaluated,
    });
    if (passed) return ramp[k];
  }
  trace?.decision('family-endpoint-fallback', {
    background: firstBackground(backgrounds),
  });
  return readableOn(firstBackground(backgrounds), trace);
}

function referencedShade(
  ramp: Readonly<Record<Shade, string>>,
  shade: Shade,
  token: string,
  trace?: ThemeTrace
): string {
  const value = ramp[shade];
  trace?.at(trace.stage, token).decision('ramp-reference', { shade, value });
  return value;
}

/** 11 tokens for a named color family (background, foreground, subtle, borders). */
export function deriveFamily(
  name: string,
  ramp: Readonly<Record<Shade, string>>,
  mode: Mode,
  trace?: ThemeTrace
): TokenMap {
  const dark = mode === 'dark';
  const p = `--nx-color-${name}`;
  const subtle = referencedShade(
    ramp,
    dark ? '950' : '50',
    `${p}-subtle`,
    trace
  );
  return {
    [`${p}-background`]: referencedShade(ramp, '600', `${p}-background`, trace),
    [`${p}-background-hover`]: referencedShade(
      ramp,
      '700',
      `${p}-background-hover`,
      trace
    ),
    [`${p}-background-active`]: referencedShade(
      ramp,
      '800',
      `${p}-background-active`,
      trace
    ),
    [`${p}-foreground`]: readableOn(
      ramp['600'],
      trace?.at(trace.stage, `${p}-foreground`)
    ),
    [`${p}-disabled`]: referencedShade(
      ramp,
      dark ? '950' : '300',
      `${p}-disabled`,
      trace
    ),
    [`${p}-subtle`]: subtle,
    [`${p}-subtle-foreground`]: legibleShade(
      ramp,
      subtle,
      TIER_THRESHOLDS.ui,
      dark ? ['300', '200', '100', '50'] : ['600', '700', '800', '900'],
      trace?.at(trace.stage, `${p}-subtle-foreground`)
    ),
    [`${p}-subtle-hover`]: referencedShade(
      ramp,
      dark ? '900' : '100',
      `${p}-subtle-hover`,
      trace
    ),
    [`${p}-subtle-active`]: referencedShade(
      ramp,
      dark ? '800' : '200',
      `${p}-subtle-active`,
      trace
    ),
    [`--nx-color-border-${name}`]: referencedShade(
      ramp,
      dark ? '700' : '200',
      `--nx-color-border-${name}`,
      trace
    ),
    [`--nx-color-border-${name}-active`]: referencedShade(
      ramp,
      dark ? '500' : '400',
      `--nx-color-border-${name}-active`,
      trace
    ),
  };
}

function deriveStatus(
  mode: Mode,
  surfaces: TokenMap,
  trace?: ThemeTrace
): TokenMap {
  const out: TokenMap = {};
  for (const [family, palette] of Object.entries(STATUS_PALETTE_FAMILIES)) {
    const familyTrace = trace?.at('status', `--nx-color-${family}`);
    familyTrace?.decision('status-palette', { family, palette });
    const ramp = readPaletteRamp(palette, familyTrace);
    const tokens = deriveFamily(family, ramp, mode, familyTrace);

    if (family === 'error') {
      const subtle = tokens['--nx-color-error-subtle'];
      const background = surfaces['--nx-color-background'];
      const container = surfaces['--nx-color-container'];
      if (!subtle || !background || !container) {
        throw new Error(
          'Expected error subtle, background, and container colors.'
        );
      }

      tokens['--nx-color-error-subtle-foreground'] = legibleShadeAcross(
        ramp,
        [subtle, background, container],
        TIER_THRESHOLDS.ui,
        mode === 'dark'
          ? ['300', '200', '100', '50']
          : ['600', '700', '800', '900'],
        trace?.at('status', '--nx-color-error-subtle-foreground')
      );
    }

    familyTrace?.assignments(tokens, `authored-${palette}-family`);
    Object.assign(out, tokens);
  }
  return out;
}

function deriveChart(mode: Mode, trace?: ThemeTrace): TokenMap {
  return Object.fromEntries(
    CHART_PALETTE_REFERENCES.map((reference, index) => [
      `--nx-color-chart-categorical-${index + 1}`,
      readPaletteShade(
        reference.palette,
        reference[mode],
        trace?.at('chart', `--nx-color-chart-categorical-${index + 1}`)
      ),
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
    '--nx-color-border-hairline': contrastInk(0.0941),
    '--nx-color-border-default': contrastInk(profile.borderAlpha),
    '--nx-color-border-disabled': contrastInk(profile.borderAlpha),
  };
}

function deriveFocus(
  mode: Mode,
  surfaces: TokenMap,
  primary: TokenMap,
  trace?: ThemeTrace
): TokenMap {
  const errorSeed = readPaletteShade(
    STATUS_PALETTE_FAMILIES.error,
    mode === 'dark' ? '300' : '600',
    trace?.at('focus', '--nx-color-focus-error')
  );
  const background =
    surfaces['--nx-color-background'] ??
    (mode === 'dark' ? 'oklch(0 0 0)' : 'oklch(1 0 0)');
  const focusBackgrounds = [
    background,
    surfaces['--nx-color-container'],
    surfaces['--nx-color-popover'],
    surfaces['--nx-color-nav-background'],
    surfaces['--nx-color-nav-item-hover'],
    surfaces['--nx-color-nav-item-active'],
    surfaces['--nx-color-nav-border'],
  ].filter((value): value is string => typeof value === 'string');
  const primaryFocus = primary['--nx-color-primary-subtle-foreground'];

  if (primaryFocus === undefined) {
    throw new Error(
      'deriveFocus: missing --nx-color-primary-subtle-foreground'
    );
  }

  return {
    '--nx-color-focus-default': apcaSafeAgainstAll(
      primaryFocus,
      focusBackgrounds,
      mode,
      trace?.at('focus', '--nx-color-focus-default')
    ),
    '--nx-color-focus-error': apcaSafeAgainstAll(
      errorSeed,
      focusBackgrounds,
      mode,
      trace?.at('focus', '--nx-color-focus-error')
    ),
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
const endpointL = (shade: Shade, trace?: ThemeTrace): number =>
  seedOklch(readPaletteShade('neutral', shade, trace)).l ?? 0;

function primaryFillLightness(
  seedL: number,
  mode: Mode,
  trace?: ThemeTrace
): number {
  if (mode === 'light') {
    const result = clamp01(Math.min(seedL, PRIMARY_FILL_LIGHT_CAP));
    trace?.decision('primary-fill-lightness', {
      branch: 'light-cap',
      seedLightness: seedL,
      cap: PRIMARY_FILL_LIGHT_CAP,
      result,
    });
    return result;
  }
  if (seedL <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR) {
    trace?.decision('primary-fill-lightness', {
      branch: 'dark-endpoint-lift',
      seedLightness: seedL,
      floor: PRIMARY_DARK_ENDPOINT_LIFT_FLOOR,
      result: 1,
    });
    return 1;
  }
  if (seedL >= PRIMARY_DARK_HONOR_FLOOR) {
    const result = clamp01(seedL);
    trace?.decision('primary-fill-lightness', {
      branch: 'dark-honor-seed',
      seedLightness: seedL,
      floor: PRIMARY_DARK_HONOR_FLOOR,
      result,
    });
    return result;
  }
  // Below the floor, lift toward white so a dark seed stays legible on a dark
  // surface. The coefficient is `1 - floor` so the curve meets the honor branch
  // exactly at the floor (continuous, no jump); the exponent shapes how hard
  // near-black seeds push toward white.
  const t = seedL / PRIMARY_DARK_HONOR_FLOOR;
  const result = clamp01(
    1 - (1 - PRIMARY_DARK_HONOR_FLOOR) * Math.pow(t, PRIMARY_DARK_LIFT_EXPONENT)
  );
  trace?.decision('primary-fill-lightness', {
    branch: 'dark-lift-curve',
    seedLightness: seedL,
    floor: PRIMARY_DARK_HONOR_FLOOR,
    exponent: PRIMARY_DARK_LIFT_EXPONENT,
    result,
  });
  return result;
}

// Hover/active nudge the fill toward mid-grey so the state change reads at any
// fill lightness: dark fills lighten, light fills darken.
const towardMid = (l: number, step: number): number =>
  clamp01(l < 0.5 ? l + step : l - step);

const seedFill = (
  l: number,
  c: number,
  h: number,
  trace?: ThemeTrace
): string =>
  formatOklch(clampThemeChroma({ mode: 'oklch', l, c, h }, FILL_GAMUT, trace));

const bestOnColorLc = (fill: string, trace?: ThemeTrace): number =>
  Math.max(
    measureApca('oklch(1 0 0)', fill, trace),
    measureApca('oklch(0 0 0)', fill, trace)
  );

// Honoring the seed's lightness can land the fill in a mid band where neither a
// black nor white label clears the ui tier. Nudge the fill toward whichever
// extreme its better on-color already prefers until a pure label passes — a
// no-op for dark or saturated seeds, active only in that band.
function legibleFillLightness(
  l: number,
  c: number,
  h: number,
  trace?: ThemeTrace
): number {
  const fill = seedFill(l, c, h, trace);
  trace?.decision('primary-legibility-candidate', {
    step: 0,
    lightness: l,
    fill,
    target: TIER_THRESHOLDS.ui,
  });
  if (bestOnColorLc(fill, trace) >= TIER_THRESHOLDS.ui) return l;
  const dir =
    measureApca('oklch(1 0 0)', fill, trace) >=
    measureApca('oklch(0 0 0)', fill, trace)
      ? -1
      : 1;
  for (let step = 1; step <= 100; step += 1) {
    const candidate = clamp01(l + dir * step * 0.01);
    const color = seedFill(candidate, c, h, trace);
    trace?.decision('primary-legibility-candidate', {
      step,
      lightness: candidate,
      fill: color,
      target: TIER_THRESHOLDS.ui,
    });
    if (bestOnColorLc(color, trace) >= TIER_THRESHOLDS.ui) {
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
  target: number,
  label: string,
  c: number,
  h: number,
  trace?: ThemeTrace
): number {
  trace?.decision('primary-state-target', {
    baseLightness: baseL,
    targetLightness: target,
    label,
    floor: TIER_THRESHOLDS.ui,
  });
  if (
    measureApca(
      label,
      seedFill(target, c, h, trace),
      trace,
      TIER_THRESHOLDS.ui
    ) >= TIER_THRESHOLDS.ui
  ) {
    return target;
  }
  const dir = target >= baseL ? 1 : -1;
  const span = Math.round(Math.abs(target - baseL) * 100);
  for (let s = span; s >= 1; s -= 1) {
    const candidate = clamp01(baseL + dir * s * 0.01);
    trace?.decision('primary-state-candidate', {
      step: s,
      lightness: candidate,
    });
    if (
      measureApca(
        label,
        seedFill(candidate, c, h, trace),
        trace,
        TIER_THRESHOLDS.ui
      ) >= TIER_THRESHOLDS.ui
    ) {
      return candidate;
    }
  }
  trace?.decision('primary-state-base-fallback', { baseLightness: baseL });
  return baseL;
}

function hoverFillTarget(baseL: number, trace?: ThemeTrace): number {
  if (baseL <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR) {
    trace?.decision('primary-hover-target', {
      branch: 'dark-endpoint',
      shade: '900',
    });
    return endpointL('900', trace);
  }
  if (baseL >= PRIMARY_LIGHT_ENDPOINT_CEIL) {
    trace?.decision('primary-hover-target', {
      branch: 'light-endpoint',
      shade: '100',
    });
    return endpointL('100', trace);
  }
  trace?.decision('primary-hover-target', {
    branch: 'toward-middle',
    step: PRIMARY_HOVER_STEP,
  });
  return towardMid(baseL, PRIMARY_HOVER_STEP);
}

function activeFillTarget(baseL: number, trace?: ThemeTrace): number {
  if (baseL <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR) {
    trace?.decision('primary-active-target', {
      branch: 'dark-endpoint',
      shade: '950',
    });
    return endpointL('950', trace);
  }
  if (baseL >= PRIMARY_LIGHT_ENDPOINT_CEIL) {
    trace?.decision('primary-active-target', {
      branch: 'light-endpoint',
      shade: '200',
    });
    return endpointL('200', trace);
  }
  trace?.decision('primary-active-target', {
    branch: baseL < 0.5 ? 'dark-fill-step' : 'light-fill-step',
    step: baseL < 0.5 ? PRIMARY_ACTIVE_DARK_FILL_STEP : PRIMARY_ACTIVE_STEP,
  });
  return clamp01(
    baseL < 0.5
      ? baseL - PRIMARY_ACTIVE_DARK_FILL_STEP
      : baseL - PRIMARY_ACTIVE_STEP
  );
}

/**
 * The 11-token primary family from one accent seed. Supporting shades (subtle,
 * borders, disabled) come from the seed ramp via {@link deriveFamily}; the solid
 * fill and its on-color follow the seed's own lightness.
 */
export function derivePrimary(
  accentHex: string,
  mode: Mode,
  trace?: ThemeTrace
): TokenMap {
  const seed = seedOklch(accentHex);
  const h = seed.h ?? 0;
  const c = seed.c ?? 0;
  const fillL = legibleFillLightness(
    primaryFillLightness(seed.l ?? 0, mode, trace),
    c,
    h,
    trace
  );
  const background = seedFill(fillL, c, h, trace);
  const label = readableOn(background, trace);
  const endpointBrand =
    c <= 0.005 && (seed.l ?? 0) <= PRIMARY_DARK_ENDPOINT_LIFT_FLOOR;
  trace?.decision('primary-endpoint-brand', {
    accent: accentHex,
    chroma: c,
    seedLightness: seed.l ?? 0,
    endpointBrand,
    fillLightness: fillL,
    label,
  });
  const hoverTrace = trace?.at(
    'primary',
    '--nx-color-primary-background-hover'
  );
  const activeTrace = trace?.at(
    'primary',
    '--nx-color-primary-background-active'
  );
  return {
    ...deriveFamily(
      'primary',
      rampFromSeed(accentHex, undefined, trace?.at('primary')),
      mode,
      trace
    ),
    ...(endpointBrand
      ? {
          '--nx-color-primary-subtle-foreground':
            mode === 'dark' ? WHITE_BASE : BLACK_BASE,
        }
      : {}),
    '--nx-color-primary-background': background,
    '--nx-color-primary-background-hover': seedFill(
      stateFillLightness(
        fillL,
        hoverFillTarget(fillL, hoverTrace),
        label,
        c,
        h,
        hoverTrace
      ),
      c,
      h,
      hoverTrace
    ),
    '--nx-color-primary-background-active': seedFill(
      stateFillLightness(
        fillL,
        activeFillTarget(fillL, activeTrace),
        label,
        c,
        h,
        activeTrace
      ),
      c,
      h,
      activeTrace
    ),
    '--nx-color-primary-foreground':
      endpointBrand && mode === 'dark' ? BLACK_BASE : label,
  };
}

export function deriveSecondary(mode: Mode, trace?: ThemeTrace): TokenMap {
  const d = mode === 'dark';
  const n = readPaletteRamp('neutral', trace);
  return {
    '--nx-color-secondary-background': referencedShade(
      n,
      d ? '900' : '100',
      '--nx-color-secondary-background',
      trace
    ),
    '--nx-color-secondary-background-hover': referencedShade(
      n,
      d ? '700' : '200',
      '--nx-color-secondary-background-hover',
      trace
    ),
    '--nx-color-secondary-background-active': referencedShade(
      n,
      d ? '600' : '300',
      '--nx-color-secondary-background-active',
      trace
    ),
    '--nx-color-secondary-foreground': referencedShade(
      n,
      d ? '100' : '900',
      '--nx-color-secondary-foreground',
      trace
    ),
    '--nx-color-secondary-disabled': referencedShade(
      n,
      d ? '950' : '50',
      '--nx-color-secondary-disabled',
      trace
    ),
    '--nx-color-secondary-subtle': referencedShade(
      n,
      d ? '800' : '100',
      '--nx-color-secondary-subtle',
      trace
    ),
    '--nx-color-secondary-subtle-foreground': referencedShade(
      n,
      d ? '200' : '600',
      '--nx-color-secondary-subtle-foreground',
      trace
    ),
    '--nx-color-secondary-subtle-hover': referencedShade(
      n,
      d ? '700' : '200',
      '--nx-color-secondary-subtle-hover',
      trace
    ),
    '--nx-color-secondary-subtle-active': referencedShade(
      n,
      d ? '600' : '300',
      '--nx-color-secondary-subtle-active',
      trace
    ),
  };
}

function gamutColor(value: string, trace?: ThemeTrace): string {
  const seed = seedOklch(value);
  const opaque = formatOklch(clampThemeChroma(seed, 'p3', trace));
  if (seed.alpha === undefined || seed.alpha === 1) return opaque;
  return opaque.replace(')', ` / ${seed.alpha})`);
}

function deriveMode(
  seeds: ThemeSeeds,
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  contrast: number,
  trace?: ThemeTrace
): TokenMap {
  const profile = contrastProfile(mode, contrast);
  trace?.decision('contrast-profile', { ...profile, contrast, surfaceTone });
  const surfaces = deriveSurfaces(
    seeds.background,
    surfaceTone,
    mode,
    profile.surfaceDelta,
    contrast,
    trace?.at('surfaces')
  );
  let foreground = seeds.foreground;
  if (surfaceTone !== 'neutral') {
    const ink = seedOklch(foreground);
    const tone = SURFACE_TONE[surfaceTone];
    const cap = mode === 'dark' ? tone.lightC : tone.darkC;
    foreground = formatOklch({ ...ink, c: Math.min(ink.c, cap) });
    trace?.at('text').decision('text-chroma-cap', {
      input: seeds.foreground,
      output: foreground,
      cap,
      originalChroma: ink.c,
    });
  }
  const text = deriveText(foreground, surfaces, mode, trace?.at('text'));
  trace
    ?.at('text')
    .assignments(
      text,
      mode === 'light' ? 'fixed-white-text-reference' : 'surface-text-reference'
    );
  const primary = derivePrimary(
    seeds.accent,
    mode,
    trace?.at('primary', '--nx-color-primary-background')
  );
  trace?.at('primary').assignments(primary, 'brand-solid-and-supporting-ramp');
  const secondary = deriveSecondary(mode, trace?.at('secondary'));
  trace?.at('secondary').assignments(secondary, 'authored-neutral-mapping');
  const status = deriveStatus(mode, surfaces, trace?.at('status'));
  const chart = deriveChart(mode, trace?.at('chart'));
  trace?.at('chart').assignments(chart, 'authored-chart-reference');
  const alpha = deriveAlpha(surfaceTone, mode, profile);
  trace?.at('alpha').assignments(alpha, 'tone-and-contrast-opacity');
  const focus = deriveFocus(mode, surfaces, primary, trace?.at('focus'));
  trace?.at('focus').assignments(focus, 'focus-search');
  const candidates = {
    ...text,
    ...primary,
    ...secondary,
    ...status,
    ...chart,
    ...alpha,
    ...focus,
  };
  const map = { ...surfaces };
  for (const [name, value] of Object.entries(candidates))
    map[name] = gamutColor(value, trace?.at('gamut', name));
  const popover = surfaces['--nx-color-popover'];
  if (!popover) throw new Error('deriveMode: missing popover surface');
  map['--nx-color-popover-alpha'] = popover.replace(
    ')',
    ` / ${formatAlpha(0.94 + (0.06 * contrast) / 100)})`
  );
  trace?.at('alpha', '--nx-color-popover-alpha').record({
    kind: 'assignment',
    value: map['--nx-color-popover-alpha'],
    source: 'contrast-popover-opacity',
  });
  const result = constrainColors(map, mode, contrast, trace?.at('constraints'));
  trace?.at('output').assignments(result, 'final-theme');
  return result;
}

/**
 * Expand derivation seeds into light + dark `--nx-color-*` maps. Both modes are
 * always derived; the consumer's `appearance` choice selects one at runtime.
 * Only tokens the engine computes are emitted (surfaces, text, borders, primary,
 * secondary, status, chart, alpha/translucent, focus).
 */
export function deriveTheme(input: ThemeDerivationInput): DerivedTheme {
  return deriveThemeWithTrace(input);
}

function deriveThemeWithTrace(
  input: ThemeDerivationInput,
  events?: ThemeTraceEvent[]
): DerivedTheme {
  const surfaceTone = input.surfaceTone ?? 'neutral';
  return {
    light: deriveInputMode(input, surfaceTone, 'light', events),
    dark: deriveInputMode(input, surfaceTone, 'dark', events),
  };
}

function deriveInputMode(
  input: ThemeDerivationInput,
  surfaceTone: NexusSurfaceTone,
  mode: Mode,
  events?: ThemeTraceEvent[]
): TokenMap {
  const seeds = input[mode];
  const rawContrast = input.contrast[mode];
  const contrast = normalizeContrast(rawContrast);
  const trace = events ? new ThemeTrace(events, mode, 'input') : undefined;
  trace?.decision('normalize-input', {
    surfaceTone,
    defaultedTone: input.surfaceTone == null,
    contrast,
    inputContrast:
      typeof rawContrast === 'number' ? String(rawContrast) : 'non-number',
  });
  return deriveMode(seeds, surfaceTone, mode, contrast, trace);
}

/** Run the production derivation once, recording its visited decisions. */
export function inspectTheme(input: ThemeDerivationInput): ThemeInspection {
  const trace: ThemeTraceEvent[] = [];
  const theme = deriveThemeWithTrace(input, trace);
  const snapshot: ThemeDerivationInput = {
    ...(input.surfaceTone === undefined
      ? {}
      : { surfaceTone: input.surfaceTone }),
    light: { ...input.light },
    dark: { ...input.dark },
    contrast: { ...input.contrast },
  };
  const normalizedInput = {
    ...snapshot,
    surfaceTone: input.surfaceTone ?? 'neutral',
    contrast: {
      light: normalizeContrast(input.contrast.light),
      dark: normalizeContrast(input.contrast.dark),
    },
  };
  const diagnostics = (['light', 'dark'] as const).flatMap((mode) =>
    APCA_PAIRS.map((pair) => {
      const evidence: ThemeTraceEvent[] = [];
      const lc = contrastForPair(
        theme[mode],
        pair,
        new ThemeTrace(evidence, mode, 'output', `--nx-color-${pair.fg}`)
      );
      const floor = TIER_THRESHOLDS[pair.tier];
      const requestedTarget = pairTarget(pair, normalizedInput.contrast[mode]);
      return {
        mode,
        pair: { ...pair },
        floor,
        requestedTarget,
        lc,
        meetsFloor: lc >= floor,
        meetsRequestedTarget: lc >= requestedTarget,
        evidence,
      };
    })
  );
  return {
    schemaVersion: 1,
    input: snapshot,
    normalizedInput,
    theme,
    trace,
    diagnostics,
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
