import type { Shade } from './palette';

/**
 * Static (non-derived) color families emitted verbatim by `deriveTheme`: the
 * status ramps, chart series, and the tone-independent neutral family. Unlike
 * surfaces, these are authored literals rather than seed-derived, so they live
 * outside the surface ladder.
 */

type StatusFamily = 'success' | 'warning' | 'error' | 'information';

export const STATUS_RAMP = {
  success: {
    '50': 'oklch(0.982 0.035 137.785)',
    '100': 'oklch(0.96 0.0789 139.835)',
    '200': 'oklch(0.925 0.1596 139.892)',
    '300': 'oklch(0.87 0.3119 139.843)',
    '400': 'oklch(0.79 0.2864 140.349)',
    '500': 'oklch(0.72 0.2591 140.014)',
    '600': 'oklch(0.62 0.2233 140.055)',
    '700': 'oklch(0.52 0.1871 140.022)',
    '800': 'oklch(0.43 0.1534 139.623)',
    '900': 'oklch(0.34 0.1216 139.757)',
    '950': 'oklch(0.25 0.0887 139.4)',
  },
  warning: {
    '50': 'oklch(0.98 0.0185 73.684)',
    '100': 'oklch(0.955 0.0435 75.164)',
    '200': 'oklch(0.91 0.0819 70.697)',
    '300': 'oklch(0.84 0.142 66.29)',
    '400': 'oklch(0.78 0.1803 55.934)',
    '500': 'oklch(0.71 0.2099 47.604)',
    '600': 'oklch(0.62 0.2044 41.116)',
    '700': 'oklch(0.52 0.1809 38.402)',
    '800': 'oklch(0.43 0.153 37.304)',
    '900': 'oklch(0.34 0.1188 38.172)',
    '950': 'oklch(0.25 0.091 36.259)',
  },
  error: {
    '50': 'oklch(0.971 0.0176 28.865)',
    '100': 'oklch(0.936 0.0399 27.342)',
    '200': 'oklch(0.885 0.0747 27.394)',
    '300': 'oklch(0.808 0.1333 28.058)',
    '400': 'oklch(0.704 0.2267 27.842)',
    '500': 'oklch(0.637 0.2786 27.978)',
    '600': 'oklch(0.577 0.2523 27.926)',
    '700': 'oklch(0.505 0.2209 27.946)',
    '800': 'oklch(0.42 0.1838 28.144)',
    '900': 'oklch(0.34 0.1487 28.057)',
    '950': 'oklch(0.25 0.1094 28.309)',
  },
  information: {
    '50': 'oklch(0.97 0.0152 252.81)',
    '100': 'oklch(0.932 0.0342 257.472)',
    '200': 'oklch(0.882 0.0612 253.613)',
    '300': 'oklch(0.809 0.1012 254.248)',
    '400': 'oklch(0.707 0.1599 255.225)',
    '500': 'oklch(0.623 0.2112 255.145)',
    '600': 'oklch(0.546 0.2205 255.276)',
    '700': 'oklch(0.488 0.197 255.267)',
    '800': 'oklch(0.41 0.1633 254.871)',
    '900': 'oklch(0.33 0.1316 254.902)',
    '950': 'oklch(0.25 0.1042 256.214)',
  },
} satisfies Record<StatusFamily, Record<Shade, string>>;

export const CHART_LIGHT = [
  'oklch(0.62 0.1405 184.704)',
  'oklch(0.37 0.1125 131.063)',
  'oklch(0.62 0.2044 41.116)',
  'oklch(0.58 0.2489 17.585)',
  'oklch(0.49 0.2912 276.966)',
] as const;

export const CHART_DARK = [
  'oklch(0.9 0.1682 180.426)',
  'oklch(0.93 0.2278 124.321)',
  'oklch(0.91 0.0819 70.697)',
  'oklch(0.885 0.0771 10.001)',
  'oklch(0.865 0.069 274.039)',
] as const;

/** Tone-independent neutral surface family (9 tokens, no borders). */
export const NEUTRAL = {
  '50': 'oklch(0.985 0 0)',
  '100': 'oklch(0.945 0 0)',
  '200': 'oklch(0.87 0 0)',
  '300': 'oklch(0.765 0 0)',
  '600': 'oklch(0.46 0 0)',
  '700': 'oklch(0.385 0 0)',
  '800': 'oklch(0.297 0 0)',
  '900': 'oklch(0.207 0 0)',
  '950': 'oklch(0.118 0 0)',
} satisfies Record<Exclude<Shade, '400' | '500'>, string>;
