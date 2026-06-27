import type { NexusSurfaceTone, ThemeSeeds } from './derive-theme';

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
