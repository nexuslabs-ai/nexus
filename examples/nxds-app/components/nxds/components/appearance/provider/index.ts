'use client';

// Client runtime Appearance surface. Server-safe script helpers are exported from ./server.
export type { CreateNxdsAppearanceOptions } from './factory';
export { createNxdsAppearance } from './factory';
export type {
  NxdsAppearanceContextValue,
  NxdsAppearanceProviderProps,
} from './provider';
export { NxdsAppearanceProvider, useNxdsAppearance } from './provider';
