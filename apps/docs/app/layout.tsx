import { NexusAppearanceProvider } from '@nexus_ds/react/appearance';
import { NexusAppearanceScript } from '@nexus_ds/react/appearance/server';
import type { Metadata } from 'next';

import { Footer } from './_components/Footer';
import { ThemePicker } from './_components/ThemePicker';
import { TopNav } from './_components/TopNav';
import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './_lib/appearance-controls';

import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus Design System — Docs',
  description: 'AI-native multi-brand design system for humans and agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="nx:scroll-pt-(--docs-scroll-offset)"
      data-density={DOCS_APPEARANCE_DEFAULT_STATE.density}
      data-radius={DOCS_APPEARANCE_DEFAULT_STATE.corners}
      data-shadow={DOCS_APPEARANCE_DEFAULT_STATE.elevation}
      data-borderwidth={DOCS_APPEARANCE_DEFAULT_STATE.stroke}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <NexusAppearanceScript
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        />
      </head>
      <body className="nx:bg-background nx:text-foreground nx:min-h-svh">
        <NexusAppearanceProvider
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        >
          <TopNav />
          <main>{children}</main>
          <ThemePicker />
          <Footer />
        </NexusAppearanceProvider>
      </body>
    </html>
  );
}
