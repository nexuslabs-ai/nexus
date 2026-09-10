import { describe, expect, it } from 'vitest';

import {
  countRailEntries,
  type ManifestSection,
  requireSection,
} from './manifest';

const SECTION: ManifestSection = {
  slug: 'components',
  title: 'Components',
  href: '/components',
  pages: [
    {
      route: '/components/inputs',
      slug: 'inputs',
      label: 'Inputs',
      nested: ['Button', 'Input', 'Select'],
      kind: 'placeholder',
      file: null,
    },
    {
      route: '/components/navigation',
      slug: 'navigation',
      label: 'Navigation',
      nested: ['DropdownMenu'],
      kind: 'placeholder',
      file: null,
    },
    {
      route: '/components/table',
      slug: 'table',
      label: 'Table',
      kind: 'placeholder',
      file: null,
    },
  ],
};

describe('countRailEntries', () => {
  it('counts a grouping page once per nested name and an ungrouped page once', () => {
    expect(countRailEntries(SECTION)).toBe(5);
  });

  it('counts nothing for a section with no pages', () => {
    expect(countRailEntries({ ...SECTION, pages: [] })).toBe(0);
  });
});

describe('requireSection', () => {
  it('returns the section the home page counts', () => {
    expect(requireSection('components').slug).toBe('components');
  });

  it('names the missing slug when the manifest has no such section', () => {
    expect(() => requireSection('widgets')).toThrow(/'widgets'/);
  });
});
