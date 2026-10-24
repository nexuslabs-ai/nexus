'use client';

import { cn } from '@nxds/react/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { ManifestPage, ManifestSection } from '../_lib/manifest';

const PAGE_LINK_BASE =
  'nx:block nx:px-2 nx:py-1 nx:typography-label-default nx:rounded-sm nx:border-l-2 nx:no-underline nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';

type PageGroup = { label?: string; pages: ManifestPage[] };

/** Consecutive pages that share a `group` sit under one heading. */
function pageGroups(pages: readonly ManifestPage[]): PageGroup[] {
  const groups: PageGroup[] = [];
  for (const page of pages) {
    const label = 'group' in page ? page.group : undefined;
    const last = groups.at(-1);
    if (last && last.label === label) last.pages.push(page);
    else groups.push({ label, pages: [page] });
  }
  return groups;
}

export function SectionPageList({
  section,
  onNavigate,
}: {
  section: ManifestSection;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return pageGroups(section.pages).map((group) => (
    <div key={group.label ?? group.pages[0]?.slug}>
      {group.label && (
        <p className="nx:px-2 nx:mt-3 nx:mb-1 nx:typography-label-small nx:font-semibold nx:text-foreground">
          {group.label}
        </p>
      )}
      <ul className="nx:list-none nx:p-0 nx:m-0">
        {group.pages.map((page) => {
          const active = pathname === page.route;
          return (
            <li key={page.slug}>
              <Link
                href={page.route}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  PAGE_LINK_BASE,
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
  ));
}
