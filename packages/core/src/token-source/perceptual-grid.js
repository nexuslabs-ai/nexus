// @ts-check
import { clampChroma, converter, oklch, parse } from 'culori';

import flatGrid from './perceptual-grid.json' with { type: 'json' };
import hueGrid from './perceptual-grid-hue.json' with { type: 'json' };

/** @typedef {import('culori').Oklch} Oklch */
/** @typedef {import('../lib/palette').Shade} Shade */

// emit ships P3 chroma; audit scores in sRGB (legacy-display equivalent)
const EMIT_GAMUT = 'p3';
const AUDIT_GAMUT = 'rgb';

const toRgb = converter('rgb');

/** @type {Readonly<Record<Shade, number>>} */
export const PERCEPTUAL_L_GRID = Object.freeze(flatGrid);

/** @type {Readonly<Record<string, Readonly<Record<Shade, number>>>>} */
const PERCEPTUAL_L_GRID_HUE = Object.freeze(
  Object.fromEntries(
    Object.entries(hueGrid).map(([name, curve]) => [name, Object.freeze(curve)])
  )
);

const CUSP_FRACTION = 0.95; // sit just inside the P3 cusp for render safety

const SHADE_KEY_RE = /^(50|100|200|300|400|500|600|700|800|900|950)$/;

/**
 * @param {unknown} key
 * @returns {key is Shade}
 */
export function isPaletteShadeKey(key) {
  return typeof key === 'string' && SHADE_KEY_RE.test(key);
}

/**
 * @param {number} value
 * @param {number} decimals
 */
function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** @param {Oklch} color */
function formatPaletteOklch({ l, c, h, alpha }) {
  /** @param {number | undefined} v */
  const finite = (v) => (v !== undefined && Number.isFinite(v) ? v : 0);
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

/**
 * @param {string} hex
 * @returns {Oklch}
 */
function parseToOklch(hex) {
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`palette: cannot parse color "${hex}"`);
  }
  return oklch(parsed);
}

/**
 * @param {string} hex
 * @param {string} shade
 * @param {string} [palette]
 * @param {(message: string) => void} [reportGamutClip]
 * @returns {Oklch}
 */
function computePinnedOklch(hex, shade, palette, reportGamutClip) {
  const hueCurve = palette ? PERCEPTUAL_L_GRID_HUE[palette] : undefined;
  const pinnedL = isPaletteShadeKey(shade)
    ? (hueCurve ?? PERCEPTUAL_L_GRID)[shade]
    : undefined;
  if (pinnedL === undefined) {
    throw new Error(`palette: unknown shade "${shade}" for ${hex}`);
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

  /** @type {Oklch} */
  const target = {
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
        `palette: P3 gamut clip on ${hex} at shade ${shade} — C ${originalC.toFixed(4)} → ${clampedC.toFixed(4)}`
      );
    }
  }

  return clamped;
}

/**
 * @param {string} hex
 * @param {string} shade
 * @param {string} [palette]
 * @param {(message: string) => void} [reportGamutClip]
 * @returns {string}
 */
export function hexToOklchPinned(hex, shade, palette, reportGamutClip) {
  return formatPaletteOklch(
    computePinnedOklch(hex, shade, palette, reportGamutClip)
  );
}

/**
 * @param {string} hex
 * @returns {string}
 */
export function hexToOklchMechanical(hex) {
  return formatPaletteOklch(parseToOklch(hex));
}

/**
 * @param {Oklch} oklchColor
 * @returns {[number, number, number]}
 */
function oklchToSrgbInts(oklchColor) {
  const rgb = toRgb(clampChroma(oklchColor, 'oklch', AUDIT_GAMUT));
  if ((rgb.alpha ?? 1) < 1) {
    // apca-w3 `sRGBtoY` reads only [r,g,b]; an alpha-bearing color must be
    // pre-blended against its actual background before contrast computation.
    throw new Error(
      'palette: oklchToSrgbInts received alpha-bearing color; pre-blend before contrast computation'
    );
  }
  /** @param {number} v */
  const channel = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

// Audit conversion retains the unrounded coordinates; parsing emitted CSS
// first would change some sRGB integer channels at rounding boundaries.
/**
 * @param {string} hex
 * @param {string} [shade]
 * @param {string} [palette]
 * @returns {[number, number, number]}
 */
export function hexToSrgbInts(hex, shade, palette) {
  if (shade !== undefined) {
    return oklchToSrgbInts(computePinnedOklch(hex, shade, palette));
  }
  return oklchToSrgbInts(parseToOklch(hex));
}
