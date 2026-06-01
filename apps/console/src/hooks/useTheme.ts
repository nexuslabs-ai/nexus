import { useEffect, useState } from 'react';

export const BASES = [
  { value: 'slate', label: 'Slate', color: '#64748b' },
  { value: 'neutral', label: 'Neutral', color: '#737373' },
  { value: 'zinc', label: 'Zinc', color: '#71717a' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
  { value: 'stone', label: 'Stone', color: '#78716c' },
] as const;

export const BRANDS = [
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
  { value: 'neutral', label: 'Neutral', color: '#737373' },
  { value: 'slate', label: 'Slate', color: '#64748b' },
  { value: 'stone', label: 'Stone', color: '#78716c' },
] as const;

export const TOKEN_MODES = ['vega', 'lyra', 'maia', 'mira', 'nova'] as const;

// Spacing grew to 7 modes in #119 (luma + sera authored in #118). Mode swap is
// via the `data-style` attribute on <html>, not a CSS file load.
export const SPACING_MODES = [
  'vega',
  'lyra',
  'maia',
  'mira',
  'nova',
  'luma',
  'sera',
] as const;

// Typography dropped its byte-duplicate lyra/mira modes (PR #157); their theme
// CSS no longer exists, so only the 3 real modes are listed.
export const TYPOGRAPHY_MODES = ['nova', 'vega', 'maia'] as const;
export const RADIUS_MODES = [
  'blunt',
  'sharp',
  'subtle',
  'smooth',
  'mellow',
] as const;

export type Base = (typeof BASES)[number]['value'];
export type Brand = (typeof BRANDS)[number]['value'];
export type TokenMode = (typeof TOKEN_MODES)[number];
export type SpacingMode = (typeof SPACING_MODES)[number];
export type TypographyMode = (typeof TYPOGRAPHY_MODES)[number];
export type RadiusMode = (typeof RADIUS_MODES)[number];

export type ThemeConfig = {
  base: Base;
  brand: Brand;
  dark: boolean;
  spacing: SpacingMode;
  typography: TypographyMode;
  shadow: TokenMode;
  radius: RadiusMode;
  borderWidth: TokenMode;
};

/**
 * Load a CSS file dynamically
 */
function loadCSS(href: string, id: string): void {
  // Remove existing stylesheet with same id
  const existing = document.querySelector(`link[data-theme="${id}"]`);
  if (existing) {
    existing.remove();
  }

  // Add new stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.theme = id;
  document.head.appendChild(link);
}

/**
 * Hook to manage theme state and CSS loading
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>({
    base: 'slate',
    brand: 'blue',
    dark: false,
    spacing: 'vega',
    typography: 'vega',
    shadow: 'vega',
    radius: 'subtle',
    borderWidth: 'vega',
  });

  useEffect(() => {
    loadCSS(`/themes/base-${theme.base}.css`, 'base');
  }, [theme.base]);

  useEffect(() => {
    loadCSS(`/themes/brands-${theme.brand}.css`, 'brand');
  }, [theme.brand]);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', theme.spacing);
  }, [theme.spacing]);

  useEffect(() => {
    loadCSS(`/themes/typography-${theme.typography}.css`, 'typography');
  }, [theme.typography]);

  useEffect(() => {
    loadCSS(`/themes/shadow-${theme.shadow}.css`, 'shadow');
  }, [theme.shadow]);

  useEffect(() => {
    loadCSS(`/themes/radius-${theme.radius}.css`, 'radius');
  }, [theme.radius]);

  useEffect(() => {
    loadCSS(`/themes/borderwidth-${theme.borderWidth}.css`, 'borderwidth');
  }, [theme.borderWidth]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.dark);
  }, [theme.dark]);

  return { theme, setTheme };
}
