export const DOCS_ARTICLE_ID = 'docs-article';

export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function collectHeadings(article: HTMLElement): TocEntry[] {
  const headings = article.querySelectorAll<HTMLHeadingElement>('h2, h3');
  const entries: TocEntry[] = [];
  const seen = new Set<string>();

  for (const heading of headings) {
    const text = heading.textContent?.trim() ?? '';
    if (!heading.id || !text || seen.has(heading.id)) continue;
    // remark-gfm appends a hidden "Footnotes" heading no page author wrote.
    if (heading.closest('[data-footnotes]')) continue;

    seen.add(heading.id);
    entries.push({
      id: heading.id,
      text,
      level: heading.tagName === 'H2' ? 2 : 3,
    });
  }

  return entries;
}

/** The last heading whose top has crossed the anchor-jump offset. */
export function getActiveHeadingId(entries: TocEntry[]): string | null {
  const first = entries[0];
  const last = entries[entries.length - 1];
  if (!first || !last) return null;

  const root = document.documentElement;
  // The final heading can sit too close to the bottom to ever reach the offset.
  const maxScroll = root.scrollHeight - window.innerHeight;
  if (maxScroll > 2 && window.scrollY >= maxScroll - 2) return last.id;

  // scroll-padding-top is where an anchor jump lands, so a clicked entry stays
  // active; 1px of tolerance because that jump ends on a fractional pixel.
  const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
  const active = entries.findLast((entry) => {
    const top = document.getElementById(entry.id)?.getBoundingClientRect().top;
    return top !== undefined && top - offset <= 1;
  });

  return active?.id ?? first.id;
}
