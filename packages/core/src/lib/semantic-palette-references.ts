import type { Shade } from './palette';
import type { PrimitivePaletteName } from './primitive-palette';

export const STATUS_PALETTE_FAMILIES = {
  success: 'green',
  warning: 'orange',
  error: 'red',
  information: 'blue',
} as const satisfies Record<string, PrimitivePaletteName>;

export const CHART_PALETTE_REFERENCES = [
  { palette: 'teal', light: '700', dark: '200' },
  { palette: 'lime', light: '700', dark: '200' },
  { palette: 'orange', light: '600', dark: '200' },
  { palette: 'rose', light: '600', dark: '200' },
  { palette: 'indigo', light: '600', dark: '200' },
] as const satisfies readonly {
  palette: PrimitivePaletteName;
  light: Shade;
  dark: Shade;
}[];
