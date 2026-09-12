/**
 * Table-of-contents extraction for the right rail.
 *
 * The rail lives in `[section]/layout.tsx`, so it never sees the page's own
 * data — and the two page kinds that flow through it produce headings in
 * different ways (MDX via `rehype-slug`, hand-built pages as plain JSX). Both
 * land in the same DOM, so the rail reads the rendered article instead of any
 * build-time manifest. Hand-built headings carry no id, so one is assigned
 * here; MDX headings already have theirs and keep it.
 */

/** `id` of the `<article>` the rail scans; set by `SectionLayout`. */
export const DOCS_ARTICLE_ID = 'docs-article';

export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let suffix = 1;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/**
 * Reads the `h2` / `h3` headings of `article` in document order, assigning an
 * id to any heading that lacks one so every entry is linkable.
 */
export function collectHeadings(article: HTMLElement): TocEntry[] {
  const headings = Array.from(
    article.querySelectorAll<HTMLHeadingElement>('h2, h3')
  );
  const taken = new Set(headings.map((heading) => heading.id).filter(Boolean));

  const entries: TocEntry[] = [];
  for (const heading of headings) {
    const text = heading.textContent?.trim() ?? '';
    if (!text) continue;

    if (!heading.id) {
      heading.id = uniqueId(slugify(text) || 'section', taken);
      taken.add(heading.id);
    }

    entries.push({
      id: heading.id,
      text,
      level: heading.tagName === 'H2' ? 2 : 3,
    });
  }
  return entries;
}

/**
 * The entry the reader is currently inside: the last heading whose top has
 * crossed the sticky-header offset. `scroll-padding-top` is the same offset an
 * anchor jump lands on, so a clicked entry stays highlighted.
 */
export function getActiveHeadingId(entries: TocEntry[]): string | null {
  const first = entries[0];
  const last = entries[entries.length - 1];
  if (!first || !last) return null;

  const root = document.documentElement;
  // The final heading may sit too close to the bottom to ever reach the
  // offset, so the end of the page activates it.
  if (window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
    return last.id;
  }

  const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  let activeId = first.id;
  for (const entry of entries) {
    const heading = document.getElementById(entry.id);
    // 1px of tolerance: an anchor jump lands on a fractional pixel.
    if (heading && heading.getBoundingClientRect().top - offset <= 1) {
      activeId = entry.id;
    }
  }
  return activeId;
}
