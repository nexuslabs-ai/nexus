import type {
  NexusSurfaceTone,
  ThemeDerivationInput,
  ThemeSeeds,
} from './derive-theme';
import { isColor } from './perceptual-ramp';

type ModeSeeds = Pick<ThemeSeeds, 'background' | 'foreground'>;

export type NexusAppearanceMode = 'light' | 'dark' | 'system';
export type NexusDensity = 'nova' | 'mira' | 'luma' | 'sera';
export type NexusCorners = 'sharp' | 'subtle' | 'smooth' | 'mellow';
export type NexusElevation = 'maia' | 'mira' | 'nova';
export type NexusStroke = 'maia' | 'vega' | 'nova';

export interface NexusAppearancePrefs {
  uiFont: string;
  codeFont: string;
  uiFontSize: number;
  codeFontSize: number;
  reduceMotion: 'system' | 'on' | 'off';
  pointerCursors: boolean;
  fontSmoothing: boolean;
}

export interface NexusAppearanceState {
  mode: NexusAppearanceMode;
  brandColor: string;
  surfaceTone: NexusSurfaceTone;
  contrast: number;
  density: NexusDensity;
  corners: NexusCorners;
  elevation: NexusElevation;
  stroke: NexusStroke;
  prefs: NexusAppearancePrefs;
}

export const DEFAULT_BRAND_COLOR = '#339cff';

export const BASE_TONE_OPTIONS = [
  { value: 'stone', label: 'Stone', color: '#78716c' },
  { value: 'neutral', label: 'Neutral', color: '#737373' },
  { value: 'zinc', label: 'Zinc', color: '#71717a' },
  { value: 'slate', label: 'Slate', color: '#64748b' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
] as const satisfies readonly {
  value: NexusSurfaceTone;
  label: string;
  color: string;
}[];

export const BASE_TONE_SEEDS: Record<
  NexusSurfaceTone,
  { light: ModeSeeds; dark: ModeSeeds }
> = {
  stone: {
    light: { background: '#fafaf9', foreground: '#1c1917' },
    dark: { background: '#1c1917', foreground: '#fafaf9' },
  },
  neutral: {
    light: { background: '#fafafa', foreground: '#171717' },
    dark: { background: '#171717', foreground: '#fafafa' },
  },
  zinc: {
    light: { background: '#fafafa', foreground: '#18181b' },
    dark: { background: '#18181b', foreground: '#fafafa' },
  },
  slate: {
    light: { background: '#f8fafc', foreground: '#0f172a' },
    dark: { background: '#0f172a', foreground: '#f8fafc' },
  },
  gray: {
    light: { background: '#f9fafb', foreground: '#111827' },
    dark: { background: '#111827', foreground: '#f9fafb' },
  },
};

export const DENSITY_OPTIONS = [
  { value: 'nova', label: 'Compact' },
  { value: 'mira', label: 'Default' },
  { value: 'luma', label: 'Comfortable' },
  { value: 'sera', label: 'Spacious' },
] as const satisfies readonly { value: NexusDensity; label: string }[];

export const CORNER_OPTIONS = [
  { value: 'sharp', label: 'Square' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'mellow', label: 'Round' },
] as const satisfies readonly { value: NexusCorners; label: string }[];

export const ELEVATION_OPTIONS = [
  { value: 'maia', label: 'Quiet' },
  { value: 'mira', label: 'Standard' },
  { value: 'nova', label: 'Strong' },
] as const satisfies readonly { value: NexusElevation; label: string }[];

export const STROKE_OPTIONS = [
  { value: 'maia', label: 'Fine' },
  { value: 'vega', label: 'Normal' },
  { value: 'nova', label: 'Strong' },
] as const satisfies readonly { value: NexusStroke; label: string }[];

export const DEFAULT_NEXUS_APPEARANCE: NexusAppearanceState = {
  mode: 'light',
  brandColor: DEFAULT_BRAND_COLOR,
  surfaceTone: 'stone',
  contrast: 60,
  density: 'mira',
  corners: 'sharp',
  elevation: 'maia',
  stroke: 'vega',
  prefs: {
    uiFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    codeFont: 'ui-monospace, "SF Mono", Menlo, monospace',
    uiFontSize: 14,
    codeFontSize: 12,
    reduceMotion: 'system',
    pointerCursors: false,
    fontSmoothing: true,
  },
};

const FONT_PX_MIN = 8;
const FONT_PX_MAX = 32;

const APPEARANCE_MODES = new Set<NexusAppearanceMode>([
  'light',
  'dark',
  'system',
]);
const SURFACE_TONES = new Set<NexusSurfaceTone>(
  BASE_TONE_OPTIONS.map((option) => option.value)
);
const DENSITIES = new Set<NexusDensity>(
  DENSITY_OPTIONS.map((option) => option.value)
);
const CORNERS = new Set<NexusCorners>(
  CORNER_OPTIONS.map((option) => option.value)
);
const ELEVATIONS = new Set<NexusElevation>(
  ELEVATION_OPTIONS.map((option) => option.value)
);
const STROKES = new Set<NexusStroke>(
  STROKE_OPTIONS.map((option) => option.value)
);
const REDUCE_MOTION = new Set<NexusAppearancePrefs['reduceMotion']>([
  'system',
  'on',
  'off',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const stringOr = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const boolOr = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const enumOr = <T extends string>(
  value: unknown,
  values: ReadonlySet<T>,
  fallback: T
): T =>
  typeof value === 'string' && values.has(value as T) ? (value as T) : fallback;

const clampFontSize = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.min(FONT_PX_MAX, Math.max(FONT_PX_MIN, value))
    : fallback;

export function sanitizeNexusAppearancePrefs(
  raw: unknown
): NexusAppearancePrefs {
  const o = isRecord(raw) ? raw : {};
  const d = DEFAULT_NEXUS_APPEARANCE.prefs;
  return {
    uiFont: stringOr(o.uiFont, d.uiFont),
    codeFont: stringOr(o.codeFont, d.codeFont),
    uiFontSize: clampFontSize(o.uiFontSize, d.uiFontSize),
    codeFontSize: clampFontSize(o.codeFontSize, d.codeFontSize),
    reduceMotion: enumOr(o.reduceMotion, REDUCE_MOTION, d.reduceMotion),
    pointerCursors: boolOr(o.pointerCursors, d.pointerCursors),
    fontSmoothing: boolOr(o.fontSmoothing, d.fontSmoothing),
  };
}

export function sanitizeNexusAppearance(raw: unknown): NexusAppearanceState {
  if (!isRecord(raw)) return DEFAULT_NEXUS_APPEARANCE;
  const d = DEFAULT_NEXUS_APPEARANCE;
  return {
    mode: enumOr(raw.mode, APPEARANCE_MODES, d.mode),
    brandColor:
      typeof raw.brandColor === 'string' && isColor(raw.brandColor)
        ? raw.brandColor
        : d.brandColor,
    surfaceTone: enumOr(raw.surfaceTone, SURFACE_TONES, d.surfaceTone),
    contrast:
      typeof raw.contrast === 'number' &&
      raw.contrast >= 0 &&
      raw.contrast <= 100
        ? raw.contrast
        : d.contrast,
    density: enumOr(raw.density, DENSITIES, d.density),
    corners: enumOr(raw.corners, CORNERS, d.corners),
    elevation: enumOr(raw.elevation, ELEVATIONS, d.elevation),
    stroke: enumOr(raw.stroke, STROKES, d.stroke),
    prefs: sanitizeNexusAppearancePrefs(raw.prefs),
  };
}

export function createNexusThemeContract(
  state: NexusAppearanceState
): ThemeDerivationInput {
  const tone = BASE_TONE_SEEDS[state.surfaceTone];
  return {
    surfaceTone: state.surfaceTone,
    contrast: state.contrast,
    light: { accent: state.brandColor, ...tone.light },
    dark: { accent: state.brandColor, ...tone.dark },
  };
}

export function appearancePrefsToCss(prefs: NexusAppearancePrefs): string {
  const uiPx = clampFontSize(
    prefs.uiFontSize,
    DEFAULT_NEXUS_APPEARANCE.prefs.uiFontSize
  );
  const codePx = clampFontSize(
    prefs.codeFontSize,
    DEFAULT_NEXUS_APPEARANCE.prefs.codeFontSize
  );
  const blocks: string[] = [
    `:root {
  --nx-typography-family-font-sans: ${prefs.uiFont};
  --nx-typography-family-font-mono: ${prefs.codeFont};
  font-size: ${uiPx}px;
}`,
    `code, pre, .nx\\:font-mono { font-size: ${codePx}px; }`,
    `html { -webkit-font-smoothing: ${prefs.fontSmoothing ? 'antialiased' : 'auto'}; }`,
  ];
  if (prefs.pointerCursors) {
    blocks.push(
      `button:not(:disabled), [role="button"], [role="tab"], [role="radio"], a[href], summary { cursor: pointer; }`
    );
  }
  if (prefs.reduceMotion === 'on') {
    blocks.push(
      `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`
    );
  }
  return blocks.join('\n');
}
