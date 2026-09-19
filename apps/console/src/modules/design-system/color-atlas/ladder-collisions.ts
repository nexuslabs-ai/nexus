import {
  DARK_SURFACE_LADDER,
  LIGHT_SURFACE_LADDER,
  type NexusSurfaceTone,
  type ShadeAnchor,
  SURFACE_TOKENS,
  type SurfaceToken,
} from '@nexus_ds/core';

export const COLOR_ATLAS_SURFACE_TOKENS = [
  'background',
  'background-hover',
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
] as const satisfies readonly SurfaceToken[];

export function formatAnchorLabel(
  anchor: ShadeAnchor,
  surfaceTone: NexusSurfaceTone = 'stone'
): string {
  if (anchor === 'base') return 'base';
  if (typeof anchor === 'number') return `${surfaceTone}.${anchor}`;
  return `step ${anchor.step}`;
}

function anchorKey(anchor: ShadeAnchor): string {
  return JSON.stringify(anchor);
}

export function collisionGroupFor(
  token: SurfaceToken,
  ladder: Record<SurfaceToken, ShadeAnchor>
): SurfaceToken[] {
  const tokenKey = anchorKey(ladder[token]);

  return SURFACE_TOKENS.filter(
    (candidate) =>
      candidate !== token && anchorKey(ladder[candidate]) === tokenKey
  );
}

export function surfaceTokenCollisionCount(token: SurfaceToken): number {
  return collisionGroupFor(token, LIGHT_SURFACE_LADDER).length;
}

export { DARK_SURFACE_LADDER, LIGHT_SURFACE_LADDER };
