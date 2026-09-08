import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

function renderFooterAnchors(): { href: string; text: string }[] {
  const html = renderToStaticMarkup(createElement(Footer));

  return [...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g)].map(
    ([, href = '', text = '']) => ({ href, text })
  );
}

describe('Footer', () => {
  it('renders every link as a reachable absolute URL', () => {
    const anchors = renderFooterAnchors();

    expect(anchors.length).toBeGreaterThan(0);

    for (const anchor of anchors) {
      expect(anchor.href).toMatch(/^https:\/\//);
    }
  });

  it('tells assistive tech that each link opens a new tab', () => {
    for (const anchor of renderFooterAnchors()) {
      expect(anchor.text).toContain('(opens in a new tab)');
    }
  });
});
