import {
  type ManifestPage,
  type ManifestSection,
  PAGE_MANIFEST,
} from './page-manifest.generated';

export function getSection(slug: string): ManifestSection | undefined {
  return PAGE_MANIFEST.find((section) => section.slug === slug);
}

export function getPage(
  sectionSlug: string,
  pageSlug: string
): ManifestPage | undefined {
  return getSection(sectionSlug)?.pages.find((page) => page.slug === pageSlug);
}
