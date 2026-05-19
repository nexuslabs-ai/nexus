import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  hexToOklchMechanical,
  hexToOklchPinned,
  isPaletteShadeKey,
  PERCEPTUAL_L_GRID,
} from '../lib/perceptual-grid.js';

const OKLCH_RE = /^oklch\(([-\d.]+) ([-\d.]+) ([-\d.]+)(?: \/ ([\d.]+))?\)$/;

function parseOklch(css) {
  const match = OKLCH_RE.exec(css);
  if (!match) throw new Error(`unparseable oklch: ${css}`);
  const [, l, c, h, alpha] = match;
  return {
    l: Number(l),
    c: Number(c),
    h: Number(h),
    alpha: alpha === undefined ? undefined : Number(alpha),
  };
}

describe('PERCEPTUAL_L_GRID', () => {
  it('is frozen', () => {
    expect(Object.isFrozen(PERCEPTUAL_L_GRID)).toBe(true);
  });

  it('covers all eleven shade keys', () => {
    expect(Object.keys(PERCEPTUAL_L_GRID)).toEqual([
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ]);
  });
});

describe('isPaletteShadeKey', () => {
  it('accepts every shade in the grid', () => {
    for (const key of Object.keys(PERCEPTUAL_L_GRID)) {
      expect(isPaletteShadeKey(key)).toBe(true);
    }
  });

  it('rejects non-shade keys', () => {
    expect(isPaletteShadeKey('overlay')).toBe(false);
    expect(isPaletteShadeKey('background')).toBe(false);
    expect(isPaletteShadeKey('5')).toBe(false);
    expect(isPaletteShadeKey('1000')).toBe(false);
    expect(isPaletteShadeKey('500x')).toBe(false);
    expect(isPaletteShadeKey('')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isPaletteShadeKey(500)).toBe(false);
    expect(isPaletteShadeKey(undefined)).toBe(false);
    expect(isPaletteShadeKey(null)).toBe(false);
  });
});

describe('hexToOklchPinned', () => {
  it('pins L to the grid for blue.500 (#3b82f6 at shade 500)', () => {
    const parsed = parseOklch(hexToOklchPinned('#3b82f6', '500'));
    expect(parsed.l).toBeCloseTo(0.553, 3);
    expect(parsed.c).toBeGreaterThan(0);
    expect(parsed.h).toBeCloseTo(259.815, 2);
    expect(parsed.alpha).toBeUndefined();
  });

  it('pins L to 0.66 for shade 400', () => {
    const parsed = parseOklch(hexToOklchPinned('#71a1df', '400'));
    expect(parsed.l).toBeCloseTo(0.66, 3);
  });

  it('throws on unknown shade key', () => {
    expect(() => hexToOklchPinned('#3b82f6', '999')).toThrow(/unknown shade/);
  });

  it('throws on unparseable hex', () => {
    expect(() => hexToOklchPinned('not-a-color', '500')).toThrow();
  });
});

describe('hexToOklchMechanical', () => {
  it('preserves alpha from 8-digit hex', () => {
    const parsed = parseOklch(hexToOklchMechanical('#000000cc'));
    expect(parsed.alpha).toBeCloseTo(0.8, 2);
    expect(parsed.l).toBe(0);
    expect(parsed.c).toBe(0);
  });

  it('emits no alpha component for opaque colors', () => {
    expect(hexToOklchMechanical('#3b82f6')).not.toMatch(/\//);
  });

  it('emits achromatic hue as 0 (not the culori `none` keyword)', () => {
    expect(hexToOklchMechanical('#ffffff')).toBe('oklch(1 0 0)');
    expect(hexToOklchMechanical('#000000')).toBe('oklch(0 0 0)');
  });
});

describe('gamut clip warning', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when chroma drops more than 20% on a vivid shade like yellow.400 (#facc15)', () => {
    hexToOklchPinned('#facc15', '400');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const message = warnSpy.mock.calls[0][0];
    expect(message).toContain('#facc15');
    expect(message).toContain('shade 400');
  });

  it('does not warn on shades within sRGB gamut at their pinned L', () => {
    hexToOklchPinned('#3b82f6', '500');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
