import type { CodexThemeContract, ThemeSeeds } from '@nexus/core';

import type {
  Base,
  RadiusMode,
  SpacingMode,
  TokenMode,
} from '../hooks/useTheme';

type ModeSeeds = Pick<ThemeSeeds, 'background' | 'foreground'>;

export const DEFAULT_BRAND_COLOR = '#339cff';

export const BASE_TONE_OPTIONS = [
  { value: 'stone', label: 'Stone', color: '#78716c' },
  { value: 'neutral', label: 'Neutral', color: '#737373' },
  { value: 'zinc', label: 'Zinc', color: '#71717a' },
  { value: 'slate', label: 'Slate', color: '#64748b' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
] as const satisfies readonly { value: Base; label: string; color: string }[];

export const BASE_TONE_SEEDS: Record<
  Base,
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
] as const satisfies readonly { value: SpacingMode; label: string }[];

export const CORNER_OPTIONS = [
  { value: 'sharp', label: 'Square' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'mellow', label: 'Round' },
] as const satisfies readonly { value: RadiusMode; label: string }[];

export const ELEVATION_OPTIONS = [
  { value: 'maia', label: 'Quiet' },
  { value: 'mira', label: 'Standard' },
  { value: 'nova', label: 'Strong' },
] as const satisfies readonly { value: TokenMode; label: string }[];

export const STROKE_OPTIONS = [
  { value: 'maia', label: 'Fine' },
  { value: 'vega', label: 'Normal' },
  { value: 'nova', label: 'Strong' },
] as const satisfies readonly { value: TokenMode; label: string }[];

export function applyBrandColor(
  contract: CodexThemeContract,
  accent: string
): CodexThemeContract {
  return {
    ...contract,
    light: { ...contract.light, accent },
    dark: { ...contract.dark, accent },
  };
}

export function applyBaseTone(
  contract: CodexThemeContract,
  base: Base
): CodexThemeContract {
  const tone = BASE_TONE_SEEDS[base];
  return {
    ...contract,
    light: { ...contract.light, ...tone.light },
    dark: { ...contract.dark, ...tone.dark },
  };
}

export function toggledAppearance(
  appearance: CodexThemeContract['appearance']
): CodexThemeContract['appearance'] {
  return appearance === 'dark' ? 'light' : 'dark';
}
