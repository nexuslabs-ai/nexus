'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { PAGE_MANIFEST } from '../_lib/page-manifest.generated';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './nexus';

/**
 * ⌘K command-palette search over the docs IA. Indexes every page in the
 * generated manifest (the same source the nav + routes read), so it stays in
 * sync as pages are added. Built on the Nexus Command (cmdk) surface.
 */

const INDEX = PAGE_MANIFEST.map((section) => ({
  title: section.title,
  items: section.pages.map((page) => ({
    label: page.label,
    href: page.route,
  })),
}));

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="nx:hidden nx:lg:flex nx:items-center nx:gap-2 nx:px-3 nx:py-1 nx:typography-label-small nx:text-nav-muted-foreground nx:border nx:border-nav-border nx:rounded-sm nx:transition-colors nx:hover:bg-nav-item-hover nx:hover:text-nav-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2"
      >
        Search
        <kbd className="nx:font-mono nx:text-[10px] nx:rounded-sm nx:border nx:border-nav-border nx:px-1 nx:py-0.5">
          ⌘K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search the docs"
        description="Jump to any page by name"
      >
        <CommandInput placeholder="Search the docs…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {INDEX.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${group.title} ${item.label}`}
                  onSelect={() => navigate(item.href)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
