import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { SectionHeading, slugify, SubsectionHeading } from './Heading';

describe('slugify', () => {
  it('lowercases and hyphenates, dropping punctuation and edge separators', () => {
    expect(slugify('Install the published packages')).toBe(
      'install-the-published-packages'
    );
    expect(slugify('  Why `asChild`? ')).toBe('why-aschild');
    expect(slugify('Tokens & themes — v2')).toBe('tokens-themes-v2');
  });
});

describe('Heading', () => {
  it('renders the anchor id into the server markup, as rehype-slug does for MDX', () => {
    expect(
      renderToStaticMarkup(<SectionHeading>The scale</SectionHeading>)
    ).toBe('<h2 id="the-scale">The scale</h2>');
  });

  it('slugifies punctuation the hand-built pages actually use', () => {
    expect(
      renderToStaticMarkup(
        <SubsectionHeading>{'Brand & status hues'}</SubsectionHeading>
      )
    ).toBe('<h3 id="brand-status-hues">Brand &amp; status hues</h3>');
  });

  it('lets a caller override the slug so repeated text stays linkable', () => {
    expect(
      renderToStaticMarkup(
        <SectionHeading id="the-scale-2">The scale</SectionHeading>
      )
    ).toBe('<h2 id="the-scale-2">The scale</h2>');
  });

  it('keeps the caller class list', () => {
    expect(
      renderToStaticMarkup(
        <SectionHeading className="nx:typography-heading-small">
          Live tokens
        </SectionHeading>
      )
    ).toBe(
      '<h2 id="live-tokens" class="nx:typography-heading-small">Live tokens</h2>'
    );
  });
});
