'use client';

// Client runtime Appearance surface. Server-safe script helpers are exported from ./server.
export type { NexusRootAttributes } from '../../../lib/nexus-root-context';
export { useNexusRootAttributes } from '../../../lib/nexus-root-context';
export type { CreateNexusAppearanceOptions } from './factory';
export { createNexusAppearance } from './factory';
export type { NexusRootProps, NexusRootState } from './nexus-root';
export { NexusRoot } from './nexus-root';
export type {
  NexusAppearanceContextValue,
  NexusAppearanceCookieOptions,
  NexusAppearanceCookieSameSite,
  NexusAppearanceProviderProps,
} from './provider';
export {
  NEXUS_APPEARANCE_COOKIE_MAX_AGE_SECONDS,
  NexusAppearanceProvider,
  useNexusAppearance,
} from './provider';
