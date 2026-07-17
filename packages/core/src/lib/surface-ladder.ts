import type { Mode, NexusSurfaceTone } from './palette';
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
  'muted-extralight',
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

const SURFACE_ANCHOR_L_AT_60: Record<number, number> = Object.fromEntries(
  Object.entries(LIGHT_VIRTUAL_ANCHOR_STEPS).map(([shade, step]) => [
    Number(shade),
    PAGE_L_LIGHT + step * SURFACE_DELTA_AT_ANCHOR,
  ])
);

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
  surfaceTone: NexusSurfaceTone
): number {
  if (typeof anchor === 'object') return anchor.step;
  if (anchor === 'base') return 0;

  const shadeL = SURFACE_ANCHOR_L_AT_60[anchor];
  if (shadeL === undefined) {
    throw new Error(`surface-ladder: unknown shade anchor '${anchor}'`);
  }

  const anchorL = mode === 'dark' ? darkAnchorL(surfaceTone) : PAGE_L_LIGHT;
  return Number(((shadeL - anchorL) / SURFACE_DELTA_AT_ANCHOR).toFixed(4));
}

export const LIGHT_SURFACE_LADDER = {
  background: 'base',
  'background-hover': 50,
  'background-active': 150,
  muted: 75,
  'muted-extralight': { step: -0.216 },
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
// gridlines across tones, so the dark ladder keeps them as raw steps.
export const DARK_SURFACE_LADDER = {
  background: 'base',
  'background-hover': { step: 1.6 },
  'background-active': { step: 1.6 },
  muted: { step: 1.6 },
  'muted-extralight': { step: 0.64 },
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
