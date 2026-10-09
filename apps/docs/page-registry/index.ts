/**
 * Nav metadata the docs filesystem cannot supply, and the only input
 * `scripts/page-manifest.mjs` reads that is not a page file. A page renders
 * its `wireframe` only until it has a real file; its entry
 * stays either way, carrying label, order and rail nesting.
 */

import type { Block } from './blocks';

export type GuidePage = {
  slug: string;
  label: string;
  /** Placeholder body, carried only while the page has no source file. */
  wireframe?: { lede: string; blocks: Block[] };
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
 * Its pages are not listed here: there is one per component `@nexus_ds/react`
 * exports, generated from its stories tagged `docs` (see `scripts/page-manifest.mjs`).
 */
export type ComponentsSection = SectionBase & {
  /** What the section is counted in on the home page. Other sections count pages. */
  unit: 'components';
  pages?: never;
};

/**
 * Its pages are not listed here: there is one per block under
 * `recipes/{recipe}/blocks/`, generated from its story tagged `docs`.
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
      {
        slug: 'install',
        label: 'Install',
      },
      {
        slug: 'theme-setup',
        label: 'Theme setup',
      },
      {
        slug: 'first-component',
        label: 'Your first component',
        wireframe: {
          lede: '[ Render a Button, swap a variant, observe the data attributes ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code block — JSX import + render ]',
            },
            {
              type: 'placeholder',
              variant: 'storybook',
              label: '[ Storybook embed — Button playground ]',
            },
          ],
        },
      },
      {
        slug: 'agents',
        label: 'For AI agents',
        wireframe: {
          lede: '[ Point your agent at llms.txt · load the rule files · use the system prompt ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code block — system-prompt snippet ]',
            },
            {
              type: 'placeholder',
              label: '[ Download / copy buttons — llms.txt, rules.zip ]',
            },
          ],
        },
      },
    ],
  },
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    pages: [
      {
        slug: 'color',
        label: 'Color',
      },
      {
        slug: 'typography',
        label: 'Typography',
      },
      {
        slug: 'spacing',
        label: 'Spacing',
      },
      {
        slug: 'radius',
        label: 'Radius, borders & shadows',
      },
      {
        slug: 'focus',
        label: 'Focus',
      },
      {
        slug: 'layering',
        label: 'Layering',
      },
      {
        slug: 'responsive',
        label: 'Responsive',
      },
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
      {
        slug: 'filtering',
        label: 'Filtering',
      },
    ],
  },
  theming: {
    slug: 'theming',
    title: 'Theming',
    href: '/theming',
    pages: [
      {
        slug: 'appearance',
        label: 'Appearance',
      },
      {
        slug: 'multi-brand',
        label: 'Multi-brand',
      },
      {
        slug: 'density-modes',
        label: 'Density modes',
        wireframe: {
          lede: '[ Spacing density via data-density ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'tall',
              label:
                '[ Live demo — 6-mode grid · same component, different density ]',
            },
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — data-density attribute pattern ]',
            },
          ],
        },
      },
      {
        slug: 'overrides',
        label: 'Consumer overrides',
        wireframe: {
          lede: '[ Re-point a token via CSS variable in your stylesheet ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — :root override pattern ]',
            },
            {
              type: 'placeholder',
              label: "[ Body — what's safe to override, what isn't ]",
            },
          ],
        },
      },
      {
        slug: 'radius-overrides',
        label: 'Radius overrides',
      },
    ],
  },
  tools: {
    slug: 'tools',
    title: 'Tools',
    href: '/tools',
    pages: [
      {
        slug: 'nx-prefix',
        label: 'nx: prefix (Tailwind)',
        wireframe: {
          lede: '[ Why everything is prefixed · how it composes with modifiers ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: "[ Code — examples · do / don't ]",
            },
            {
              type: 'placeholder',
              variant: 'table',
              label: '[ Table — prefix placement rules ]',
            },
          ],
        },
      },
      {
        slug: 'eslint',
        label: 'ESLint plugin',
        wireframe: {
          lede: '[ @nexus_ds/eslint-plugin · canonical-spacing-steps · class conventions ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — install + config ]',
            },
            {
              type: 'placeholder',
              variant: 'table',
              label: '[ Table — rules · severity · what they flag ]',
            },
          ],
        },
      },
      {
        slug: 'audits',
        label: 'Token audits',
        wireframe: {
          lede: '[ APCA contrast · spacing-modes ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'table',
              label:
                '[ Table — audit · command · exit codes · what it catches ]',
            },
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — CI workflow snippet ]',
            },
          ],
        },
      },
      {
        slug: 'storybook',
        label: 'Storybook',
        wireframe: {
          lede: '[ Stories-as-tests · autodocs · base-variant grids ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'storybook',
              label: '[ Storybook embed — example component ]',
            },
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — story template ]',
            },
          ],
        },
      },
    ],
  },
  guidance: {
    slug: 'guidance',
    title: 'Guidance',
    href: '/guidance',
    pages: [
      {
        slug: 'engineering',
        label: 'Engineering principles',
        wireframe: {
          lede: '[ Simplicity over cleverness · guard clauses · composition · ripple effect ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'table',
              label: '[ Table — principle · rule file · one-line summary ]',
            },
            {
              type: 'placeholder',
              label: '[ Cards — each rule from code-quality.md children ]',
            },
          ],
        },
      },
      {
        slug: 'testing',
        label: 'Testing model',
        wireframe: {
          lede: '[ Stories are tests · vitest projects · APCA at the token layer ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'diagram',
              label:
                '[ Diagram — what runs where (storybook / unit / audits) ]',
            },
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — play function example ]',
            },
          ],
        },
      },
      {
        slug: 'contribution',
        label: 'Contribution workflow',
        wireframe: {
          lede: '[ Branch · PR title · review accounts · DoD ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'diagram',
              label: '[ Diagram — issue → branch → PR → review → merge ]',
            },
            {
              type: 'placeholder',
              variant: 'table',
              label: '[ Table — verdicts · review events · who posts ]',
            },
          ],
        },
      },
    ],
  },
  agents: {
    slug: 'agents',
    title: 'For AI agents',
    href: '/agents',
    pages: [
      {
        slug: 'llms-txt',
        label: 'llms.txt',
        wireframe: {
          lede: '[ Point your model at one URL · machine-readable site map ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — llms.txt preview ]',
            },
            { type: 'placeholder', label: '[ Download · copy link ]' },
          ],
        },
      },
      {
        slug: 'rules-mirror',
        label: 'Rules mirror',
        wireframe: {
          lede: '[ All 17 rule files · readable on the web · always up to date ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'table',
              label: '[ Table — rule file · purpose · related ]',
            },
          ],
        },
      },
      {
        slug: 'authoring',
        label: 'Agent authoring',
        wireframe: {
          lede: '[ Copy-paste system prompts · authoring conventions · common pitfalls ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — system prompt template ]',
            },
            { type: 'placeholder', label: "[ Do / Don't list ]" },
          ],
        },
      },
    ],
  },
} satisfies Record<string, RegistrySection> & {
  components: ComponentsSection;
};
