import { clampChroma, type Oklch, oklch, parse } from 'culori';

import { formatOklch } from './oklch-format';
import { PERCEPTUAL_L_GRID, type Shade, SHADES } from './palette';

// emit ships P3 chroma (browsers gamut-map at render); sit just inside the cusp.
const EMIT_GAMUT = 'p3';
const CUSP_FRACTION = 0.95;

/** Whether a string is a CSS color culori (and thus the engine) can parse. */
export function isColor(value: string): boolean {
  return parse(value) !== undefined;
}

/** Parse any CSS color string to OKLCH. Throws on unparseable input. */
export function seedOklch(input: string): Oklch {
  const parsed = parse(input);
  if (!parsed)
    throw new Error(`perceptual-ramp: cannot parse color '${input}'`);
  const converted = oklch(parsed);
  if (!converted)
    throw new Error(`perceptual-ramp: cannot convert '${input}' to OKLCH`);
  return converted;
}

export interface RampOptions {
  /** Cap cusp chroma at the seed's own chroma so a muted accent stays muted. @default true */
  capAtSeedChroma?: boolean;
}

/** One shade: pinned L at the seed's hue, chroma at the P3 cusp (optionally capped at the seed). */
export function pinnedOklch(
  seedHex: string,
  shade: Shade,
  options: RampOptions = {}
): string {
  const { capAtSeedChroma = true } = options;
  const seed = seedOklch(seedHex);
  const l = PERCEPTUAL_L_GRID[shade];
  const hue = seed.h ?? 0;
  const seedC = seed.c ?? 0;

  // Max chroma in P3 at this (L, hue): start past the gamut and clamp inward.
  const cuspC =
    clampChroma({ mode: 'oklch', l, c: 0.5, h: hue }, 'oklch', EMIT_GAMUT).c ??
    0;
  let chroma = cuspC * CUSP_FRACTION;
  if (capAtSeedChroma && seedC > 0) chroma = Math.min(chroma, seedC);

  const target: Oklch = { mode: 'oklch', l, c: chroma, h: hue };
  return formatOklch(clampChroma(target, 'oklch', EMIT_GAMUT));
}

export type Ramp = Record<Shade, string>;

/** Full 50→950 ramp from one seed color. */
export function rampFromSeed(seedHex: string, options: RampOptions = {}): Ramp {
  const ramp: Partial<Ramp> = {};
  for (const shade of SHADES)
    ramp[shade] = pinnedOklch(seedHex, shade, options);
  return ramp as Ramp;
}
