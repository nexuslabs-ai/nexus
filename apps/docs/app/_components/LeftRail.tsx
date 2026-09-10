'use client';

import { cn } from '@nexus_ds/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { ManifestSection } from '../_lib/manifest';

const RAIL_LINK_BASE =
  'nx:block nx:px-2 nx:py-1 nx:typography-label-default nx:rounded-sm nx:border-l-2 nx:no-underline nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)';

export function LeftRail({ section }: { section: ManifestSection }) {
  const pathname = usePathname();
  return (
    <aside className="nx:sticky nx:top-(--docs-header-h) nx:self-start nx:max-h-[calc(100svh-var(--docs-header-h))] nx:overflow-y-auto nx:pr-2">
      <h3 className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2">
        {section.title}
      </h3>
      <ul className="nx:list-none nx:p-0 nx:m-0">
        {section.pages.map((page) => {
          const active = pathname === page.route;
          const railLabels = page.components ?? page.nested;
          return (
            <li key={page.slug}>
              <Link
                href={page.route}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  RAIL_LINK_BASE,
                  active
                    ? 'nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:border-focus-default'
                    : 'nx:text-muted-foreground nx:border-transparent nx:hover:text-foreground nx:hover:bg-container-hover'
                )}
              >
                {page.label}
              </Link>
              {railLabels && (
                <ul className="nx:list-none nx:ml-2 nx:my-1 nx:pl-2 nx:border-l nx:border-dashed nx:border-border-default">
                  {railLabels.map((label) => (
                    <li
                      key={label}
                      className="nx:px-2 nx:py-0.5 nx:typography-label-small nx:text-muted-foreground-subtle"
                    >
                      [ {label} ]
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
