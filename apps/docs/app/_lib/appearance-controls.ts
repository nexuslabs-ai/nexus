import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NEXUS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NexusAppearanceState,
  STROKE_OPTIONS,
} from '@nexus_ds/core';

export const DOCS_APPEARANCE_STORAGE_KEY = 'nexus-docs-appearance';

export const DOCS_APPEARANCE_DEFAULT_STATE = {
  ...DEFAULT_NEXUS_APPEARANCE,
  mode: 'system',
  surfaceTone: 'stone',
  density: 'default',
  elevation: 'quiet',
  corners: 'square',
  stroke: 'normal',
} satisfies NexusAppearanceState;

export const THEME_MODE_KEYS = [
  'mode',
  'base',
  'spacing',
  'shadow',
  'radius',
  'borderwidth',
] as const;

export type ThemeMode = (typeof THEME_MODE_KEYS)[number];

const MODE_TO_FIELD = {
  mode: 'mode',
  base: 'surfaceTone',
  spacing: 'density',
  shadow: 'elevation',
  radius: 'corners',
  borderwidth: 'stroke',
} as const satisfies Record<ThemeMode, keyof NexusAppearanceState>;

type ThemeModeValueMap = {
  [K in ThemeMode]: NexusAppearanceState[(typeof MODE_TO_FIELD)[K]];
};

export type ThemeModeOption<K extends ThemeMode = ThemeMode> = {
  value: ThemeModeValueMap[K];
  label: string;
};

const MODE_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const satisfies readonly ThemeModeOption<'mode'>[];

function copyOptions<T extends string>(
  options: readonly { value: T; label: string }[]
) {
  return options.map(({ value, label }) => ({ value, label }));
}

export const THEME_MODE_OPTIONS = {
  mode: MODE_OPTIONS,
  base: copyOptions(BASE_TONE_OPTIONS),
  spacing: copyOptions(DENSITY_OPTIONS),
  shadow: copyOptions(ELEVATION_OPTIONS),
  radius: copyOptions(CORNER_OPTIONS),
  borderwidth: copyOptions(STROKE_OPTIONS),
} as const satisfies {
  [K in ThemeMode]: readonly ThemeModeOption<K>[];
};

const THEME_MODE_VALUE_SETS = {
  mode: new Set(THEME_MODE_OPTIONS.mode.map((option) => option.value)),
  base: new Set(THEME_MODE_OPTIONS.base.map((option) => option.value)),
  spacing: new Set(THEME_MODE_OPTIONS.spacing.map((option) => option.value)),
  shadow: new Set(THEME_MODE_OPTIONS.shadow.map((option) => option.value)),
  radius: new Set(THEME_MODE_OPTIONS.radius.map((option) => option.value)),
  borderwidth: new Set(
    THEME_MODE_OPTIONS.borderwidth.map((option) => option.value)
  ),
};

export function getThemeModeOptions(
  mode: ThemeMode
): readonly ThemeModeOption[] {
  return THEME_MODE_OPTIONS[mode] as readonly ThemeModeOption[];
}

export function getThemeModeValue<K extends ThemeMode>(
  state: NexusAppearanceState,
  mode: K
): ThemeModeValueMap[K] {
  return state[MODE_TO_FIELD[mode]] as unknown as ThemeModeValueMap[K];
}

export function sanitizeMode<K extends ThemeMode>(
  mode: K,
  value: unknown
): ThemeModeValueMap[K] {
  return typeof value === 'string' &&
    (THEME_MODE_VALUE_SETS[mode] as ReadonlySet<string>).has(value)
    ? (value as ThemeModeValueMap[K])
    : getThemeModeValue(DOCS_APPEARANCE_DEFAULT_STATE, mode);
}

export function updateThemeMode<K extends ThemeMode>(
  state: NexusAppearanceState,
  mode: K,
  value: unknown
): NexusAppearanceState {
  const next = { ...state, [MODE_TO_FIELD[mode]]: sanitizeMode(mode, value) };
  return next as NexusAppearanceState;
}
