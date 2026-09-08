import { describe, expect, it } from 'vitest';

import { FOOTER_LINKS } from './Footer';

describe('FOOTER_LINKS', () => {
  it('points every link at a reachable absolute URL', () => {
    expect(FOOTER_LINKS.length).toBeGreaterThan(0);

    for (const link of FOOTER_LINKS) {
      expect(link.href).toMatch(/^https:\/\//);
    }
  });

  it('links to the published Storybook', () => {
    const storybook = FOOTER_LINKS.find((link) => link.label === 'Storybook');

    expect(storybook?.href).toBe('https://nexuslabs-ai.github.io/nexus/');
  });
});
