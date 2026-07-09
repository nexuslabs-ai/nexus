import { clampChroma, converter, oklch, parse } from 'culori';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// emit ships P3 chroma; audit scores in sRGB (legacy-display equivalent)
const EMIT_GAMUT = 'p3';
const AUDIT_GAMUT = 'rgb';

const toRgb = converter('rgb');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Grid is runtime-owned (src/lib/) and imported by adjust-contrast; scripts
// read from there so the dependency direction stays one-way (scripts → src).
const GRID_FILE = path.join(__dirname, '../../src/lib/perceptual-grid.json');

export const PERCEPTUAL_L_GRID = Object.freeze(
  JSON.parse(fs.readFileSync(GRID_FILE, 'utf8'))
);

// Per-hue lightness curves. A re-pitched chromatic hue centres its ramp on the
// hue's natural chroma peak (yellow light, red dark) instead of the one flat
// ladder, and takes chroma at the P3 cusp. Hues absent here — the 5 neutrals
// and the decorative chromatics — keep the flat grid + their source chroma,
// byte-for-byte unchanged.
const HUE_GRID_FILE = path.join(
  __dirname,
  '../../src/lib/perceptual-grid-hue.json'
);
export const PERCEPTUAL_L_GRID_HUE = Object.freeze(
  JSON.parse(fs.readFileSync(HUE_GRID_FILE, 'utf8'))
);
const CUSP_FRACTION = 0.95; // sit just inside the P3 cusp for render safety

const SHADE_KEY_RE = /^(50|100|200|300|400|500|600|700|800|900|950)$/;

export function isPaletteShadeKey(key) {
  return typeof key === 'string' && SHADE_KEY_RE.test(key);
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatOklch({ l, c, h, alpha }) {
  const finite = (v) => (Number.isFinite(v) ? v : 0);
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

function parseToOklch(hex) {
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`perceptual-grid: cannot parse color "${hex}"`);
  }
  return oklch(parsed);
}

function computePinnedOklch(hex, shade, palette) {
  const hueCurve = palette ? PERCEPTUAL_L_GRID_HUE[palette] : undefined;
  const pinnedL = (hueCurve ?? PERCEPTUAL_L_GRID)[shade];
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
      console.warn(
        `perceptual-grid: P3 gamut clip on ${hex} at shade ${shade} — C ${originalC.toFixed(4)} → ${clampedC.toFixed(4)}`
      );
    }
  }

  return clamped;
}

export function hexToOklchPinned(hex, shade, palette) {
  return formatOklch(computePinnedOklch(hex, shade, palette));
}

export function hexToOklchMechanical(hex) {
  return formatOklch(parseToOklch(hex));
}

function oklchToSrgbInts(oklchColor) {
  const rgb = toRgb(clampChroma(oklchColor, 'oklch', AUDIT_GAMUT));
  if ((rgb.alpha ?? 1) < 1) {
    // apca-w3 `sRGBtoY` reads only [r,g,b]; an alpha-bearing color must be
    // pre-blended against its actual background before contrast computation.
    throw new Error(
      'perceptual-grid: oklchToSrgbInts received alpha-bearing color; pre-blend before contrast computation'
    );
  }
  const channel = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

// Routes through the same converters the build uses so APCA scores match
// what the user actually ships in CSS, not the source hex.
export function hexToSrgbInts(hex, shade, palette) {
  if (shade !== undefined) {
    return oklchToSrgbInts(computePinnedOklch(hex, shade, palette));
  }
  return oklchToSrgbInts(parseToOklch(hex));
}
