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
  Object.keys(primitiveColors).filter(
    (name): name is PrimitivePaletteName => name !== 'white' && name !== 'black'
  );

const rampCache = new Map<PrimitivePaletteName, PrimitivePaletteRamp>();

export function getPaletteRamp(
  palette: PrimitivePaletteName
): PrimitivePaletteRamp {
  if (!PRIMITIVE_PALETTE_NAMES.includes(palette)) {
    throw new Error(`palette: unknown primitive palette "${palette}"`);
  }
  const cached = rampCache.get(palette);
  if (cached) return cached;
  const ramp = Object.freeze(
    Object.fromEntries(
      SHADES.map((shade) => [
        shade,
        hexToOklchPinned(
          primitiveColors[palette][shade].$value,
          shade,
          palette
        ),
      ])
    ) as Record<Shade, string>
  );
  rampCache.set(palette, ramp);
  return ramp;
}

export function getPaletteShade(
  palette: PrimitivePaletteName,
  shade: Shade
): string {
  if (!isPaletteShadeKey(shade)) {
    throw new Error(`palette: unknown shade "${shade}"`);
  }
  return getPaletteRamp(palette)[shade];
}
