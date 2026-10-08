import {
  CARD_JOINER,
  type ManifestPage,
  type ManifestSection,
  PAGE_MANIFEST,
} from './page-manifest.generated';

export { CARD_JOINER, type ManifestPage, type ManifestSection, PAGE_MANIFEST };

export function getSection(slug: string): ManifestSection | undefined {
  return PAGE_MANIFEST.find((section) => section.slug === slug);
}

export function requireSection(slug: string): ManifestSection {
  const section = getSection(slug);
  if (!section) {
    throw new Error(
      `No '${slug}' section in the page manifest — add it to apps/docs/page-registry, or stop linking to it.`
    );
  }
  return section;
}

export function requirePage(route: string): ManifestPage {
  const page = PAGE_MANIFEST.flatMap<ManifestPage>(
    (section) => section.pages
  ).find((candidate) => candidate.route === route);
  if (!page) {
    throw new Error(
      `No '${route}' page in the page manifest — add it to apps/docs/page-registry, or stop linking to it.`
    );
  }
  return page;
}
