import { oklch, parse } from 'culori';

import primitiveColors from '../../tokens/primitives/color.json';

import perceptualGrid from './perceptual-grid.json';

export const SHADES = [
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
] as const;

export type Shade = (typeof SHADES)[number];

export const PALETTE_KEYS = [
  'slate',
  'neutral',
  'gray',
  'stone',
  'zinc',
] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];

export const TIER_THRESHOLDS = {
  body: 75,
  ui: 60,
  incidental: 45,
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

export const PERCEPTUAL_L_GRID: Record<Shade, number> = Object.freeze(
  perceptualGrid as Record<Shade, number>
);

function shade500Hex(palette: PaletteKey): string {
  const palettes = primitiveColors as Record<string, unknown>;
  const entry = palettes[palette];
  if (entry && typeof entry === 'object' && '500' in entry) {
    const shade = (entry as Record<string, { $value?: string }>)['500'];
    if (shade && typeof shade.$value === 'string') {
      return shade.$value;
    }
  }
  throw new Error(
    `palette: missing primitive token '${palette}.500' in color.json`
  );
}

export interface PaletteReference {
  c: number;
  h: number;
}

function deriveReference(palette: PaletteKey): PaletteReference {
  const hex = shade500Hex(palette);
  const parsed = parse(hex);
  if (!parsed) {
    throw new Error(`palette: cannot parse '${palette}.500' hex '${hex}'`);
  }
  const o = oklch(parsed);
  if (!o) {
    throw new Error(`palette: cannot convert '${palette}.500' to OKLCH`);
  }
  return { c: o.c ?? 0, h: o.h ?? 0 };
}

const paletteReferenceCache = new Map<PaletteKey, PaletteReference>();

export function getPaletteReference(palette: PaletteKey): PaletteReference {
  const cached = paletteReferenceCache.get(palette);
  if (cached) return cached;
  const reference = deriveReference(palette);
  paletteReferenceCache.set(palette, reference);
  return reference;
}
