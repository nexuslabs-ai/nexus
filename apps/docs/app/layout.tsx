import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import { NxdsAppearanceScript } from '@nxds/react/appearance/server';
import type { Metadata } from 'next';

import { CopyAnnouncerProvider } from './_components/CopyAnnouncer';
import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './_lib/appearance-controls';
import {
  FRAMEWORK_BOOTSTRAP_SCRIPT,
  FRAMEWORK_PANEL_CSS,
} from './_lib/frameworks';
import {
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_NAME,
  SITE_OPEN_GRAPH,
  SITE_TITLE,
  SITE_URL,
} from './_lib/site';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { ...SITE_OPEN_GRAPH, images: SITE_IMAGE },
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
        <NxdsAppearanceScript
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        />
        <script
          data-docs-framework-script=""
          dangerouslySetInnerHTML={{ __html: FRAMEWORK_BOOTSTRAP_SCRIPT }}
        />
        <style
          data-docs-framework-style=""
          dangerouslySetInnerHTML={{ __html: FRAMEWORK_PANEL_CSS }}
        />
      </head>
      <body className="nx:min-h-svh nx:bg-background nx:text-foreground nx:typography-body-default">
        <NxdsAppearanceProvider
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        >
          <CopyAnnouncerProvider>{children}</CopyAnnouncerProvider>
        </NxdsAppearanceProvider>
      </body>
    </html>
  );
}
