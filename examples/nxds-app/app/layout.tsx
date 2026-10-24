import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { NxdsAppearanceProvider } from '@/components/nxds/components/appearance/provider';
import { NxdsAppearanceScript } from '@/components/nxds/components/appearance/provider/server';

import { AppShell } from './shell';

import './globals.css';

const APPEARANCE_STORAGE_KEY = 'acme-appearance';

export const metadata: Metadata = {
  title: 'nxds app',
  description: 'A new Next.js app built entirely on copied nxds components',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <NxdsAppearanceScript storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NXDS_APPEARANCE} />
      </head>
      <body className="nx:bg-background nx:text-foreground nx:typography-body-default">
        <NxdsAppearanceProvider storageKey={APPEARANCE_STORAGE_KEY} defaultState={DEFAULT_NXDS_APPEARANCE}>
          <AppShell>{children}</AppShell>
        </NxdsAppearanceProvider>
      </body>
    </html>
  );
}
