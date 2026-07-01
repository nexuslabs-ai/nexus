import {
  DEFAULT_NEXUS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  type NexusAppearanceState,
} from '@nexus_ds/core';

export const CONSOLE_STORAGE_KEY = DEFAULT_STORAGE_KEY;

export const CONSOLE_APPEARANCE_DEFAULT: NexusAppearanceState = {
  ...DEFAULT_NEXUS_APPEARANCE,
  brandColor: '#0a0a0a',
};
