'use client';

import { NexusAppearanceProvider } from '@acme/react/appearance';
import type { ReactNode } from 'react';

/**
 * Client boundary for the design system's appearance runtime. The provider
 * injects the `--nx-*` design tokens and keeps them in sync with the user's
 * choice (persisted to localStorage under `storageKey`). Pair it with the
 * server-rendered <NexusAppearanceScript> in the layout to avoid a FOUC.
 */
export function Providers({
  children,
  storageKey,
}: {
  children: ReactNode;
  storageKey: string;
}) {
  return (
    <NexusAppearanceProvider storageKey={storageKey}>
      {children}
    </NexusAppearanceProvider>
  );
}
