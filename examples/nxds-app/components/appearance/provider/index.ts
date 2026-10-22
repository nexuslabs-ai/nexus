'use client';

// Client runtime Appearance surface. Server-safe script helpers are exported from ./server.
export type { CreateNxdsAppearanceOptions } from './factory';
export { createNxdsAppearance } from './factory';
export type {
  NxdsAppearanceContextValue,
  NxdsAppearanceCookieOptions,
  NxdsAppearanceCookieSameSite,
  NxdsAppearanceProviderProps,
  NxdsResolvedAppearanceMode,
} from './provider';
export {
  NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS,
  NxdsAppearanceProvider,
  useNxdsAppearance,
} from './provider';
