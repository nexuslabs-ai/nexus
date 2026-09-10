import type { ManifestSection } from './manifest';

/** Components the section documents: a group page's list, or the page itself. */
export function countComponents(section: ManifestSection): number {
  return section.pages.reduce(
    (total, page) => total + (page.components?.length || 1),
    0
  );
}

/** How big a section is, in the units it is organised by. */
export function describeSize(section: ManifestSection): string {
  const groups = section.pages.filter((page) => page.components?.length).length;
  if (groups > 0) {
    return `${groups} groups · ${countComponents(section)} components`;
  }
  const pages = section.pages.length;
  return `${pages} ${pages === 1 ? 'page' : 'pages'}`;
}
