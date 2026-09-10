import {
  type ManifestPage,
  type ManifestSection,
  PAGE_MANIFEST,
} from './page-manifest.generated';

export { type ManifestPage, type ManifestSection, PAGE_MANIFEST };

export function getSection(slug: string): ManifestSection | undefined {
  return PAGE_MANIFEST.find((section) => section.slug === slug);
}

/** `getSection` for callers that link to a fixed section and cannot render without it. */
export function requireSection(slug: string): ManifestSection {
  const section = getSection(slug);
  if (!section) {
    throw new Error(
      `No '${slug}' section in the page manifest — add it to apps/docs/page-registry, or stop linking to it.`
    );
  }
  return section;
}
