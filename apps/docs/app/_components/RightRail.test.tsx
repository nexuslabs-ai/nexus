import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DOCS_ARTICLE_ID } from '../_lib/table-of-contents';

import { RightRail } from './RightRail';

vi.mock('next/navigation', () => ({
  usePathname: () => '/foundations/typography',
}));

const SCROLL_OFFSET = 80;

function renderArticle(html: string): void {
  document.body.innerHTML = `<article id="${DOCS_ARTICLE_ID}">${html}</article>`;
}

/** Places each heading's top relative to the viewport, by element id. */
function stubHeadingTops(tops: Record<string, number>): void {
  for (const [id, top] of Object.entries(tops)) {
    const heading = document.getElementById(id);
    if (!heading) throw new Error(`no heading #${id}`);
    const rect = new DOMRect(0, top, 0, 0);
    heading.getBoundingClientRect = vi.fn(() => rect);
  }
}

beforeEach(() => {
  document.body.innerHTML = '';
  document.documentElement.style.scrollPaddingTop = `${SCROLL_OFFSET}px`;
  // The rail skips its layout read when offsetParent is null, which is what
  // jsdom reports for every element.
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get: () => document.body,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  document.documentElement.style.scrollPaddingTop = '';
});

describe('RightRail', () => {
  it('renders nothing when the article has no headings', () => {
    renderArticle('<p>Prose with no headings.</p>');

    render(<RightRail />);

    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('names the landmark with its own heading', () => {
    renderArticle('<h2 id="the-scale">The scale</h2>');

    render(<RightRail />);

    expect(
      screen.getByRole('navigation', { name: 'On this page' })
    ).not.toBeNull();
  });

  it('links each heading by its id, in document order', () => {
    renderArticle(
      '<h2 id="families">Families</h2><h3 id="weights">Weights</h3><h2 id="scale">Scale</h2>'
    );

    render(<RightRail />);

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    ).toEqual(['#families', '#weights', '#scale']);
  });

  it('indents an h3 deeper than an h2', () => {
    renderArticle(
      '<h2 id="families">Families</h2><h3 id="weights">Weights</h3>'
    );

    render(<RightRail />);

    expect(screen.getByRole('link', { name: 'Families' }).classList).toContain(
      'nx:pl-3'
    );
    expect(screen.getByRole('link', { name: 'Weights' }).classList).toContain(
      'nx:pl-6'
    );
  });

  it('marks only the heading the reader is inside', () => {
    renderArticle(
      '<h2 id="families">Families</h2><h2 id="weights">Weights</h2><h2 id="scale">Scale</h2>'
    );
    // Families and Weights are above the offset; Scale is still below it.
    stubHeadingTops({ families: -200, weights: 20, scale: 400 });

    render(<RightRail />);

    expect(
      screen.getByRole('link', { name: 'Weights' }).getAttribute('aria-current')
    ).toBe('location');
    for (const name of ['Families', 'Scale']) {
      expect(
        screen.getByRole('link', { name }).getAttribute('aria-current')
      ).toBeNull();
    }
  });
});
