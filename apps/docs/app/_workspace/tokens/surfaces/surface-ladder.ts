import type { SurfaceToken } from '@nexus_ds/core';
import { type ShadeAnchor, SURFACE_TOKENS } from '@nexus_ds/core/catalogue';

type SurfaceLadder = Record<SurfaceToken, ShadeAnchor>;

/** `base` is the page seed, a number is a virtual light shade that is the same for every surface tone, and `step` is a raw ladder step. */
export function formatAnchorLabel(anchor: ShadeAnchor): string {
  if (anchor === 'base') return 'base';
  if (typeof anchor === 'number') return `shade ${anchor}`;
  return `step ${anchor.step}`;
}

function isSameAnchor(a: ShadeAnchor, b: ShadeAnchor): boolean {
  if (typeof a === 'object' && typeof b === 'object') return a.step === b.step;
  return a === b;
}

/** The other surface tokens on the same rung, which therefore resolve to the same color. */
export function rungSiblings(
  token: SurfaceToken,
  ladder: SurfaceLadder
): SurfaceToken[] {
  return SURFACE_TOKENS.filter(
    (candidate) =>
      candidate !== token && isSameAnchor(ladder[candidate], ladder[token])
  );
}
