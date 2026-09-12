'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@nexus_ds/react';
import { usePathname } from 'next/navigation';

import {
  collectHeadings,
  DOCS_ARTICLE_ID,
  getActiveHeadingId,
  type TocEntry,
} from '../_lib/table-of-contents';

const TOC_HEADING_ID = 'docs-toc-heading';

const TOC_LINK_BASE =
  'nx:block nx:py-1 nx:border-l-2 nx:no-underline nx:typography-label-small nx:rounded-sm nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)';

export function RightRail() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.getElementById(DOCS_ARTICLE_ID);
    setEntries(article ? collectHeadings(article) : []);
  }, [pathname]);

  useEffect(() => {
    if (entries.length === 0) return;

    let frame = 0;
    const sync = () => {
      frame = 0;
      // Null while the rail is display:none below lg, where tracking the
      // reader would paint nothing.
      if (!navRef.current?.offsetParent) return;
      setActiveId(getActiveHeadingId(entries));
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    // An expanding <details> moves every heading without firing either event.
    const article = document.getElementById(DOCS_ARTICLE_ID);
    const observer = new ResizeObserver(schedule);
    if (article) observer.observe(article);

    sync();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-labelledby={TOC_HEADING_ID}
      className="nx:sticky nx:top-(--docs-header-h) nx:self-start nx:hidden nx:lg:block nx:max-h-[calc(100svh-var(--docs-header-h))] nx:overflow-y-auto"
    >
      <h3
        id={TOC_HEADING_ID}
        className="nx:text-[11px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-2"
      >
        On this page
      </h3>
      <ul className="nx:list-none nx:p-0 nx:m-0">
        {entries.map((entry) => (
          <TocLink
            key={entry.id}
            entry={entry}
            active={entry.id === activeId}
          />
        ))}
      </ul>
    </nav>
  );
}

function TocLink({ entry, active }: { entry: TocEntry; active: boolean }) {
  return (
    <li>
      <a
        href={`#${entry.id}`}
        data-level={entry.level}
        aria-current={active ? 'location' : undefined}
        className={cn(
          TOC_LINK_BASE,
          entry.level === 3 ? 'nx:pl-6' : 'nx:pl-3',
          active
            ? 'nx:text-primary-subtle-foreground nx:border-focus-default'
            : 'nx:text-muted-foreground-subtle nx:border-border-default nx:hover:text-foreground'
        )}
      >
        {entry.text}
      </a>
    </li>
  );
}
