'use client';

import { useEffect, useRef } from 'react';

import { useNexusAppearance } from '@nexus_ds/react/appearance';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './nexus';
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

const NAV_LINK_BASE =
  'nx:px-3 nx:py-1 nx:shrink-0 nx:typography-label-default nx:rounded-sm nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)';

function isActive(pathname: string, match: string) {
  if (match === '/') return pathname === '/';
  return pathname === match || pathname.startsWith(match + '/');
}

export function TopNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const { resolvedMode, setState } = useNexusAppearance();
  const isDark = resolvedMode === 'dark';
  const currentSection = SECTIONS.find((s) => isActive(pathname, s.match));

  // Centre the current section in the horizontally scrolling link strip.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[data-active="true"]');
    if (!nav || !active) return;

    const navBox = nav.getBoundingClientRect();
    const linkBox = active.getBoundingClientRect();
    nav.scrollLeft +=
      linkBox.left - navBox.left - (navBox.width - linkBox.width) / 2;
  }, [pathname]);

  const toggleMode = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setState((current) => ({ ...current, mode: nextMode }));
  };

  return (
    <header className="nx:sticky nx:top-0 nx:z-30 nx:flex nx:items-center nx:gap-6 nx:px-6 nx:h-(--docs-header-h) nx:bg-nav-background nx:text-nav-foreground nx:border-b nx:border-nav-border">
      <div className="nx:flex nx:items-center nx:gap-2 nx:font-semibold nx:typography-label-default">
        Nexus DS
        <span className="nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-nav-muted-foreground nx:px-1.5 nx:py-0.5 nx:border nx:border-dashed nx:border-nav-border nx:rounded-sm">
          docs
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="nx:lg:hidden"
            aria-label="Browse sections"
          >
            ☰ {currentSection?.label ?? 'Sections'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {SECTIONS.map((s) => (
            <DropdownMenuItem key={s.href} asChild>
              <Link
                href={s.href}
                aria-current={isActive(pathname, s.match) ? 'true' : undefined}
              >
                {s.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <nav
        ref={navRef}
        aria-label="Sections"
        className="nx:hidden nx:lg:flex nx:gap-0.5 nx:flex-1 nx:min-w-0 nx:overflow-x-auto nx:py-1.5"
      >
        {SECTIONS.map((s) => {
          const active = isActive(pathname, s.match);
          return (
            <Link
              key={s.href}
              href={s.href}
              data-active={active}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? `${NAV_LINK_BASE} nx:bg-nav-item-active nx:text-primary-subtle-foreground`
                  : `${NAV_LINK_BASE} nx:text-nav-muted-foreground nx:hover:text-nav-foreground nx:hover:bg-nav-item-hover`
              }
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
      <div className="nx:flex-1 nx:lg:hidden" />
      <SearchPalette />
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMode}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? '☀' : '◐'}
      </Button>
    </header>
  );
}
