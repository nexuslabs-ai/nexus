import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  hexToOklchMechanical,
  hexToOklchPinned,
  hexToSrgbInts,
  isPaletteShadeKey,
  PERCEPTUAL_L_GRID,
  PERCEPTUAL_L_GRID_HUE,
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

  it('delivers P3 chroma for shades inside P3 but outside sRGB (teal.600 #0d9488)', () => {
    // sRGB clamp would emit c≈0.081; P3 clamp emits c≈0.104. Pin to the P3
    // band (0.09 < c < 0.11) so a future widening to rec2020 trips the test
    // too, not just a revert to sRGB.
    const parsed = parseOklch(hexToOklchPinned('#0d9488', '600'));
    expect(parsed.c).toBeGreaterThan(0.09);
    expect(parsed.c).toBeLessThan(0.11);
  });

  // A re-pitched chromatic palette pins L to its own hue curve, not the flat
  // grid (0.553 at shade 500). Before this, only blue.500 was asserted — a
  // corrupted green/yellow/red band would have shipped silently. Hexes are the
  // real shade-500 source values from color.json; L is name-driven so the flat
  // assertion is what catches a regression to the un-tuned grid.
  const HUE_CURVE_BANDS = [
    { palette: 'green', hex: '#569947', curveL: 0.72 },
    { palette: 'yellow', hex: '#facc15', curveL: 0.8 },
    { palette: 'red', hex: '#d6455b', curveL: 0.637 },
  ];
  for (const { palette, hex, curveL } of HUE_CURVE_BANDS) {
    it(`pins ${palette}.500 to its hue-curve L (${curveL}), not the flat grid`, () => {
      const { l } = parseOklch(hexToOklchPinned(hex, '500', palette));
      expect(l).toBeCloseTo(curveL, 3);
      expect(l).not.toBeCloseTo(PERCEPTUAL_L_GRID['500'], 3);
    });
  }

  it('selects the curve by palette NAME — same hex, listed vs unlisted palette', () => {
    // Opt-in is by name: "blue" has a hue curve, the surface "slate" does not.
    // Same hex + shade, only the name differs — the listed palette takes its
    // curve (0.623), the unlisted one falls back to the flat grid (0.553).
    expect(
      parseOklch(hexToOklchPinned('#3b82f6', '500', 'blue')).l
    ).toBeCloseTo(0.623, 3);
    expect(
      parseOklch(hexToOklchPinned('#3b82f6', '500', 'slate')).l
    ).toBeCloseTo(PERCEPTUAL_L_GRID['500'], 3);
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

describe('hexToSrgbInts', () => {
  it('returns a 3-tuple for opaque colors (apca-w3 sRGBtoY contract)', () => {
    const ints = hexToSrgbInts('#3b82f6');
    expect(ints).toHaveLength(3);
    expect(ints.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)).toBe(
      true
    );
  });

  it('throws on alpha-bearing input (must pre-blend before contrast)', () => {
    // 8-digit hex with alpha < 1 — overlay tokens (e.g. `#000000cc`) hit
    // this path. apca-w3 ignores indices past [r,g,b], so silently dropping
    // alpha would produce wrong Lc scores; throw forces the caller to
    // pre-blend against the actual background first.
    expect(() => hexToSrgbInts('#000000cc')).toThrow(/alpha-bearing/);
  });
});

describe('P3 gamut clip warning', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns when chroma drops more than 20% on a shade outside P3 at its pinned L (amber.950 #392402)', () => {
    hexToOklchPinned('#392402', '950');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const message = warnSpy.mock.calls[0][0];
    expect(message).toContain('#392402');
    expect(message).toContain('shade 950');
  });

  it('does not warn on shades within P3 at their pinned L', () => {
    hexToOklchPinned('#3b82f6', '500');
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('hue curve ↔ color.json coverage', () => {
  it('every chromatic palette in color.json has a hue-curve entry', () => {
    // The hue curve is opted into by palette NAME (PERCEPTUAL_L_GRID_HUE[name]),
    // so a chromatic palette added to color.json but forgotten here silently
    // falls back to the flat grid — re-muddying it (the bug #248 fixed). Guard
    // it: anything with real chroma at shade 500 must have a curve. Measured
    // split at shade 500 (via the pipeline's own mechanical conversion): the 5
    // non-chromatic palettes top out at chroma 0.041 (slate); the 17 chromatics
    // start at 0.123 (teal). 0.08 sits midway in that gap, margin on both sides.
    const CHROMATIC_C_MIN = 0.08;
    const OKLCH_C = /^oklch\([-\d.]+ ([-\d.]+)/;
    const chromaOf = (hex) =>
      Number(OKLCH_C.exec(hexToOklchMechanical(hex))[1]);

    // color.json is keyed by palette name at the top level (no wrapper object):
    // { green: { '500': { $value } }, … }. Iterate those entries directly.
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const palettes = JSON.parse(
      fs.readFileSync(
        path.join(dir, '../../tokens/primitives/color.json'),
        'utf8'
      )
    );

    const untuned = [];
    for (const [name, shades] of Object.entries(palettes)) {
      const hex = shades?.['500']?.$value;
      if (typeof hex !== 'string' || !hex.startsWith('#')) continue;
      if (chromaOf(hex) > CHROMATIC_C_MIN && !(name in PERCEPTUAL_L_GRID_HUE)) {
        untuned.push(name);
      }
    }

    expect(untuned).toEqual([]);
  });
});
