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
  { value: 'purple', label: 'Purple', color: '#9333ea' },
  { value: 'pink', label: 'Pink', color: '#db2777' },
  { value: 'teal', label: 'Teal', color: '#0f766e' },
  { value: 'orange', label: 'Orange', color: '#c2410c' },
  { value: 'black', label: 'Black', color: '#0a0a0a' },
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
export type RadiusMode = (typeof RADIUS_MODES)[number];

export type ThemeConfig = {
  base: Base;
  brand: Brand;
  dark: boolean;
  spacing: SpacingMode;
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

const STORAGE_KEY = 'nexus-console-theme';

export const DEFAULT_THEME: ThemeConfig = {
  base: 'stone',
  brand: 'black',
  dark: false,
  spacing: 'mira',
  shadow: 'maia',
  radius: 'sharp',
  borderWidth: 'vega',
};

const BASE_VALUES = BASES.map((b) => b.value);
const BRAND_VALUES = BRANDS.map((b) => b.value);

/** Keep `value` only if it's a member of `allowed`; otherwise fall back. */
function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Coerce an unknown persisted payload into a valid ThemeConfig: each axis is
 * narrowed against its known set, so a stale value from a removed mode (e.g. an
 * old `typography: 'maia'`) is dropped to its default instead of being handed to
 * `loadCSS`, which would 404 on the missing theme file.
 */
function sanitizeTheme(raw: unknown): ThemeConfig {
  const p = (raw ?? {}) as Partial<Record<keyof ThemeConfig, unknown>>;
  return {
    base: pick(p.base, BASE_VALUES, DEFAULT_THEME.base),
    brand: pick(p.brand, BRAND_VALUES, DEFAULT_THEME.brand),
    dark: typeof p.dark === 'boolean' ? p.dark : DEFAULT_THEME.dark,
    spacing: pick(p.spacing, SPACING_MODES, DEFAULT_THEME.spacing),
    shadow: pick(p.shadow, TOKEN_MODES, DEFAULT_THEME.shadow),
    radius: pick(p.radius, RADIUS_MODES, DEFAULT_THEME.radius),
    borderWidth: pick(p.borderWidth, TOKEN_MODES, DEFAULT_THEME.borderWidth),
  };
}

/**
 * Read the persisted theme for the lazy useState initializer, so the first paint
 * already carries the saved theme (no flash, no localStorage→state effect).
 * Unknown or invalid axes fall back to their default via {@link sanitizeTheme}.
 */
function loadInitialTheme(): ThemeConfig {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return sanitizeTheme(JSON.parse(stored));
  } catch {
    // Ignore malformed storage — fall back to defaults.
  }
  return DEFAULT_THEME;
}

/**
 * Hook to manage theme state and CSS loading. Mounted once via ThemeProvider.
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(loadInitialTheme);

  // Persist on change — writing to localStorage is an external-system sync.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    loadCSS(`/themes/base-${theme.base}.css`, 'base');
  }, [theme.base]);

  useEffect(() => {
    loadCSS(`/themes/brands-${theme.brand}.css`, 'brand');
  }, [theme.brand]);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', theme.spacing);
  }, [theme.spacing]);

  // Typography collapsed to a single mode (vega); load it once for the
  // --nx-typography-* variable definitions that the @utility classes resolve
  // against (the console has no other static source for them).
  useEffect(() => {
    loadCSS('/themes/typography-vega.css', 'typography');
  }, []);

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
