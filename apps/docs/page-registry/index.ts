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
  /** Optional in-page headings rendered inline in the left rail (non-interactive). */
  nested?: string[];
  /** Placeholder body, carried only while the page has no source file. */
  wireframe?: { lede: string; blocks: Block[] };
  examples?: never;
};

/**
 * A component `@nexus_ds/react` exports. Once `components/{slug}.mdx` is
 * written as `<ComponentPage slug="{slug}" />` it renders that page; until
 * then it renders a placeholder.
 */
export type ComponentPageEntry = {
  slug: string;
  label: string;
  /**
   * Demo names under `examples/{slug}/`, shown first and in this order;
   * unlisted demos follow in name order.
   */
  examples?: string[];
  nested?: never;
  wireframe?: never;
};

export type RegistryPage = GuidePage | ComponentPageEntry;

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
    pages: [
      {
        slug: 'accordion',
        label: 'Accordion',
        examples: ['floating', 'multiple', 'disabled'],
      },
      {
        slug: 'alert',
        label: 'Alert',
        examples: ['variants', 'with-actions', 'dismissible', 'banner'],
      },
      {
        slug: 'alert-dialog',
        label: 'AlertDialog',
        examples: ['destructive-action', 'center'],
      },
      {
        slug: 'appearance',
        label: 'Appearance',
      },
      {
        slug: 'aspect-ratio',
        label: 'AspectRatio',
        examples: ['ratios'],
      },
      {
        slug: 'attachment',
        label: 'Attachment',
        examples: ['states', 'sizes', 'group'],
      },
      {
        slug: 'avatar',
        label: 'Avatar',
        examples: ['sizes', 'shapes', 'with-status', 'group'],
      },
      {
        slug: 'badge',
        label: 'Badge',
        examples: ['variants', 'fills', 'with-icon', 'icon-only'],
      },
      {
        slug: 'breadcrumb',
        label: 'Breadcrumb',
        examples: ['with-ellipsis', 'with-icons', 'with-menu'],
      },
      {
        slug: 'bubble',
        label: 'Bubble',
        examples: ['variants', 'with-reactions'],
      },
      {
        slug: 'button',
        label: 'Button',
        examples: ['variants', 'sizes', 'with-icon', 'disabled'],
      },
      {
        slug: 'button-group',
        label: 'ButtonGroup',
        examples: ['sizes', 'vertical', 'with-text', 'with-separator'],
      },
      {
        slug: 'card',
        label: 'Card',
      },
      {
        slug: 'carousel',
        label: 'Carousel',
        examples: ['vertical'],
      },
      {
        slug: 'chart',
        label: 'Chart',
        examples: ['area', 'line'],
      },
      {
        slug: 'checkbox',
        label: 'Checkbox',
      },
      {
        slug: 'choice-card',
        label: 'ChoiceCard',
      },
      {
        slug: 'choice-row',
        label: 'ChoiceRow',
      },
      {
        slug: 'collapsible',
        label: 'Collapsible',
      },
      {
        slug: 'combobox',
        label: 'Combobox',
      },
      {
        slug: 'command',
        label: 'Command',
      },
      {
        slug: 'context-menu',
        label: 'ContextMenu',
      },
      {
        slug: 'date-picker',
        label: 'DatePicker',
      },
      {
        slug: 'dialog',
        label: 'Dialog',
      },
      {
        slug: 'drawer',
        label: 'Drawer',
      },
      {
        slug: 'dropdown-menu',
        label: 'DropdownMenu',
      },
      {
        slug: 'empty-state',
        label: 'EmptyState',
      },
      {
        slug: 'field',
        label: 'Field',
      },
      {
        slug: 'hide',
        label: 'Hide',
      },
      {
        slug: 'hover-card',
        label: 'HoverCard',
      },
      {
        slug: 'input',
        label: 'Input',
      },
      {
        slug: 'input-group',
        label: 'InputGroup',
      },
      {
        slug: 'input-otp',
        label: 'InputOTP',
      },
      {
        slug: 'item',
        label: 'Item',
      },
      {
        slug: 'kbd',
        label: 'Kbd',
      },
      {
        slug: 'label',
        label: 'Label',
      },
      {
        slug: 'marker',
        label: 'Marker',
      },
      {
        slug: 'menubar',
        label: 'Menubar',
      },
      {
        slug: 'multi-select',
        label: 'MultiSelect',
      },
      {
        slug: 'native-select',
        label: 'NativeSelect',
      },
      {
        slug: 'navigation-menu',
        label: 'NavigationMenu',
      },
      {
        slug: 'pagination',
        label: 'Pagination',
      },
      {
        slug: 'popover',
        label: 'Popover',
      },
      {
        slug: 'progress',
        label: 'Progress',
      },
      {
        slug: 'radio-group',
        label: 'RadioGroup',
      },
      {
        slug: 'resizable',
        label: 'Resizable',
      },
      {
        slug: 'scroll-area',
        label: 'ScrollArea',
      },
      {
        slug: 'select',
        label: 'Select',
      },
      {
        slug: 'separator',
        label: 'Separator',
      },
      {
        slug: 'sheet',
        label: 'Sheet',
      },
      {
        slug: 'show',
        label: 'Show',
      },
      {
        slug: 'sidebar',
        label: 'Sidebar',
      },
      {
        slug: 'skeleton',
        label: 'Skeleton',
      },
      {
        slug: 'slider',
        label: 'Slider',
      },
      {
        slug: 'sonner',
        label: 'Sonner',
      },
      {
        slug: 'spinner',
        label: 'Spinner',
      },
      {
        slug: 'switch',
        label: 'Switch',
      },
      {
        slug: 'table',
        label: 'Table',
      },
      {
        slug: 'tabs',
        label: 'Tabs',
      },
      {
        slug: 'textarea',
        label: 'Textarea',
      },
      {
        slug: 'toggle',
        label: 'Toggle',
      },
      {
        slug: 'toggle-group',
        label: 'ToggleGroup',
      },
      {
        slug: 'tooltip',
        label: 'Tooltip',
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
