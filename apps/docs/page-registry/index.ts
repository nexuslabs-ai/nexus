/**
 * Nav metadata the docs filesystem cannot supply, and the only input
 * `scripts/page-manifest.mjs` reads that is not a page file: section order and
 * titles, and each page's label and order. Every listed page needs a source file.
 */

export type GuidePage = {
  slug: string;
  label: string;
};

type SectionBase = {
  slug: string;
  title: string;
  href: string;
};

export type GuideSection = SectionBase & {
  unit?: never;
  pages: GuidePage[];
};

/**
 * Its pages are not listed here: there is one per component `@nxds/react`
 * exports, generated from its stories tagged `docs` (see `scripts/page-manifest.mjs`).
 */
export type ComponentsSection = SectionBase & {
  /** What the section is counted in on the home page. Other sections count pages. */
  unit: 'components';
  pages?: never;
};

/**
 * Its pages are not listed here: there is one per block under
 * `blocks/{family}/{slug}/`, generated from its story tagged `docs`.
 */
export type BlocksSection = SectionBase & {
  unit: 'blocks';
  pages?: never;
};

export type RegistrySection = GuideSection | ComponentsSection | BlocksSection;

export const PAGE_REGISTRY = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting Started',
    href: '/getting-started',
    pages: [
      { slug: 'introduction', label: 'Introduction' },
      { slug: 'install', label: 'Install' },
      { slug: 'examples', label: 'Examples' },
      { slug: 'ai-agents', label: 'AI agents' },
    ],
  },
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    pages: [
      { slug: 'tokens', label: 'Tokens' },
      { slug: 'color', label: 'Color' },
      { slug: 'typography', label: 'Typography' },
      { slug: 'spacing', label: 'Spacing' },
      { slug: 'radius', label: 'Radius, borders & shadows' },
      { slug: 'focus', label: 'Focus' },
      { slug: 'layering', label: 'Layering' },
      { slug: 'responsive', label: 'Responsive' },
    ],
  },
  theming: {
    slug: 'theming',
    title: 'Theming',
    href: '/theming',
    pages: [
      { slug: 'appearance', label: 'Appearance' },
      { slug: 'overrides', label: 'Overrides' },
    ],
  },
  components: {
    slug: 'components',
    title: 'Components',
    href: '/components',
    unit: 'components',
  },
  blocks: {
    slug: 'blocks',
    title: 'Blocks',
    href: '/blocks',
    unit: 'blocks',
  },
  patterns: {
    slug: 'patterns',
    title: 'Patterns',
    href: '/patterns',
    pages: [
      { slug: 'filtering', label: 'Filtering' },
      { slug: 'forms', label: 'Forms' },
    ],
  },
} satisfies Record<string, RegistrySection> & {
  components: ComponentsSection;
};
