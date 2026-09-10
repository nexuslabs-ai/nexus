import type { ManifestSection } from './manifest';

function plural(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

/** Components the section documents: a group page's list, or the page itself. */
export function countComponents(section: ManifestSection): number {
  return section.pages.reduce(
    (total, page) => total + (page.components?.length || 1),
    0
  );
}

/** How big a section is, in the unit it declares in the page registry. */
export function describeSize(section: ManifestSection): string {
  switch (section.unit) {
    case 'components': {
      const components = plural(countComponents(section), 'component');
      const groups = section.pages.filter(
        (page) => page.components?.length
      ).length;
      return groups > 0
        ? `${plural(groups, 'group')} · ${components}`
        : components;
    }
    case undefined:
      return plural(section.pages.length, 'page');
  }
}
