import { clampChroma, converter, type Oklch, oklch, parse } from 'culori';

import { PERCEPTUAL_L_GRID, type Shade } from './palette';
import hueGrid from './perceptual-grid-hue.json';

export { PERCEPTUAL_L_GRID } from './palette';

// emit ships P3 chroma; audit scores in sRGB (legacy-display equivalent)
const EMIT_GAMUT = 'p3';
const AUDIT_GAMUT = 'rgb';

const toRgb = converter('rgb');

export const PERCEPTUAL_L_GRID_HUE: Readonly<
  Record<string, Readonly<Record<Shade, number>>>
> = Object.freeze(
  Object.fromEntries(
    Object.entries(hueGrid).map(([name, curve]) => [name, Object.freeze(curve)])
  )
);

const CUSP_FRACTION = 0.95; // sit just inside the P3 cusp for render safety

const SHADE_KEY_RE = /^(50|100|200|300|400|500|600|700|800|900|950)$/;

export function isPaletteShadeKey(key: unknown): key is Shade {
  return typeof key === 'string' && SHADE_KEY_RE.test(key);
}

function round(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatPaletteOklch({ l, c, h, alpha }: Oklch) {
  const finite = (v: number | undefined) =>
    v !== undefined && Number.isFinite(v) ? v : 0;
  const lRounded = round(finite(l), 4);
  const cRounded = round(finite(c), 4);
  // Hue is undefined when chroma is 0 (achromatic). Emit 0 rather than `none`
  // so consuming CSS stays compatible with the project's spot-check format.
  const hRounded = c && h !== undefined ? round(finite(h), 3) : 0;
  const base = `oklch(${lRounded} ${cRounded} ${hRounded}`;
  if (alpha !== undefined && alpha < 1) {
    return `${base} / ${round(alpha, 4)})`;
  }
  return `${base})`;
}

function parseToOklch(hex: string): Oklch {
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`perceptual-grid: cannot parse color "${hex}"`);
  }
  return oklch(parsed);
}

function computePinnedOklch(
  hex: string,
  shade: string,
  palette?: string,
  reportGamutClip?: (message: string) => void
): Oklch {
  const hueCurve = palette ? PERCEPTUAL_L_GRID_HUE[palette] : undefined;
  const pinnedL = isPaletteShadeKey(shade)
    ? (hueCurve ?? PERCEPTUAL_L_GRID)[shade]
    : undefined;
  if (pinnedL === undefined) {
    throw new Error(`perceptual-grid: unknown shade "${shade}" for ${hex}`);
  }

  const source = parseToOklch(hex);

  // Re-pitched hues take chroma at the P3 cusp for the (hue, pinned-L) pair —
  // pale near white, vivid at the peak — driven by the gamut, not the source
  // hex. Every other palette keeps its source chroma (flat-grid behaviour).
  let chroma = source.c ?? 0;
  if (hueCurve) {
    const cuspC =
      clampChroma(
        { mode: 'oklch', l: pinnedL, c: 0.5, h: source.h },
        'oklch',
        EMIT_GAMUT
      ).c ?? 0;
    chroma = cuspC * CUSP_FRACTION;
  }

  const target: Oklch = {
    mode: 'oklch',
    l: pinnedL,
    c: chroma,
    h: source.h,
    ...(source.alpha !== undefined ? { alpha: source.alpha } : {}),
  };

  const clamped = clampChroma(target, 'oklch', EMIT_GAMUT);

  if (!hueCurve) {
    const originalC = target.c;
    const clampedC = clamped.c ?? 0;
    if (originalC > 0 && (originalC - clampedC) / originalC > 0.2) {
      reportGamutClip?.(
        `perceptual-grid: P3 gamut clip on ${hex} at shade ${shade} — C ${originalC.toFixed(4)} → ${clampedC.toFixed(4)}`
      );
    }
  }

  return clamped;
}

export function hexToOklchPinned(
  hex: string,
  shade: string,
  palette?: string,
  reportGamutClip?: (message: string) => void
): string {
  return formatPaletteOklch(
    computePinnedOklch(hex, shade, palette, reportGamutClip)
  );
}

export function hexToOklchMechanical(hex: string): string {
  return formatPaletteOklch(parseToOklch(hex));
}

function oklchToSrgbInts(oklchColor: Oklch): [number, number, number] {
  const rgb = toRgb(clampChroma(oklchColor, 'oklch', AUDIT_GAMUT));
  if ((rgb.alpha ?? 1) < 1) {
    // apca-w3 `sRGBtoY` reads only [r,g,b]; an alpha-bearing color must be
    // pre-blended against its actual background before contrast computation.
    throw new Error(
      'perceptual-grid: oklchToSrgbInts received alpha-bearing color; pre-blend before contrast computation'
    );
  }
  const channel = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

// Audit conversion retains the unrounded coordinates; parsing emitted CSS
// first would change some sRGB integer channels at rounding boundaries.
export function hexToSrgbInts(
  hex: string,
  shade?: string,
  palette?: string
): [number, number, number] {
  if (shade !== undefined) {
    return oklchToSrgbInts(computePinnedOklch(hex, shade, palette));
  }
  return oklchToSrgbInts(parseToOklch(hex));
}
