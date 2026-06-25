'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { Section } from '../_lib/sections';

export function LeftRail({ section }: { section: Section }) {
  const pathname = usePathname();
  return (
    <aside className="nx:sticky nx:top-16 nx:self-start nx:max-h-[calc(100svh-80px)] nx:overflow-y-auto nx:pr-2">
      <h3 className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2">
        {section.title}
      </h3>
      <ul className="nx:list-none nx:p-0 nx:m-0">
        {section.subs.map((sub) => {
          const href = `${section.href}/${sub.slug}`;
          const active = pathname === href;
          return (
            <li key={sub.slug}>
              <Link
                href={href}
                className={
                  active
                    ? 'nx:block nx:px-2 nx:py-1 nx:typography-label-default nx:rounded-sm nx:bg-primary-subtle nx:text-primary-subtle-foreground nx:border-l-2 nx:border-focus-default nx:no-underline'
                    : 'nx:block nx:px-2 nx:py-1 nx:typography-label-default nx:rounded-sm nx:text-muted-foreground nx:border-l-2 nx:border-transparent nx:no-underline nx:hover:text-foreground nx:hover:bg-container-hover'
                }
              >
                {sub.label}
              </Link>
              {sub.nested && sub.nested.length > 0 && (
                <ul className="nx:list-none nx:ml-2 nx:my-1 nx:pl-2 nx:border-l nx:border-dashed nx:border-border-default">
                  {sub.nested.map((label) => (
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
