import { DEFAULT_NEXUS_APPEARANCE } from '@nxds/core';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { NexusAppearanceProvider } from '@/components/appearance/provider';
import { NexusAppearanceScript } from '@/components/appearance/provider/server';

import { AppShell } from './shell';

import './globals.css';

const APPEARANCE_STORAGE_KEY = 'acme-appearance';

export const metadata: Metadata = {
  title: 'Nexus app',
  description: 'A new Next.js app built entirely on copied Nexus components',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <NexusAppearanceScript storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NEXUS_APPEARANCE} />
      </head>
      <body className="nx:bg-background nx:text-foreground nx:typography-body-default">
        <NexusAppearanceProvider storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NEXUS_APPEARANCE}>
          <AppShell>{children}</AppShell>
        </NexusAppearanceProvider>
      </body>
    </html>
  );
}
