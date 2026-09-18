import {
  type ManifestPage,
  type ManifestSection,
  PAGE_MANIFEST,
} from './page-manifest.generated';

export { type ManifestPage, type ManifestSection, PAGE_MANIFEST };

export function getSection(slug: string): ManifestSection | undefined {
  return PAGE_MANIFEST.find((section) => section.slug === slug);
}
