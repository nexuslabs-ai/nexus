'use client';

import { useEffect, useRef, useState } from 'react';

import { useNexusAppearance } from '@nexus_ds/react/appearance';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SECTIONS } from '../_lib/sections';

import { Button } from './nexus';
import { SearchPalette } from './SearchPalette';

const NAV_LINKS = [
  { href: '/', label: 'Home', match: '/' },
  ...Object.values(SECTIONS).map((section) => ({
    href: section.href,
    label: section.title,
    match: section.href,
  })),
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
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedMode, setState } = useNexusAppearance();
  const isDark = resolvedMode === 'dark';
  const currentLink = NAV_LINKS.find((link) => isActive(pathname, link.match));

  // Tabbing off the last row leaves the panel open over the page otherwise.
  // relatedTarget is null when focus goes nowhere, not when it leaves the nav.
  const closeOnFocusLeave = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.relatedTarget) return;
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      triggerRef.current?.focus();
      setMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

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
      <nav
        ref={menuRef}
        aria-label="Sections"
        onBlur={closeOnFocusLeave}
        className="nx:relative nx:flex-1 nx:xl:hidden"
      >
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="nx:relative nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-2"
        >
          <span aria-hidden="true">☰</span>
          {currentLink?.label ?? 'Sections'}
        </Button>
        {menuOpen && (
          <ul className="nx:absolute nx:top-full nx:left-0 nx:mt-1 nx:z-popover nx:min-w-48 nx:max-h-[70svh] nx:overflow-y-auto nx:list-none nx:m-0 nx:flex nx:flex-col nx:gap-0.5 nx:p-1 nx:rounded-md nx:border nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:shadow-lg">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.match);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'true' : undefined}
                    className={
                      active
                        ? `${NAV_LINK_BASE} nx:block nx:border-l-2 nx:border-focus-default nx:font-semibold nx:bg-primary-subtle nx:text-primary-subtle-foreground`
                        : `${NAV_LINK_BASE} nx:block nx:border-l-2 nx:border-transparent nx:hover:bg-popover-hover`
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
      <nav
        ref={navRef}
        aria-label="Sections"
        className="nx:hidden nx:xl:flex nx:gap-0.5 nx:flex-1 nx:min-w-0 nx:overflow-x-auto nx:py-1.5"
      >
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.match);
          return (
            <Link
              key={link.href}
              href={link.href}
              data-active={active}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? `${NAV_LINK_BASE} nx:bg-nav-item-active nx:text-primary-subtle-foreground`
                  : `${NAV_LINK_BASE} nx:text-nav-muted-foreground nx:hover:text-nav-foreground nx:hover:bg-nav-item-hover`
              }
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
        className="nx:relative nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-2"
      >
        {isDark ? '☀' : '◐'}
      </Button>
    </header>
  );
}
