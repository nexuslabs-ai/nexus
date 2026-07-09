import type { Mode, NexusSurfaceTone } from './derive-theme';
import { PERCEPTUAL_L_GRID, type Shade } from './palette';
import { seedOklch } from './perceptual-ramp';

export const SURFACE_TONE: Record<
  NexusSurfaceTone,
  { h: number; lightC: number; darkC: number }
> = {
  slate: { h: 264.7, lightC: 0.011, darkC: 0.04 },
  gray: { h: 261.7, lightC: 0.008, darkC: 0.027 },
  zinc: { h: 262.8, lightC: 0.005, darkC: 0.005 },
  neutral: { h: 0, lightC: 0, darkC: 0 },
  stone: { h: 70, lightC: 0.008, darkC: 0.006 },
};

export const PAGE_L_LIGHT = 1;
export const LIGHT_CHROMA_DEPTH_MULTIPLIER = 1.4;

/**
 * Canonical opaque-surface token set. Both regime ladders are typed against
 * these keys, so a surface added here must be given a light and dark anchor.
 */
export const SURFACE_TOKENS = [
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

export type SurfaceToken = (typeof SURFACE_TOKENS)[number];
export type SurfaceSteps = Record<SurfaceToken, number>;

export type ShadeAnchor =
  | number
  | 'base'
  | {
      step: number;
    };

const DELTA_MIN = 0.02;
const DELTA_MAX = 0.08;
const CONTRAST_ANCHOR = 60;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clampContrast = (contrast: number) =>
  Math.max(0, Math.min(100, contrast));

function surfaceDeltaAt(contrast: number): number {
  return lerp(DELTA_MIN, DELTA_MAX, clampContrast(contrast) / 100);
}

const SURFACE_DELTA_AT_ANCHOR = surfaceDeltaAt(CONTRAST_ANCHOR);

const LIGHT_VIRTUAL_ANCHOR_STEPS = {
  50: -0.27,
  75: -0.54,
  100: -0.98,
  150: -1.38,
  200: -2.32,
  400: -6.07,
} as const;

const SURFACE_ANCHOR_L_AT_60: Record<number, number> = {
  ...Object.fromEntries(
    Object.entries(PERCEPTUAL_L_GRID).map(([shade, l]) => [Number(shade), l])
  ),
  ...Object.fromEntries(
    Object.entries(LIGHT_VIRTUAL_ANCHOR_STEPS).map(([shade, step]) => [
      Number(shade),
      PAGE_L_LIGHT + step * SURFACE_DELTA_AT_ANCHOR,
    ])
  ),
};

const DARK_SURFACE_ANCHOR_HEX: Record<NexusSurfaceTone, string> = {
  stone: '#1c1917',
  neutral: '#171717',
  zinc: '#18181b',
  slate: '#0f172a',
  gray: '#111827',
};

function darkAnchorL(surfaceTone: NexusSurfaceTone): number {
  return seedOklch(DARK_SURFACE_ANCHOR_HEX[surfaceTone]).l ?? 0;
}

export function anchorToStep(
  anchor: ShadeAnchor,
  mode: Mode,
  surfaceTone: NexusSurfaceTone,
  contrast = CONTRAST_ANCHOR
): number {
  if (typeof anchor === 'object') return anchor.step;
  if (anchor === 'base') return 0;

  const shadeL = SURFACE_ANCHOR_L_AT_60[anchor];
  if (shadeL === undefined) {
    throw new Error(`surface-ladder: unknown shade anchor '${anchor}'`);
  }

  const anchorL = mode === 'dark' ? darkAnchorL(surfaceTone) : PAGE_L_LIGHT;
  return Number(((shadeL - anchorL) / surfaceDeltaAt(contrast)).toFixed(4));
}

export const LIGHT_SURFACE_LADDER = {
  background: 'base',
  'background-hover': 50,
  'background-active': 150,
  muted: 75,
  container: 'base',
  'container-hover': 75,
  'container-active': 100,
  popover: 'base',
  'popover-hover': 100,
  'popover-active': 100,
  'control-background': 150,
  'control-background-hover': 200,
  'nav-background': 75,
  'nav-item-hover': 150,
  'nav-item-active': 150,
  'nav-border': 150,
  disabled: 100,
  'border-active': 400,
} as const satisfies Record<SurfaceToken, ShadeAnchor>;

// Current dark surfaces are bg-seed-relative and do not sit on shared shade
// gridlines across tones, so Phase 1 preserves them as raw steps.
export const DARK_SURFACE_LADDER = {
  background: 'base',
  'background-hover': { step: 1.6 },
  'background-active': { step: 1.6 },
  muted: { step: 1.6 },
  container: { step: 1.6 },
  'container-hover': { step: 3.2 },
  'container-active': { step: 1.6 },
  popover: { step: 3.2 },
  'popover-hover': { step: 4.8 },
  'popover-active': { step: 3.2 },
  'control-background': { step: 3.2 },
  'control-background-hover': { step: 4.8 },
  'nav-background': { step: 1.6 },
  'nav-item-hover': { step: 3.2 },
  'nav-item-active': { step: 3.2 },
  'nav-border': { step: 3.2 },
  disabled: { step: 1.6 },
  'border-active': { step: 9.68 },
} as const satisfies Record<SurfaceToken, ShadeAnchor>;

function stepsFromLadder(
  ladder: Record<SurfaceToken, ShadeAnchor>,
  mode: Mode
): SurfaceSteps {
  return Object.fromEntries(
    SURFACE_TOKENS.map((token) => [
      token,
      anchorToStep(ladder[token], mode, 'stone'),
    ])
  ) as SurfaceSteps;
}

export const LIGHT_SURFACE_STEPS = stepsFromLadder(
  LIGHT_SURFACE_LADDER,
  'light'
);
export const DARK_SURFACE_STEPS = stepsFromLadder(DARK_SURFACE_LADDER, 'dark');

/*
Reserved future exception shape, applied only at the single step-read site if
a per-tone adjudication needs it:

const SURFACE_STEP_OVERRIDES: Partial<
  Record<
    NexusSurfaceTone,
    Partial<Record<Mode, Partial<Record<SurfaceToken, ShadeAnchor>>>>
  >
>;
*/

type StatusFamily = 'success' | 'warning' | 'error' | 'information';

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
