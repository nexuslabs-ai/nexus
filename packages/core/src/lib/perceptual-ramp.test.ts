import { oklch, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { PERCEPTUAL_L_GRID, SHADES } from './palette';
import { isColor, pinnedOklch, rampFromSeed } from './perceptual-ramp';

function lOf(oklchStr: string): number {
  return oklch(parse(oklchStr)!)!.l!;
}

describe('pinnedOklch', () => {
  it('pins lightness to the grid value for the shade', () => {
    // L comes from the grid, not the seed, so a dark seed still yields a light shade-50
    expect(lOf(pinnedOklch('#1e3a8a', '50'))).toBeCloseTo(
      PERCEPTUAL_L_GRID['50'],
      2
    );
    expect(lOf(pinnedOklch('#1e3a8a', '600'))).toBeCloseTo(
      PERCEPTUAL_L_GRID['600'],
      2
    );
  });

  it('caps chroma at the seed when capAtSeedChroma (default)', () => {
    // a near-grey seed must not bloom into a vivid ramp
    const grey = oklch(parse('#6b7280')!)!;
    const shade = oklch(parse(pinnedOklch('#6b7280', '500'))!)!;
    // formatOklch rounds to 4 decimals, so allow that slack; the point is the
    // ramp stays near the muted seed (~0.023) and doesn't bloom to the cusp.
    expect(shade.c!).toBeLessThanOrEqual((grey.c ?? 0) + 5e-4);
  });
});

describe('rampFromSeed', () => {
  it('returns all 11 shades', () => {
    const ramp = rampFromSeed('#339cff');
    expect(Object.keys(ramp).sort()).toEqual([...SHADES].sort());
  });

  it('descends in lightness 50 → 950', () => {
    const ramp = rampFromSeed('#339cff');
    expect(lOf(ramp['50'])).toBeGreaterThan(lOf(ramp['500']));
    expect(lOf(ramp['500'])).toBeGreaterThan(lOf(ramp['950']));
  });
});

describe('isColor', () => {
  it('accepts parseable CSS colors', () => {
    expect(isColor('#339cff')).toBe(true);
    expect(isColor('oklch(0.5 0.1 250)')).toBe(true);
    expect(isColor('rebeccapurple')).toBe(true);
  });

  it('rejects unparseable strings', () => {
    expect(isColor('not-a-color')).toBe(false);
    expect(isColor('')).toBe(false);
  });
});
