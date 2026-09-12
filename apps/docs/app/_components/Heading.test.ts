import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { SectionHeading, SubsectionHeading } from './Heading';

// No JSX: the docs tsconfig sets `jsx: "preserve"` for Next, so a .tsx test
// would reach the unit runner untransformed.

describe('Heading', () => {
  it('renders the anchor id into the server markup, as rehype-slug does for MDX', () => {
    expect(
      renderToStaticMarkup(
        createElement(SectionHeading, { children: 'The scale' })
      )
    ).toBe('<h2 id="the-scale">The scale</h2>');
  });

  it('slugifies punctuation the hand-built pages actually use', () => {
    expect(
      renderToStaticMarkup(
        createElement(SubsectionHeading, { children: 'Brand & status hues' })
      )
    ).toBe('<h3 id="brand-status-hues">Brand &amp; status hues</h3>');
  });

  it('keeps the caller class list', () => {
    expect(
      renderToStaticMarkup(
        createElement(SectionHeading, {
          className: 'nx:typography-heading-small',
          children: 'Live tokens',
        })
      )
    ).toBe(
      '<h2 id="live-tokens" class="nx:typography-heading-small">Live tokens</h2>'
    );
  });
});
