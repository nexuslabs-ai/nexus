import primitiveColors from '../../tokens/primitives/color.json';

import { type Shade, SHADES } from './palette';
import {
  hexToOklchPinned,
  isPaletteShadeKey,
} from './primitive-palette-conversion';

export type PrimitivePaletteName = Exclude<
  keyof typeof primitiveColors,
  'white' | 'black'
>;
export type PrimitivePaletteRamp = Readonly<Record<Shade, string>>;

export const PRIMITIVE_PALETTE_NAMES: readonly PrimitivePaletteName[] =
  Object.freeze(
    Object.keys(primitiveColors).filter(
      (name): name is PrimitivePaletteName =>
        name !== 'white' && name !== 'black'
    )
  );

const shadeCache = new Map<
  PrimitivePaletteName,
  Partial<Record<Shade, string>>
>();
const rampCache = new Map<PrimitivePaletteName, PrimitivePaletteRamp>();

export function getPaletteShade(
  palette: PrimitivePaletteName,
  shade: Shade
): string {
  if (!PRIMITIVE_PALETTE_NAMES.includes(palette)) {
    throw new Error(`palette: unknown primitive palette "${palette}"`);
  }
  if (!isPaletteShadeKey(shade)) {
    throw new Error(`palette: unknown shade "${shade}"`);
  }
  const shades = shadeCache.get(palette) ?? {};
  const cached = shades[shade];
  if (cached !== undefined) return cached;
  const color = hexToOklchPinned(
    primitiveColors[palette][shade].$value,
    shade,
    palette
  );
  shades[shade] = color;
  shadeCache.set(palette, shades);
  return color;
}

export function getPaletteRamp(
  palette: PrimitivePaletteName
): PrimitivePaletteRamp {
  const cached = rampCache.get(palette);
  if (cached) return cached;
  const ramp = Object.freeze(
    Object.fromEntries(
      SHADES.map((shade) => [shade, getPaletteShade(palette, shade)])
    )
  ) as PrimitivePaletteRamp;
  rampCache.set(palette, ramp);
  return ramp;
}
