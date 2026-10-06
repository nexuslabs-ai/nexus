import {
  CARD_JOINER,
  type ComponentsManifestSection,
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

export function requireComponentsSection(): ComponentsManifestSection {
  const section = requireSection('components');
  if (section.unit !== 'components') {
    throw new Error(
      "The 'components' section in the page manifest is not a components section — give it `unit: 'components'` in apps/docs/page-registry."
    );
  }
  return section;
}
