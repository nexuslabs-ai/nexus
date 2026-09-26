'use client';

import { cn } from '@nexus_ds/react/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const VIEWS = [
  { href: '/token', label: 'Tokens' },
  { href: '/token/surfaces', label: 'Surfaces' },
];

const LINK_BASE =
  'nx:inline-flex nx:items-center nx:rounded-sm nx:border-default nx:px-3 nx:py-1.5 nx:typography-label-default nx:transition-control nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';

/** Switches between the token routes; each view is its own page. */
export function TokenViewNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Token views"
      className="nx:inline-flex nx:items-center nx:gap-1 nx:mb-6 nx:rounded-md nx:bg-control-background nx:p-1"
    >
      {VIEWS.map((view) => {
        const current = pathname === view.href;
        return (
          <Link
            key={view.href}
            href={view.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              LINK_BASE,
              current
                ? 'nx:border-border-default nx:bg-background nx:text-foreground'
                : 'nx:border-transparent nx:text-muted-foreground nx:hover:bg-control-background-hover'
            )}
          >
            {view.label}
          </Link>
        );
      })}
    </nav>
  );
}
