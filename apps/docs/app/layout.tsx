import type { Metadata } from 'next';

import { ThemeBootstrap } from './_components/ThemeBootstrap';
import { ThemePicker } from './_components/ThemePicker';
import { TopNav } from './_components/TopNav';

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
    <html lang="en" data-style="vega" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="nx:bg-background nx:text-foreground nx:min-h-screen">
        <TopNav />
        <main>{children}</main>
        <ThemePicker />
        <footer className="nx:border-t nx:border-border-default nx:mt-12 nx:px-6 nx:py-6 nx:text-xs nx:text-muted-foreground-subtle nx:flex nx:justify-between nx:max-w-[1280px] nx:mx-auto">
          <span>[ Footer — repo · license · version ]</span>
          <span>[ External links — Figma · Storybook · GitHub ]</span>
        </footer>
      </body>
    </html>
  );
}
