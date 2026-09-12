import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DOCS_ARTICLE_ID } from '../_lib/table-of-contents';
import { stubHeadingTops } from '../_lib/test-support';

import { RightRail } from './RightRail';

const nav = vi.hoisted(() => ({ pathname: '/foundations/typography' }));

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
}));

/** Swaps the article in place, leaving the rail's own container mounted. */
function renderArticle(html: string): void {
  document.getElementById(DOCS_ARTICLE_ID)?.remove();
  const article = document.createElement('article');
  article.id = DOCS_ARTICLE_ID;
  article.innerHTML = html;
  document.body.prepend(article);
}

/** jsdom reports a null offsetParent for every element, which the rail reads as hidden. */
function showRail(): void {
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(
    document.body
  );
}

beforeEach(() => {
  nav.pathname = '/foundations/typography';
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
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

    // getByRole throws unless a navigation landmark carries this exact name.
    screen.getByRole('navigation', { name: 'On this page' });
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

  it('carries each heading depth through to its link', () => {
    renderArticle(
      '<h2 id="families">Families</h2><h3 id="weights">Weights</h3>'
    );

    render(<RightRail />);

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('data-level'))
    ).toEqual(['2', '3']);
  });

  it('re-collects the headings when the reader navigates to another page', () => {
    renderArticle('<h2 id="families">Families</h2>');

    const { rerender } = render(<RightRail />);

    nav.pathname = '/foundations/spacing';
    renderArticle('<h2 id="the-grid">The grid</h2>');
    rerender(<RightRail />);

    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    ).toEqual(['#the-grid']);
  });

  it('marks only the heading the reader is inside', () => {
    renderArticle(
      '<h2 id="families">Families</h2><h2 id="weights">Weights</h2><h2 id="scale">Scale</h2>'
    );
    // Families and Weights sit above the viewport; Scale is far enough below it
    // to stay inactive whatever scroll-padding-top the page sets.
    stubHeadingTops({ families: -400, weights: -100, scale: 600 });
    showRail();

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
