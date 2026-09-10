import { describe, expect, it } from 'vitest';

import { countComponents, describeSize } from './home-counts';
import type { ManifestPage, ManifestSection } from './manifest';

type RailLabels = Pick<ManifestPage, 'components' | 'nested'>;

function page(slug: string, rail: RailLabels = {}): ManifestPage {
  return {
    route: `/components/${slug}`,
    slug,
    label: slug,
    kind: 'placeholder',
    file: null,
    ...rail,
  };
}

function section(pages: ManifestPage[]): ManifestSection {
  return {
    slug: 'components',
    title: 'Components',
    href: '/components',
    pages,
  };
}

const GROUPED = section([
  page('inputs', { components: ['Button', 'Input', 'Select'] }),
  page('navigation', { components: ['DropdownMenu'] }),
  page('table'),
]);

describe('countComponents', () => {
  it('counts a group page once per component and an ungrouped page once', () => {
    expect(countComponents(GROUPED)).toBe(5);
  });

  it('counts a page carrying an empty list as itself', () => {
    expect(countComponents(section([page('table', { components: [] })]))).toBe(
      1
    );
  });

  it('counts nothing for a section with no pages', () => {
    expect(countComponents(section([]))).toBe(0);
  });
});

describe('describeSize', () => {
  it('reports groups and components when pages carry component lists', () => {
    expect(describeSize(GROUPED)).toBe('2 groups · 5 components');
  });

  it('ignores an empty component list when counting groups', () => {
    expect(describeSize(section([page('table', { components: [] })]))).toBe(
      '1 page'
    );
  });

  it('reports pages when no page carries a component list', () => {
    expect(describeSize(section([page('color'), page('spacing')]))).toBe(
      '2 pages'
    );
  });

  it('says page, not pages, for a one-page section', () => {
    expect(describeSize(section([page('color')]))).toBe('1 page');
  });
});
