import { oklch, parse } from 'culori';

import primitiveColors from '../../tokens/primitives/color.json';

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

/** Light/dark theme axis. */
export type Mode = 'light' | 'dark';

/** Surface tone families a Nexus theme can be seeded with. */
export type NexusSurfaceTone = 'stone' | 'neutral' | 'zinc' | 'slate' | 'gray';

export interface PaletteReference {
  c: number;
  h: number;
}

function deriveReference(palette: PaletteKey): PaletteReference {
  const hex = primitiveColors[palette]['500'].$value;
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
