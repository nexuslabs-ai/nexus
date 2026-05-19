import { clampChroma, converter, oklch, parse } from 'culori';

const toRgb = converter('rgb');

export const PERCEPTUAL_L_GRID = Object.freeze({
  50: 0.985,
  100: 0.945,
  200: 0.87,
  300: 0.765,
  400: 0.66,
  500: 0.553,
  600: 0.46,
  700: 0.385,
  800: 0.297,
  900: 0.207,
  950: 0.118,
});

const SHADE_KEY_RE = /^(50|100|200|300|400|500|600|700|800|900|950)$/;

export function isPaletteShadeKey(key) {
  return typeof key === 'string' && SHADE_KEY_RE.test(key);
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatOklch({ l, c, h, alpha }) {
  const lRounded = round(l ?? 0, 4);
  const cRounded = round(c ?? 0, 4);
  // Hue is undefined when chroma is 0 (achromatic). Emit 0 rather than `none`
  // so consuming CSS stays compatible with the project's spot-check format.
  const hRounded = c && h !== undefined ? round(h, 3) : 0;
  const base = `oklch(${lRounded} ${cRounded} ${hRounded}`;
  if (alpha !== undefined && alpha < 1) {
    return `${base} / ${round(alpha, 4)})`;
  }
  return `${base})`;
}

function parseToOklch(hex) {
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`perceptual-grid: cannot parse color "${hex}"`);
  }
  return oklch(parsed);
}

function computePinnedOklch(hex, shade) {
  const pinnedL = PERCEPTUAL_L_GRID[shade];
  if (pinnedL === undefined) {
    throw new Error(`perceptual-grid: unknown shade "${shade}" for ${hex}`);
  }

  const source = parseToOklch(hex);
  const target = {
    mode: 'oklch',
    l: pinnedL,
    c: source.c ?? 0,
    h: source.h,
    ...(source.alpha !== undefined ? { alpha: source.alpha } : {}),
  };

  const clamped = clampChroma(target, 'oklch', 'rgb');
  const originalC = target.c;
  const clampedC = clamped.c ?? 0;

  if (originalC > 0 && (originalC - clampedC) / originalC > 0.2) {
    console.warn(
      `perceptual-grid: gamut clip on ${hex} at shade ${shade} — C ${originalC.toFixed(4)} → ${clampedC.toFixed(4)}`
    );
  }

  return clamped;
}

export function hexToOklchPinned(hex, shade) {
  return formatOklch(computePinnedOklch(hex, shade));
}

export function hexToOklchMechanical(hex) {
  return formatOklch(parseToOklch(hex));
}

function oklchToSrgbInts(oklchColor) {
  const rgb = toRgb(oklchColor);
  const channel = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b), rgb.alpha ?? 1];
}

// Routes through the same converters the build uses so APCA scores match
// what the user actually ships in CSS, not the source hex.
export function hexToSrgbInts(hex, shade) {
  if (shade !== undefined) {
    return oklchToSrgbInts(computePinnedOklch(hex, shade));
  }
  return oklchToSrgbInts(parseToOklch(hex));
}
