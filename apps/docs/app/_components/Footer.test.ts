import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

function renderFooterAnchors(): HTMLAnchorElement[] {
  document.body.innerHTML = renderToStaticMarkup(createElement(Footer));

  const anchors = [...document.body.querySelectorAll('a')];

  expect(anchors.length).toBeGreaterThan(0);

  return anchors;
}

describe('Footer', () => {
  it('renders every link as a reachable absolute URL', () => {
    for (const anchor of renderFooterAnchors()) {
      expect(anchor.getAttribute('href')).toMatch(/^https:\/\//);
    }
  });

  it('opens every link in a new tab without leaking the referrer', () => {
    for (const anchor of renderFooterAnchors()) {
      expect(anchor.target).toBe('_blank');
      expect(anchor.rel).toBe('noreferrer');
    }
  });

  it('tells assistive tech that each link opens a new tab', () => {
    for (const anchor of renderFooterAnchors()) {
      expect(anchor.textContent).toContain('(opens in a new tab)');
    }
  });
});
