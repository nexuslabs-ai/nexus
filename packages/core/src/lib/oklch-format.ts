import type { Oklch } from 'culori';

/** Round to `decimals` places. */
export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Format an OKLCH color to the project's spot-check string form
 * (`oklch(L C H)`, or `oklch(L C H / A)` when translucent), emitting `0` for
 * hue when chroma is 0.
 */
export function formatOklch(color: Oklch): string {
  const finite = (v: number | undefined) =>
    typeof v === 'number' && Number.isFinite(v) ? v : 0;
  const l = round(finite(color.l), 4);
  const c = round(finite(color.c), 4);
  const h = c && color.h !== undefined ? round(finite(color.h), 3) : 0;
  const alpha = color.alpha === undefined ? 1 : round(color.alpha, 4);
  return alpha < 1
    ? `oklch(${l} ${c} ${h} / ${alpha})`
    : `oklch(${l} ${c} ${h})`;
}
