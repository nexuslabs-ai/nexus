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

function section(
  pages: ManifestPage[],
  unit?: ManifestSection['unit']
): ManifestSection {
  return {
    slug: 'components',
    title: 'Components',
    href: '/components',
    ...(unit ? { unit } : {}),
    pages,
  };
}

const GROUPED = section(
  [
    page('inputs', { components: ['Button', 'Input', 'Select'] }),
    page('navigation', { components: ['DropdownMenu'] }),
    page('table'),
  ],
  'components'
);

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
  it('reports groups and components for a section counted in components', () => {
    expect(describeSize(GROUPED)).toBe('2 groups · 5 components');
  });

  it('says group, not groups, for a single group page', () => {
    const one = section(
      [page('inputs', { components: ['Button'] })],
      'components'
    );
    expect(describeSize(one)).toBe('1 group · 1 component');
  });

  // The shape the per-component pages land in: one page each, no `components`.
  it('drops the groups clause when no page carries a component list', () => {
    expect(
      describeSize(section([page('button'), page('input')], 'components'))
    ).toBe('2 components');
  });

  it('ignores an empty component list when counting groups', () => {
    expect(
      describeSize(section([page('table', { components: [] })], 'components'))
    ).toBe('1 component');
  });

  it('reports pages for a section that declares no unit', () => {
    expect(describeSize(section([page('color'), page('spacing')]))).toBe(
      '2 pages'
    );
  });

  it('says page, not pages, for a one-page section', () => {
    expect(describeSize(section([page('color')]))).toBe('1 page');
  });
});
