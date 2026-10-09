'use client';

import { cn } from '@nexus_ds/react/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { ManifestPage, ManifestSection } from '../_lib/manifest';

const RAIL_LINK_BASE =
  'nx:block nx:px-2 nx:py-1 nx:typography-label-default nx:rounded-sm nx:border-l-2 nx:no-underline nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';

type RailGroup = { label?: string; pages: ManifestPage[] };

/** Consecutive pages that share a `group` sit under one heading. */
function railGroups(pages: readonly ManifestPage[]): RailGroup[] {
  const groups: RailGroup[] = [];
  for (const page of pages) {
    const label = 'group' in page ? page.group : undefined;
    const last = groups.at(-1);
    if (last && last.label === label) last.pages.push(page);
    else groups.push({ label, pages: [page] });
  }
  return groups;
}

export function LeftRail({ section }: { section: ManifestSection }) {
  const pathname = usePathname();
  return (
    <aside className="nx:sticky nx:top-(--docs-header-h) nx:self-start nx:max-h-[calc(100svh-var(--docs-header-h))] nx:overflow-y-auto nx:pr-2">
      <h3 className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2">
        {section.title}
      </h3>
      {railGroups(section.pages).map((group) => (
        <div key={group.label ?? group.pages[0]?.slug}>
          {group.label && (
            <h4 className="nx:px-2 nx:mt-3 nx:mb-1 nx:typography-label-small nx:font-semibold nx:text-foreground">
              {group.label}
            </h4>
          )}
          <ul className="nx:list-none nx:p-0 nx:m-0">
            {group.pages.map((page) => {
              const active = pathname === page.route;
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
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
