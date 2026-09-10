/**
 * Nav metadata the docs filesystem cannot supply, and the only input
 * `scripts/page-manifest.mjs` reads that is not a page file. A page renders
 * its `wireframe` only until it has a real file; its entry
 * stays either way, carrying label, order and rail nesting.
 */

import type { Block } from './blocks';

export type RegistryPage = {
  slug: string;
  label: string;
  /** Optional in-page headings rendered inline in the left rail (non-interactive). */
  nested?: string[];
  /** Components a group page covers, rendered inline in the left rail (non-interactive). */
  components?: string[];
  /** Placeholder body, carried only while the page has no source file. */
  wireframe?: { lede: string; blocks: Block[] };
};

export type RegistrySection = {
  slug: string;
  title: string;
  href: string;
  /** What the section is counted in on the home page. Defaults to pages. */
  unit?: 'components';
  pages: RegistryPage[];
};

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
        slug: 'designers',
        label: 'For designers',
        wireframe: {
          lede: '[ Open the Figma library · use the variables · sync via Code Connect ]',
          blocks: [
            {
              type: 'placeholder',
              label:
                '[ External-link list — Figma library, Code Connect docs ]',
            },
            {
              type: 'placeholder',
              variant: 'diagram',
              label: '[ Diagram — code ↔ Figma parity flow ]',
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
        nested: [
          'How color works',
          'Palette & shades',
          'Surfaces',
          'Accessibility',
        ],
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
    pages: [
      {
        slug: 'inputs',
        label: 'Inputs',
        components: ['Button', 'Input', 'Select', 'Switch', 'Tabs'],
        wireframe: {
          lede: '[ Interactive controls · per-component Storybook page below ]',
          blocks: [
            {
              type: 'row',
              blocks: [
                {
                  variant: 'storybook',
                  label: '[ Storybook embed — selected component ]',
                },
                { variant: 'tall', label: '[ Variant matrix · props table ]' },
              ],
            },
            { type: 'h2', text: '[ Per-component pages ]' },
            {
              type: 'placeholder',
              label: '[ Index — Button · Input · Select · Switch · Tabs ]',
            },
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — JSX usage example ]',
            },
          ],
        },
      },
      {
        slug: 'containers',
        label: 'Containers',
        components: ['Card', 'Dialog', 'Accordion', 'Alert'],
        wireframe: {
          lede: '[ Card · Dialog · Accordion · Alert ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'storybook',
              label: '[ Storybook embed ]',
            },
            {
              type: 'placeholder',
              label: '[ Composition patterns · slots / children ]',
            },
          ],
        },
      },
      {
        slug: 'navigation',
        label: 'Navigation',
        components: ['DropdownMenu'],
        wireframe: {
          lede: '[ DropdownMenu · (future) NavigationMenu · Breadcrumbs ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'storybook',
              label: '[ Storybook embed ]',
            },
          ],
        },
      },
      {
        slug: 'display',
        label: 'Display',
        components: ['Badge', 'Avatar', 'Tooltip'],
        wireframe: {
          lede: '[ Badge · Avatar · Tooltip ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'storybook',
              label: '[ Storybook embed ]',
            },
          ],
        },
      },
      {
        slug: 'primitives',
        label: 'Primitives',
        components: ['Show / Hide', 'Slot'],
        wireframe: {
          lede: '[ Low-level building blocks: Show / Hide · Slot ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — Show / Hide usage ]',
            },
            { type: 'placeholder', label: '[ API table ]' },
          ],
        },
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
        slug: 'code-connect',
        label: 'Figma Code Connect',
        wireframe: {
          lede: '[ Mapping Figma components to code · maintaining .figma.ts ]',
          blocks: [
            {
              type: 'placeholder',
              variant: 'code',
              label: '[ Code — example .figma.ts ]',
            },
            {
              type: 'placeholder',
              variant: 'diagram',
              label: '[ Diagram — Figma ↔ code parity ]',
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
          lede: '[ figma-parity · APCA contrast · spacing-modes ]',
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
} satisfies Record<string, RegistrySection>;
