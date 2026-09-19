import { describe, expect, it } from 'vitest';

import { requireSection } from './manifest';

describe('requireSection', () => {
  it('returns the section a caller links to', () => {
    expect(requireSection('components')).toMatchObject({
      slug: 'components',
      href: '/components',
    });
  });

  it('names the missing slug when the manifest has no such section', () => {
    expect(() => requireSection('playground')).toThrow(
      "No 'playground' section in the page manifest"
    );
  });
});
