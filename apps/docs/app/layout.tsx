import type { Metadata } from 'next';

import { ThemeBootstrap } from './_components/ThemeBootstrap';
import { ThemePicker } from './_components/ThemePicker';
import { TopNav } from './_components/TopNav';

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
    <html lang="en" data-style="vega" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="nx:bg-background nx:text-foreground nx:min-h-svh">
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
            <nav className="nx:flex nx:items-center nx:gap-5 nx:text-sm nx:text-muted-foreground">
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
      </body>
    </html>
  );
}
