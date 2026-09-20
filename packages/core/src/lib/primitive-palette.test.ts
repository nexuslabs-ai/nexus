import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import primitiveColors from '../../tokens/primitives/color.json';

import {
  deriveTheme,
  type ThemeDerivationInput,
  themeToCss,
} from './derive-theme';
import { type Shade, SHADES } from './palette';
import baseline from './palette-parity.fixture.json';
import {
  getPaletteRamp,
  getPaletteShade,
  PRIMITIVE_PALETTE_NAMES,
  type PrimitivePaletteName,
} from './primitive-palette';
import {
  hexToOklchMechanical,
  hexToOklchPinned,
  hexToSrgbInts,
} from './primitive-palette-conversion';
import {
  CHART_PALETTE_REFERENCES,
  STATUS_PALETTE_FAMILIES,
} from './semantic-palette-references';

const digest = (value: unknown): string =>
  createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');

describe('authored primitive palettes', () => {
  it('resolves all authored ramps to the original emitted CSS and audit channels', () => {
    const names = Object.keys(primitiveColors).filter(
      (name) => name !== 'white' && name !== 'black'
    );
    expect(PRIMITIVE_PALETTE_NAMES).toEqual(names);
    expect(Object.keys(baseline.palettes)).toEqual(names);
    for (const name of PRIMITIVE_PALETTE_NAMES) {
      const ramp = getPaletteRamp(name);
      expect(Object.keys(ramp)).toEqual(SHADES);
      for (const shade of SHADES) {
        const expected = baseline.palettes[name][shade];
        expect(getPaletteShade(name, shade), `${name}.${shade}`).toBe(
          expected.css
        );
        expect(ramp[shade]).toBe(expected.css);
        expect(
          hexToSrgbInts(primitiveColors[name][shade].$value, shade, name)
        ).toEqual(expected.srgb);
      }
    }
  });

  it('preserves all 63 engine starting colors', () => {
    for (const [role, palette] of Object.entries(STATUS_PALETTE_FAMILIES)) {
      expect(getPaletteRamp(palette)).toEqual(
        baseline.startingColors.status[
          role as keyof typeof STATUS_PALETTE_FAMILIES
        ]
      );
    }
    for (const [shade, value] of Object.entries(
      baseline.startingColors.neutral
    )) {
      expect(getPaletteShade('neutral', shade as Shade)).toBe(value);
    }
    expect(
      CHART_PALETTE_REFERENCES.map((ref) =>
        getPaletteShade(ref.palette, ref.light)
      )
    ).toEqual(baseline.startingColors.chartLight);
    expect(
      CHART_PALETTE_REFERENCES.map((ref) =>
        getPaletteShade(ref.palette, ref.dark)
      )
    ).toEqual(baseline.startingColors.chartDark);
  });

  it('cannot mutate a shared ramp or its reference inventory', () => {
    const ramp = getPaletteRamp('green');
    const color = ramp['600'];
    expect(Reflect.set(ramp, '600', '#000000')).toBe(false);
    expect(getPaletteRamp('green')['600']).toBe(color);
    expect(Object.isFrozen(PRIMITIVE_PALETTE_NAMES)).toBe(true);
    expect(Object.isFrozen(SHADES)).toBe(true);
    expect(Object.isFrozen(STATUS_PALETTE_FAMILIES)).toBe(true);
    expect(Object.isFrozen(CHART_PALETTE_REFERENCES)).toBe(true);
    expect(CHART_PALETTE_REFERENCES.every(Object.isFrozen)).toBe(true);
  });

  it('rejects unknown families and shades from JavaScript callers', () => {
    for (const name of ['white', 'missing', '__proto__']) {
      expect(() => getPaletteRamp(name as PrimitivePaletteName)).toThrow(
        'unknown primitive palette'
      );
    }
    expect(() => getPaletteShade('green', '999' as Shade)).toThrow(
      'unknown shade'
    );
  });

  it.each(baseline.conversionCases)(
    'preserves conversion for $args',
    ({ args, css }) => {
      const [color, shade, palette] = args;
      if (!color) throw new Error('Missing baseline color');
      const actual = shade
        ? hexToOklchPinned(color, shade, palette)
        : hexToOklchMechanical(color);
      expect(actual).toBe(css);
    }
  );
});

describe(`theme parity with ${baseline.revision}`, () => {
  it.each(baseline.themes)(
    '$id: both complete maps and serialized CSS stay identical',
    ({ input, results }) => {
      for (const expected of results) {
        const theme = deriveTheme({
          ...input,
          contrast: expected.contrast,
        } as ThemeDerivationInput);
        const context = JSON.stringify(expected.contrast);
        expect(digest(theme.light), `light ${context}`).toBe(expected.light);
        expect(digest(theme.dark), `dark ${context}`).toBe(expected.dark);
        expect(digest(themeToCss(theme)), `CSS ${context}`).toBe(expected.css);
      }
    }
  );
});
