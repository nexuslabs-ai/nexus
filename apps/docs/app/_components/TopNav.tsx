'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { toggleDarkMode, useDarkMode } from '../_hooks/use-dark-mode';

import { Button } from './nexus';
import { SearchPalette } from './SearchPalette';

const SECTIONS = [
  { href: '/', label: 'Home', match: '/' },
  {
    href: '/getting-started',
    label: 'Getting Started',
    match: '/getting-started',
  },
  { href: '/foundations', label: 'Foundations', match: '/foundations' },
  { href: '/components', label: 'Components', match: '/components' },
  { href: '/theming', label: 'Theming', match: '/theming' },
  { href: '/tools', label: 'Tools', match: '/tools' },
  { href: '/guidance', label: 'Guidance', match: '/guidance' },
  { href: '/agents', label: 'For AI agents', match: '/agents' },
  { href: '/changelog', label: 'Changelog', match: '/changelog' },
];

function isActive(pathname: string, match: string) {
  if (match === '/') return pathname === '/';
  return pathname === match || pathname.startsWith(match + '/');
}

export function TopNav() {
  const pathname = usePathname();
  const isDark = useDarkMode();

  return (
    <header className="nx:sticky nx:top-0 nx:z-30 nx:flex nx:items-center nx:gap-6 nx:px-6 nx:py-3 nx:bg-nav-background nx:text-nav-foreground nx:border-b nx:border-nav-border">
      <div className="nx:flex nx:items-center nx:gap-2 nx:font-semibold nx:typography-label-default">
        Nexus DS
        <span className="nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-nav-muted-foreground nx:px-1.5 nx:py-0.5 nx:border nx:border-dashed nx:border-nav-border nx:rounded-sm">
          docs
        </span>
      </div>
      <nav className="nx:flex nx:gap-0.5 nx:flex-1 nx:flex-wrap">
        {SECTIONS.map((s) => {
          const active = isActive(pathname, s.match);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={
                active
                  ? 'nx:px-3 nx:py-1 nx:typography-label-default nx:rounded-sm nx:bg-nav-item-active nx:text-primary-subtle-foreground'
                  : 'nx:px-3 nx:py-1 nx:typography-label-default nx:rounded-sm nx:text-nav-muted-foreground nx:hover:text-nav-foreground nx:hover:bg-nav-item-hover'
              }
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
      <SearchPalette />
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {isDark ? '☀' : '◐'}
      </Button>
    </header>
  );
}
