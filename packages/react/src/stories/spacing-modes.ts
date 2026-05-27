export const SPACING_MODES = [
  'vega',
  'lyra',
  'maia',
  'mira',
  'nova',
  'luma',
  'sera',
] as const;

export type SpacingMode = (typeof SPACING_MODES)[number];
