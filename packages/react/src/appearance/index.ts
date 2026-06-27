// Public Phase-B surface only. The field components (color-field, setting-row,
// config-preview) are internal composition details and are intentionally not
// re-exported.
export { NexusAppearanceSettings } from './appearance-settings';
export type {
  NexusAppearanceContextValue,
  NexusAppearanceProviderProps,
  NexusResolvedAppearanceMode,
} from './provider';
export { NexusAppearanceProvider, useNexusAppearance } from './provider';
export type {
  CreateNexusAppearanceOptions,
  NexusAppearanceScriptProps,
} from './script';
export { createNexusAppearance, NexusAppearanceScript } from './script';
export type { NexusThemeQuickControlProps } from './theme-quick-control';
export { NexusThemeQuickControl } from './theme-quick-control';
