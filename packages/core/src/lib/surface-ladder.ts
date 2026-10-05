import type { Mode, NexusSurfaceTone } from './palette';
import { seedOklch } from './perceptual-ramp';

export const SURFACE_TONE: Record<
  NexusSurfaceTone,
  { h: number; lightC: number; darkC: number }
> = {
  slate: { h: 264.7, lightC: 0.003, darkC: 0.006 },
  gray: { h: 261.7, lightC: 0.002, darkC: 0.004 },
  zinc: { h: 262.8, lightC: 0.001, darkC: 0.002 },
  neutral: { h: 0, lightC: 0, darkC: 0 },
  stone: { h: 70, lightC: 0.002, darkC: 0.003 },
};

export const PAGE_L_LIGHT = 1;

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
  'border-focus',
] as const;

export type SurfaceToken = (typeof SURFACE_TOKENS)[number];
export type SurfaceSteps = Record<SurfaceToken, number>;

export type ShadeAnchor =
  | number
  | 'base'
  | {
      step: number;
    };

// OKLCH lightness per ladder step: the unit that converts a shade anchor into a
// step count. deriveSurfaces scales the steps by its own contrast spacing.
const STEP_L = 0.056;

const LIGHT_VIRTUAL_ANCHOR_STEPS = {
  50: -0.27,
  75: -0.54,
  100: -0.98,
  150: -1.38,
  200: -2.32,
  400: -6.07,
} as const;

const SURFACE_ANCHOR_L: Record<number, number> = Object.fromEntries(
  Object.entries(LIGHT_VIRTUAL_ANCHOR_STEPS).map(([shade, step]) => [
    Number(shade),
    PAGE_L_LIGHT + step * STEP_L,
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

  const shadeL = SURFACE_ANCHOR_L[anchor];
  if (shadeL === undefined) {
    throw new Error(`surface-ladder: unknown shade anchor '${anchor}'`);
  }

  const anchorL = mode === 'dark' ? darkAnchorL(surfaceTone) : PAGE_L_LIGHT;
  return Number(((shadeL - anchorL) / STEP_L).toFixed(4));
}

export const LIGHT_SURFACE_LADDER = {
  background: 'base',
  'background-hover': 50,
  'background-active': 150,
  muted: 75,
  // The only light rung off the shade grid: a 40% background→muted blend lands
  // between gridlines, so it is expressed as a raw fractional step (mirrors the
  // dark ladder's raw-step rationale below).
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
  'border-focus': 400,
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
  'border-focus': { step: 9.68 },
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
