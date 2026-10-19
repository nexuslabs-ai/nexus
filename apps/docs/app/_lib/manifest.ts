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

export function requirePage(
  sectionSlug: string,
  pageSlug: string
): ManifestPage {
  const page = requireSection(sectionSlug).pages.find(
    (candidate) => candidate.slug === pageSlug
  );
  if (!page) {
    throw new Error(
      `No '${pageSlug}' page in the '${sectionSlug}' section of the page manifest — add it to apps/docs/page-registry, or stop linking to it.`
    );
  }
  return page;
}

/** `{ section, page }` for every docs page, as `generateStaticParams` returns. */
export function docsPageParams() {
  return PAGE_MANIFEST.flatMap((section) =>
    section.pages.map((page) => ({ section: section.slug, page: page.slug }))
  );
}

export function findDocsPage(sectionSlug: string, pageSlug: string) {
  const section = getSection(sectionSlug);
  const page = section?.pages.find((entry) => entry.slug === pageSlug);
  if (!section || !page) return undefined;
  return { section, page };
}
