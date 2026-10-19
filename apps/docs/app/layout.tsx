import { NexusAppearanceProvider } from '@nexus_ds/react/appearance';
import { NexusAppearanceScript } from '@nexus_ds/react/appearance/server';
import type { Metadata } from 'next';

import { CopyAnnouncerProvider } from './_components/CopyAnnouncer';
import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './_lib/appearance-controls';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from './_lib/site';

import './globals.css';

// Pages set only title, description and canonical. Next copies those into
// og:* and twitter:*, so pages must not set `openGraph` or `twitter` themselves.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="nx:scroll-pt-(--docs-scroll-offset) nx:scroll-pb-(--docs-panel-offset)"
      data-density={DOCS_APPEARANCE_DEFAULT_STATE.density}
      data-radius={DOCS_APPEARANCE_DEFAULT_STATE.corners}
      data-shadow={DOCS_APPEARANCE_DEFAULT_STATE.elevation}
      data-borderwidth={DOCS_APPEARANCE_DEFAULT_STATE.stroke}
      suppressHydrationWarning
    >
      <head>
        <NexusAppearanceScript
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        />
      </head>
      <body className="nx:min-h-svh nx:bg-background nx:text-foreground nx:typography-body-default">
        <NexusAppearanceProvider
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        >
          <CopyAnnouncerProvider>{children}</CopyAnnouncerProvider>
        </NexusAppearanceProvider>
      </body>
    </html>
  );
}
