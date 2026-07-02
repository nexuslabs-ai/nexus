// Order matters: the app's own Tailwind first, then the design system's
// precompiled (nx:-prefixed) utilities. Imported via JS so the bundler resolves
// @acme/react's package `exports` map (postcss @import would not).
import './globals.css';
// Design system, as two independent Tailwind compilations so the nx: prefix
// never collides with the app's own Tailwind above:
import './nexus.css'; // nx: theme — lets the app author nx: utilities itself
import '@acme/react/styles.css'; // precompiled component styles

import { NexusAppearanceScript } from '@acme/react/appearance/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from './providers';
import { AppShell } from './shell';

export const metadata: Metadata = {
  title: 'nextjs-consumer',
  description: 'Consuming the @acme design system in a stock Next.js + Tailwind 4 app',
};

// Must match the provider's storageKey so the first-paint script and the client
// provider read the same persisted appearance.
const APPEARANCE_STORAGE_KEY = 'acme-appearance';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the first-paint script sets appearance attributes
    // on <html> before React hydrates, which is an intentional server/client diff.
    <html lang="en" suppressHydrationWarning>
      <head>
        <NexusAppearanceScript storageKey={APPEARANCE_STORAGE_KEY} />
      </head>
      <body>
        <Providers storageKey={APPEARANCE_STORAGE_KEY}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
