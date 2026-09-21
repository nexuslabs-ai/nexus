import primitiveColors from '../../tokens/primitives/color.json';

import { type Shade, SHADES } from './palette';
import {
  describePaletteConversion,
  hexToOklchPinned,
  isPaletteShadeKey,
} from './primitive-palette-conversion';
import type { PaletteProvenance, ThemeTrace } from './theme-inspection';

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
  return readPaletteShade(palette, shade);
}

export function readPaletteShade(
  palette: PrimitivePaletteName,
  shade: Shade,
  trace?: ThemeTrace
): string {
  if (!PRIMITIVE_PALETTE_NAMES.includes(palette)) {
    throw new Error(`palette: unknown primitive palette "${palette}"`);
  }
  if (!isPaletteShadeKey(shade)) {
    throw new Error(`palette: unknown shade "${shade}"`);
  }
  const shades = shadeCache.get(palette) ?? {};
  const cached = shades[shade];
  if (cached !== undefined) {
    recordProvenance(palette, shade, trace);
    return cached;
  }
  const color = hexToOklchPinned(
    primitiveColors[palette][shade].$value,
    shade,
    palette
  );
  shades[shade] = color;
  shadeCache.set(palette, shades);
  recordProvenance(palette, shade, trace);
  return color;
}

export function getPaletteRamp(
  palette: PrimitivePaletteName
): PrimitivePaletteRamp {
  return readPaletteRamp(palette);
}

export function readPaletteRamp(
  palette: PrimitivePaletteName,
  trace?: ThemeTrace
): PrimitivePaletteRamp {
  const cached = rampCache.get(palette);
  if (cached) {
    if (trace)
      for (const shade of SHADES) recordProvenance(palette, shade, trace);
    return cached;
  }
  const ramp = Object.freeze(
    Object.fromEntries(
      SHADES.map((shade) => [shade, readPaletteShade(palette, shade, trace)])
    )
  ) as PrimitivePaletteRamp;
  rampCache.set(palette, ramp);
  return ramp;
}

const provenanceCache = new Map<string, PaletteProvenance>();

function recordProvenance(
  palette: PrimitivePaletteName,
  shade: Shade,
  trace?: ThemeTrace
): void {
  if (!trace) return;
  const key = `${palette}.${shade}`;
  let provenance = provenanceCache.get(key);
  if (!provenance) {
    provenance = describePaletteConversion(
      primitiveColors[palette][shade].$value,
      shade,
      palette
    );
    provenanceCache.set(key, provenance);
  }
  trace.record({
    kind: 'palette',
    origin: 'authored-palette-provenance',
    provenance,
  });
}
