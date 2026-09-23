import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { type Shade, SHADES } from './palette';
import {
  getPaletteRamp,
  getPaletteShade,
  PRIMITIVE_PALETTE_NAMES,
  type PrimitivePaletteName,
} from './primitive-palette';

const variablesCss = readFileSync(
  resolve(process.cwd(), 'packages/tailwind/variables.css'),
  'utf8'
);

function emittedPrimitiveShades(css: string): Map<string, Map<string, string>> {
  const rootBlock = /:root\s*\{([^}]*)\}/.exec(css)?.[1];
  if (rootBlock === undefined) throw new Error('variables.css has no :root');
  const families = new Map<string, Map<string, string>>();
  for (const [, family, shade, value] of rootBlock.matchAll(
    /--nx-color-([a-z]+)-(\d+):\s*([^;]+);/g
  )) {
    if (!family || !shade || !value) continue;
    const shades = families.get(family) ?? new Map<string, string>();
    shades.set(shade, value.trim());
    families.set(family, shades);
  }
  return families;
}

describe('authored primitive palettes', () => {
  const emitted = emittedPrimitiveShades(variablesCss);

  it('covers the same palette families as the generated CSS', () => {
    expect([...PRIMITIVE_PALETTE_NAMES].sort()).toEqual(
      [...emitted.keys()].sort()
    );
  });

  it.each(PRIMITIVE_PALETTE_NAMES)(
    '%s resolves every shade to the value the token generator emits',
    (name) => {
      const ramp = getPaletteRamp(name);
      for (const shade of SHADES) {
        const expected = emitted.get(name)?.get(shade);
        expect(getPaletteShade(name, shade), `${name}.${shade}`).toBe(expected);
        expect(ramp[shade], `${name}.${shade}`).toBe(expected);
      }
    }
  );

  it('hands out ramps callers cannot mutate', () => {
    const ramp = getPaletteRamp('green');
    const color = ramp['600'];
    expect(Reflect.set(ramp, '600', '#000000')).toBe(false);
    expect(getPaletteRamp('green')['600']).toBe(color);
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
});
