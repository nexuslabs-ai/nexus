export const DOCS_THEME_STORAGE_KEY = 'nexus-docs-tokens';
export const DOCS_DARK_MODE_STORAGE_KEY = 'nexus-docs-theme';

export const THEME_MODE_KEYS = [
  'base',
  'brand',
  'spacing',
  'shadow',
  'radius',
  'borderwidth',
] as const;

export type ThemeMode = (typeof THEME_MODE_KEYS)[number];
export type ThemeStylesheetMode = Exclude<ThemeMode, 'spacing'>;
export type StoredColorScheme = 'light' | 'dark';

export const THEME_STYLESHEET_MODE_KEYS = [
  'base',
  'brand',
  'shadow',
  'radius',
  'borderwidth',
] as const satisfies readonly ThemeStylesheetMode[];

export const THEME_MODE_VALUES = {
  base: ['slate', 'stone', 'neutral', 'gray', 'zinc'],
  brand: ['blue', 'purple', 'pink', 'teal', 'orange', 'black'],
  spacing: [
    'regular',
    'tight',
    'relaxed',
    'default',
    'compact',
    'comfortable',
    'spacious',
  ],
  shadow: ['vega', 'lyra', 'maia', 'mira', 'nova'],
  radius: ['sharp', 'subtle', 'smooth', 'mellow', 'blunt'],
  borderwidth: ['vega', 'lyra', 'maia', 'mira', 'nova'],
} as const;

type ThemeModeValues = typeof THEME_MODE_VALUES;

export type ThemeState = {
  [K in ThemeMode]: ThemeModeValues[K][number];
};

export type ThemeModeOption<K extends ThemeMode = ThemeMode> = {
  value: ThemeState[K];
  label: string;
};

export const DEFAULT_THEME_STATE = {
  base: 'stone',
  brand: 'black',
  spacing: 'default',
  shadow: 'maia',
  radius: 'sharp',
  borderwidth: 'vega',
} as const satisfies ThemeState;

export const THEME_MODE_OPTIONS = {
  base: [
    { value: 'slate', label: 'Slate' },
    { value: 'stone', label: 'Stone' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'gray', label: 'Gray' },
    { value: 'zinc', label: 'Zinc' },
  ],
  brand: [
    { value: 'blue', label: 'Blue' },
    { value: 'purple', label: 'Purple' },
    { value: 'pink', label: 'Pink' },
    { value: 'teal', label: 'Teal' },
    { value: 'orange', label: 'Orange' },
    { value: 'black', label: 'Black' },
  ],
  spacing: [
    { value: 'regular', label: 'Regular' },
    { value: 'tight', label: 'Tight' },
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'default', label: 'Default' },
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ],
  shadow: [
    { value: 'vega', label: 'Vega' },
    { value: 'lyra', label: 'Lyra' },
    { value: 'maia', label: 'Maia' },
    { value: 'mira', label: 'Mira' },
    { value: 'nova', label: 'Nova' },
  ],
  radius: [
    { value: 'sharp', label: 'Sharp' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'smooth', label: 'Smooth' },
    { value: 'mellow', label: 'Mellow' },
    { value: 'blunt', label: 'Blunt' },
  ],
  borderwidth: [
    { value: 'vega', label: 'Vega' },
    { value: 'lyra', label: 'Lyra (≈ Vega)' },
    { value: 'maia', label: 'Maia' },
    { value: 'mira', label: 'Mira (≈ Vega)' },
    { value: 'nova', label: 'Nova' },
  ],
} as const satisfies {
  [K in ThemeMode]: readonly ThemeModeOption<K>[];
};

export const THEME_STYLESHEET_HREFS = {
  base: {
    slate: '/themes/base-slate.css',
    stone: '/themes/base-stone.css',
    neutral: '/themes/base-neutral.css',
    gray: '/themes/base-gray.css',
    zinc: '/themes/base-zinc.css',
  },
  brand: {
    blue: '/themes/brands-blue.css',
    purple: '/themes/brands-purple.css',
    pink: '/themes/brands-pink.css',
    teal: '/themes/brands-teal.css',
    orange: '/themes/brands-orange.css',
    black: '/themes/brands-black.css',
  },
  shadow: {
    vega: '/themes/shadow-vega.css',
    lyra: '/themes/shadow-lyra.css',
    maia: '/themes/shadow-maia.css',
    mira: '/themes/shadow-mira.css',
    nova: '/themes/shadow-nova.css',
  },
  radius: {
    sharp: '/themes/radius-sharp.css',
    subtle: '/themes/radius-subtle.css',
    smooth: '/themes/radius-smooth.css',
    mellow: '/themes/radius-mellow.css',
    blunt: '/themes/radius-blunt.css',
  },
  borderwidth: {
    vega: '/themes/borderwidth-vega.css',
    lyra: '/themes/borderwidth-lyra.css',
    maia: '/themes/borderwidth-maia.css',
    mira: '/themes/borderwidth-mira.css',
    nova: '/themes/borderwidth-nova.css',
  },
} as const satisfies {
  [K in ThemeStylesheetMode]: Record<ThemeState[K], `/themes/${string}.css`>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getThemeModeOptions(
  mode: ThemeMode
): readonly ThemeModeOption[] {
  return THEME_MODE_OPTIONS[mode];
}

export function sanitizeMode<K extends ThemeMode>(
  mode: K,
  value: unknown
): ThemeState[K] {
  return typeof value === 'string' &&
    (THEME_MODE_VALUES[mode] as readonly string[]).includes(value)
    ? (value as ThemeState[K])
    : DEFAULT_THEME_STATE[mode];
}

export function sanitizeThemeState(raw: unknown): ThemeState {
  const state = isRecord(raw) ? raw : {};

  return {
    base: sanitizeMode('base', state.base),
    brand: sanitizeMode('brand', state.brand),
    spacing: sanitizeMode('spacing', state.spacing),
    shadow: sanitizeMode('shadow', state.shadow),
    radius: sanitizeMode('radius', state.radius),
    borderwidth: sanitizeMode('borderwidth', state.borderwidth),
  };
}

export function getThemeStylesheetHref(
  mode: ThemeStylesheetMode,
  value: unknown
): `/themes/${string}.css` {
  switch (mode) {
    case 'base':
      return THEME_STYLESHEET_HREFS.base[sanitizeMode('base', value)];
    case 'brand':
      return THEME_STYLESHEET_HREFS.brand[sanitizeMode('brand', value)];
    case 'shadow':
      return THEME_STYLESHEET_HREFS.shadow[sanitizeMode('shadow', value)];
    case 'radius':
      return THEME_STYLESHEET_HREFS.radius[sanitizeMode('radius', value)];
    case 'borderwidth':
      return THEME_STYLESHEET_HREFS.borderwidth[
        sanitizeMode('borderwidth', value)
      ];
  }
}

export function sanitizeStoredColorScheme(
  value: unknown
): StoredColorScheme | null {
  return value === 'light' || value === 'dark' ? value : null;
}
