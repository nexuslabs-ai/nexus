'use client';

// Client runtime Appearance surface. Server-safe script helpers are exported from ./server.
export type { CreateNexusAppearanceOptions } from './factory';
export { createNexusAppearance } from './factory';
export type {
  NexusAppearanceContextValue,
  NexusAppearanceCookieOptions,
  NexusAppearanceCookieSameSite,
  NexusAppearanceProviderProps,
  NexusResolvedAppearanceMode,
} from './provider';
export {
  NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS,
  NexusAppearanceProvider,
  useNexusAppearance,
} from './provider';
