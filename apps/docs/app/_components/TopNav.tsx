'use client';

import { useNxdsAppearance } from '@nxds/react/appearance';
import { cn } from '@nxds/react/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isActive, NAV_LINKS } from '../_lib/nav-links';
import { SITE_NAME } from '../_lib/site';

import { MobileNav } from './MobileNav';
import { Button } from './nxds';
import { SearchPalette } from './SearchPalette';

const NAV_LINK_BASE =
  'nx:px-3 nx:py-1 nx:shrink-0 nx:typography-label-default nx:rounded-sm nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';

function centerInStrip(link: HTMLAnchorElement | null) {
  const strip = link?.parentElement;
  if (!strip) return;
  const linkRect = link.getBoundingClientRect();
  const stripRect = strip.getBoundingClientRect();
  strip.scrollLeft +=
    linkRect.left - stripRect.left - (stripRect.width - linkRect.width) / 2;
}

export function TopNav() {
  const pathname = usePathname();
  const { resolvedMode, setState } = useNxdsAppearance();
  const isDark = resolvedMode === 'dark';

  const toggleMode = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setState((current) => ({ ...current, mode: nextMode }));
  };

  return (
    <header className="nx:sticky nx:top-0 nx:z-30 nx:flex nx:items-center nx:gap-6 nx:px-6 nx:h-(--docs-header-h) nx:bg-nav-background nx:text-nav-foreground nx:border-b nx:border-nav-border">
      <Link
        href="/"
        className="nx:flex nx:items-center nx:gap-2 nx:font-semibold nx:typography-label-default nx:no-underline nx:text-inherit nx:rounded-sm nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
      >
        {SITE_NAME}
        <span className="nx:text-[10px] nx:uppercase nx:tracking-wider nx:text-nav-muted-foreground nx:px-1.5 nx:py-0.5 nx:border nx:border-dashed nx:border-nav-border nx:rounded-sm">
          docs
        </span>
      </Link>
      <div className="nx:flex-1 nx:lg:hidden">
        <MobileNav />
      </div>
      <nav
        aria-label="Sections"
        className="nx:hidden nx:lg:flex nx:gap-0.5 nx:flex-1 nx:min-w-0 nx:overflow-x-auto nx:py-1.5"
      >
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              ref={active ? centerInStrip : undefined}
              aria-current={active ? 'true' : undefined}
              className={cn(
                NAV_LINK_BASE,
                active
                  ? 'nx:bg-nav-item-active nx:text-primary-subtle-foreground'
                  : 'nx:text-nav-muted-foreground nx:hover:text-nav-foreground nx:hover:bg-nav-item-hover'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
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
