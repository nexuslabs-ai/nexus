import { NexusAppearanceProvider } from '@nexus_ds/react/appearance';
import { NexusAppearanceScript } from '@nexus_ds/react/appearance/server';
import type { Metadata } from 'next';

import { ThemePicker } from './_components/ThemePicker';
import { TopNav } from './_components/TopNav';
import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from './_lib/appearance-controls';

import './globals.css';

const FOOTER_LINKS = [
  { label: 'Figma', href: '#' },
  { label: 'Storybook', href: '#' },
  { label: 'GitHub', href: 'https://github.com/nexuslabs-ai/nexus' },
];

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
          <footer className="nx:border-t nx:border-border-default nx:mt-16">
            <div className="nx:max-w-[1280px] nx:mx-auto nx:px-6 nx:py-8 nx:flex nx:flex-col nx:gap-4 nx:sm:flex-row nx:sm:items-center nx:sm:justify-between">
              <div className="nx:flex nx:items-center nx:gap-3">
                <span className="nx:font-semibold">Nexus</span>
                <span className="nx:font-mono nx:text-[11px] nx:text-muted-foreground-subtle">
                  MIT · v0.0.1
                </span>
              </div>
              <nav className="nx:flex nx:items-center nx:gap-5 nx:typography-label-default nx:text-muted-foreground">
                {FOOTER_LINKS.map((link) => {
                  const isExternal = link.href.startsWith('http');
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noreferrer' : undefined}
                      className="nx:rounded-sm nx:hover:text-foreground nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2"
                    >
                      {link.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </footer>
        </NexusAppearanceProvider>
      </body>
    </html>
  );
}
