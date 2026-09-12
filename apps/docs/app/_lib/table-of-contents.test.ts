import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  collectHeadings,
  getActiveHeadingId,
  slugify,
  type TocEntry,
} from './table-of-contents';

function renderArticle(html: string): HTMLElement {
  const article = document.createElement('article');
  article.innerHTML = html;
  document.body.append(article);
  return article;
}

/** Places each heading at a fixed viewport offset, as `getActiveHeadingId` reads it. */
function stubHeadingTops(tops: Record<string, number>): void {
  for (const [id, top] of Object.entries(tops)) {
    const heading = document.getElementById(id);
    if (!heading) throw new Error(`no heading #${id}`);
    const rect = new DOMRect(0, top, 0, 0);
    heading.getBoundingClientRect = vi.fn(() => rect);
  }
}

function stubViewport({
  scrollY,
  innerHeight,
  scrollHeight,
  scrollPaddingTop,
}: {
  scrollY: number;
  innerHeight: number;
  scrollHeight: number;
  scrollPaddingTop: string;
}): void {
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(scrollY);
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(innerHeight);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(
    scrollHeight
  );
  document.documentElement.style.scrollPaddingTop = scrollPaddingTop;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.style.scrollPaddingTop = '';
});

describe('slugify', () => {
  it('lowercases and hyphenates, dropping punctuation and edge separators', () => {
    expect(slugify('Install the published packages')).toBe(
      'install-the-published-packages'
    );
    expect(slugify('  Why `asChild`? ')).toBe('why-aschild');
    expect(slugify('Tokens & themes — v2')).toBe('tokens-themes-v2');
  });
});

describe('collectHeadings', () => {
  it('keeps ids rendered by rehype-slug on MDX pages', () => {
    const article = renderArticle(
      '<h2 id="install-the-packages">Install the packages</h2>'
    );

    expect(collectHeadings(article)).toEqual<TocEntry[]>([
      { id: 'install-the-packages', text: 'Install the packages', level: 2 },
    ]);
  });

  it('assigns ids to the hand-built pages, which render headings without one', () => {
    const article = renderArticle(
      '<h2>The scale</h2><h3>Heading tiers</h3><h2>Families</h2>'
    );

    expect(collectHeadings(article)).toEqual<TocEntry[]>([
      { id: 'the-scale', text: 'The scale', level: 2 },
      { id: 'heading-tiers', text: 'Heading tiers', level: 3 },
      { id: 'families', text: 'Families', level: 2 },
    ]);
    expect(article.querySelector('h3')?.id).toBe('heading-tiers');
  });

  it('suffixes a generated id that would collide with another heading', () => {
    const article = renderArticle(
      '<h2 id="overview">Overview</h2><h2>Overview</h2><h2>Overview</h2>'
    );

    expect(collectHeadings(article).map((entry) => entry.id)).toEqual([
      'overview',
      'overview-1',
      'overview-2',
    ]);
  });

  it('skips h1 and empty headings, and reads nested heading text', () => {
    const article = renderArticle(
      '<h1>Typography</h1><h2></h2><h2>Live <code>tokens</code></h2>'
    );

    expect(collectHeadings(article)).toEqual<TocEntry[]>([
      { id: 'live-tokens', text: 'Live tokens', level: 2 },
    ]);
  });

  it('returns nothing for a page with no headings', () => {
    expect(collectHeadings(renderArticle('<p>No headings here.</p>'))).toEqual(
      []
    );
  });
});

describe('getActiveHeadingId', () => {
  const entries: TocEntry[] = [
    { id: 'one', text: 'One', level: 2 },
    { id: 'two', text: 'Two', level: 2 },
    { id: 'three', text: 'Three', level: 2 },
  ];

  function renderThreeHeadings(): void {
    renderArticle(
      '<h2 id="one">One</h2><h2 id="two">Two</h2><h2 id="three">Three</h2>'
    );
  }

  it('returns null when the page has no headings', () => {
    expect(getActiveHeadingId([])).toBeNull();
  });

  it('holds the first entry while the reader is above every heading', () => {
    renderThreeHeadings();
    stubViewport({
      scrollY: 0,
      innerHeight: 800,
      scrollHeight: 4000,
      scrollPaddingTop: '80px',
    });
    stubHeadingTops({ one: 400, two: 1200, three: 2000 });

    expect(getActiveHeadingId(entries)).toBe('one');
  });

  it('advances to the last heading that has crossed the scroll offset', () => {
    renderThreeHeadings();
    stubViewport({
      scrollY: 1000,
      innerHeight: 800,
      scrollHeight: 4000,
      scrollPaddingTop: '80px',
    });
    stubHeadingTops({ one: -600, two: 60, three: 900 });

    expect(getActiveHeadingId(entries)).toBe('two');
  });

  it('activates a heading resting exactly on the anchor-jump offset', () => {
    renderThreeHeadings();
    stubViewport({
      scrollY: 1200,
      innerHeight: 800,
      scrollHeight: 4000,
      scrollPaddingTop: '80px',
    });
    stubHeadingTops({ one: -800, two: -200, three: 80 });

    expect(getActiveHeadingId(entries)).toBe('three');
  });

  it('activates the final heading at the bottom of the page, where it never reaches the offset', () => {
    renderThreeHeadings();
    stubViewport({
      scrollY: 3200,
      innerHeight: 800,
      scrollHeight: 4000,
      scrollPaddingTop: '80px',
    });
    stubHeadingTops({ one: -3000, two: -2000, three: 700 });

    expect(getActiveHeadingId(entries)).toBe('three');
  });
});
