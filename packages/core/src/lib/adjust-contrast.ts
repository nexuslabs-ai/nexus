import { APCAcontrast, sRGBtoY } from 'apca-w3';
import {
  clampChroma,
  converter,
  type Oklch,
  oklch,
  parse,
  type Rgb,
} from 'culori';

import {
  getPaletteReference,
  type PaletteKey,
  PERCEPTUAL_L_GRID,
  type Shade,
  SHADES,
  type Tier,
  TIER_THRESHOLDS,
} from './palette';

const ACHROMATIC_THRESHOLD = 0.01;
const toRgb = converter('rgb');

export type AdjustContrastTier = Tier;
export type AdjustContrastPalette = PaletteKey;

export interface AdjustContrastOptions {
  /**
   * Surface the returned color sits on. Accepts any CSS color string
   * parseable by culori (hex, rgb, oklch, hsl). Alpha is stripped.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * APCA contrast tier the returned color must clear.
   * - `body` (Lc ≥ 75) — fluent reading
   * - `ui` (Lc ≥ 60) — labels, buttons, badges
   * - `incidental` (Lc ≥ 45) — muted, disabled, focus rings
   * @default 'ui'
   */
  tier?: AdjustContrastTier;
  /**
   * Base palette family. Only consulted when `input` is achromatic
   * (chroma < 0.01) — borrows the palette's hue and chroma from its
   * shade 500. For chromatic inputs, this option is a no-op.
   * @default 'slate'
   */
  palette?: AdjustContrastPalette;
}

// TODO(#84): parseToOklch / oklchToSrgbInts / formatOklch / clampForEmit
// duplicate scripts/lib/perceptual-grid.js (~20 lines). Extract to a shared
// browser-safe module once @nexus/colors lands.
function stripAlpha(color: Oklch): Oklch {
  if (color.alpha === undefined || color.alpha === 1) return color;
  return { mode: 'oklch', l: color.l, c: color.c, h: color.h };
}

function parseToOklch(input: string, label: string): Oklch {
  const parsed = parse(input);
  if (!parsed) {
    throw new Error(
      `adjustContrast: cannot parse ${label} '${input}' — expected a CSS color string (hex, rgb, oklch, hsl)`
    );
  }
  const converted = oklch(parsed);
  if (!converted) {
    throw new Error(
      `adjustContrast: cannot convert ${label} '${input}' to OKLCH`
    );
  }
  return stripAlpha(converted);
}

function oklchToSrgbInts(color: Oklch): [number, number, number] {
  const clamped = clampChroma(color, 'oklch', 'rgb');
  const rgb = toRgb(clamped) as Rgb;
  const channel = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * 255)));
  return [channel(rgb.r), channel(rgb.g), channel(rgb.b)];
}

function clampForEmit(color: Oklch): Oklch {
  return clampChroma(color, 'oklch', 'p3');
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatOklch(color: Oklch): string {
  const finite = (v: number | undefined) =>
    typeof v === 'number' && Number.isFinite(v) ? v : 0;
  const l = round(finite(color.l), 4);
  const c = round(finite(color.c), 4);
  const h = c && color.h !== undefined ? round(finite(color.h), 3) : 0;
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Snap a custom color to the nearest Nexus palette shade that passes the
 * requested APCA tier on the target background. Lightness comes from the
 * perceptual grid; hue and chroma come from the input (or, for achromatic
 * inputs, from the chosen palette's shade 500).
 *
 * Walks shades `50 → 950` and returns the **first** that meets the tier.
 * Throws if no shade passes — the diagnostic lists every shade's Lc score.
 *
 * @example
 * // Custom brand hex on a light surface (UI tier by default)
 * adjustContrast('#ff6b6b');
 * // → 'oklch(0.553 0.2 27.5)' (or similar — the first 50→950 shade
 * //   that scores Lc ≥ 60 against #ffffff)
 *
 * @example
 * // Achromatic input picks up the palette's tint
 * adjustContrast('#888888', { palette: 'slate', tier: 'body' });
 * // → an OKLCH with slate's hue/chroma at the first shade hitting Lc ≥ 75
 *
 * @throws If `input` cannot be parsed as a CSS color.
 * @throws If no shade in the perceptual grid hits the tier threshold
 *         against the resolved background.
 */
export function adjustContrast(
  input: string,
  options: AdjustContrastOptions = {}
): string {
  const { background = '#ffffff', tier = 'ui', palette = 'slate' } = options;

  const minLc = TIER_THRESHOLDS[tier];
  const bgOklch = parseToOklch(background, 'background');
  const bgInts = oklchToSrgbInts(bgOklch);

  const inputOklch = parseToOklch(input, 'input');

  const inputChroma = inputOklch.c ?? 0;
  const isAchromatic = inputChroma < ACHROMATIC_THRESHOLD;
  const reference = getPaletteReference(palette);
  const chroma = isAchromatic ? reference.c : inputChroma;
  const hue = isAchromatic ? reference.h : (inputOklch.h ?? reference.h);

  const attempts: { shade: Shade; lc: number }[] = [];

  for (const shade of SHADES) {
    const l = PERCEPTUAL_L_GRID[shade];
    const candidate: Oklch = { mode: 'oklch', l, c: chroma, h: hue };
    const fgInts = oklchToSrgbInts(candidate);
    const lc = APCAcontrast(sRGBtoY(fgInts), sRGBtoY(bgInts)) as number;
    attempts.push({ shade, lc });
    if (Math.abs(lc) >= minLc) {
      return formatOklch(clampForEmit(candidate));
    }
  }

  const summary = attempts
    .map((a) => `${a.shade}=${a.lc.toFixed(1)}`)
    .join(', ');
  throw new Error(
    `adjustContrast: no shade in palette '${palette}' meets ${tier} tier (|Lc| ≥ ${minLc}) against background '${background}'. Tried: ${summary}`
  );
}
