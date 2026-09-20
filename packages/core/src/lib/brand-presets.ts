import primitiveColors from '../../tokens/primitives/color.json';

export const DEFAULT_BRAND_COLOR = '#0a0a0a';

export const BRAND_COLOR_PRESETS = Object.freeze(
  [
    { value: 'default', label: 'Default', color: DEFAULT_BRAND_COLOR },
    {
      value: 'indigo',
      label: 'Indigo',
      color: primitiveColors.indigo['600'].$value,
    },
    { value: 'blue', label: 'Blue', color: primitiveColors.blue['600'].$value },
    {
      value: 'violet',
      label: 'Violet',
      color: primitiveColors.violet['600'].$value,
    },
    { value: 'rose', label: 'Rose', color: primitiveColors.rose['600'].$value },
    {
      value: 'orange',
      label: 'Orange',
      color: primitiveColors.orange['600'].$value,
    },
    {
      value: 'amber',
      label: 'Amber',
      color: primitiveColors.amber['600'].$value,
    },
    {
      value: 'green',
      label: 'Green',
      color: primitiveColors.green['600'].$value,
    },
    { value: 'teal', label: 'Teal', color: primitiveColors.teal['600'].$value },
  ].map((preset) => Object.freeze(preset))
);

export type BrandColorPreset = (typeof BRAND_COLOR_PRESETS)[number];
