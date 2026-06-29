'use client';

// Client runtime Appearance surface. Product-specific editors live in consumer
// apps; server-safe script helpers are exported from ./appearance/server.
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
