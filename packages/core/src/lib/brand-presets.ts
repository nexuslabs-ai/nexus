import primitiveColors from '../../tokens/primitives/color.json';

import type { PrimitivePaletteName } from './primitive-palette';

export const DEFAULT_BRAND_COLOR = '#0a0a0a';

const BRAND_PRESET_FAMILIES = [
  'indigo',
  'blue',
  'violet',
  'rose',
  'orange',
  'amber',
  'green',
  'teal',
] as const satisfies readonly PrimitivePaletteName[];

export interface BrandColorPreset {
  readonly value: 'default' | (typeof BRAND_PRESET_FAMILIES)[number];
  readonly label: string;
  /** Six-digit lowercase hex seed for `brandColor`. */
  readonly color: string;
}

export const BRAND_COLOR_PRESETS: readonly BrandColorPreset[] = [
  { value: 'default', label: 'Default', color: DEFAULT_BRAND_COLOR },
  ...BRAND_PRESET_FAMILIES.map((family) => ({
    value: family,
    label: family.charAt(0).toUpperCase() + family.slice(1),
    color: primitiveColors[family]['600'].$value,
  })),
];
