/**
 * Section registry — single source of truth for the docs IA.
 *
 * Each section has sub-pages; each sub-page has wireframe blocks.
 * Section routes (`app/{slug}/`) read this config to render layouts,
 * left rails, redirects, and content. Adding a sub-page is a single
 * append to the relevant `subs` array.
 *
 * The `blocks` array is just placeholder content for now — the real
 * docs content fills in section-by-section in later phases.
 */

export type PlaceholderVariant =
  | 'default'
  | 'code'
  | 'storybook'
  | 'swatches'
  | 'diagram'
  | 'table'
  | 'tall'
  | 'hero';

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'placeholder'; variant?: PlaceholderVariant; label: string }
  | {
      type: 'row';
      blocks: { variant?: PlaceholderVariant; label: string }[];
    };

export type SubPage = {
  slug: string;
  label: string;
  /** Optional nested labels rendered inline in the left rail (non-interactive). */
  nested?: string[];
  lede: string;
  /** Wireframe-style content blocks. */
  blocks: Block[];
};

export type Section = {
  slug: string;
  title: string;
  href: string;
  subs: SubPage[];
};

export const SECTIONS = {
  'getting-started': {
    slug: 'getting-started',
    title: 'Getting Started',
    href: '/getting-started',
    subs: [
      {
        slug: 'install',
        label: 'Install',
        lede: '[ Prerequisites · package managers · workspace setup ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code block — package install commands ]',
          },
          { type: 'h2', text: '[ Prerequisites ]' },
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — Node / package manager versions ]',
          },
          { type: 'h2', text: '[ Verify install ]' },
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code block — smoke-test snippet ]',
          },
        ],
      },
      {
        slug: 'theme-setup',
        label: 'Theme setup',
        lede: '[ Wire Nexus CSS · pick a brand · enable dark mode ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code block — CSS import + Tailwind config ]',
          },
          {
            type: 'placeholder',
            variant: 'tall',
            label:
              '[ Live preview — theme swatches respond to brand/mode toggles ]',
          },
        ],
      },
      {
        slug: 'first-component',
        label: 'Your first component',
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
      {
        slug: 'designers',
        label: 'For designers',
        lede: '[ Open the Figma library · use the variables · sync via Code Connect ]',
        blocks: [
          {
            type: 'placeholder',
            label: '[ External-link list — Figma library, Code Connect docs ]',
          },
          {
            type: 'placeholder',
            variant: 'diagram',
            label: '[ Diagram — code ↔ Figma parity flow ]',
          },
        ],
      },
      {
        slug: 'agents',
        label: 'For AI agents',
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
    ],
  },
  foundations: {
    slug: 'foundations',
    title: 'Foundations',
    href: '/foundations',
    subs: [
      {
        slug: 'color',
        label: 'Color',
        nested: [
          'How color works',
          'Palette & shades',
          'Surfaces',
          'Accessibility',
        ],
        lede: '[ Engineered, not picked — OKLCH + perceptual grid + APCA gate ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'hero',
            label: '[ Hero — palette overview · all 5 bases ]',
          },
          { type: 'h2', text: '[ How color works ]' },
          {
            type: 'placeholder',
            label: '[ Body text — OKLCH pipeline narrative ]',
          },
          {
            type: 'placeholder',
            variant: 'diagram',
            label: '[ Diagram — hex → OKLCH → perceptual grid → CSS ]',
          },
          { type: 'h2', text: '[ Palette & shades ]' },
          {
            type: 'placeholder',
            variant: 'swatches',
            label: '[ Live swatches — 11-step grid × 5 bases ]',
          },
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — shade → token mapping (50 → 950) ]',
          },
          { type: 'h2', text: '[ Surfaces ]' },
          {
            type: 'placeholder',
            variant: 'diagram',
            label:
              '[ Diagram — surface and control stack (canvas / muted / control / container / popover / nav) ]',
          },
          { type: 'h2', text: '[ Accessibility ]' },
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — APCA tier thresholds per role ]',
          },
          {
            type: 'placeholder',
            variant: 'swatches',
            label: '[ Live demo — color-blind simulation toggle ]',
          },
        ],
      },
      {
        slug: 'typography',
        label: 'Typography',
        lede: '[ Type scale · 11 composite utilities ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'hero',
            label: '[ Live type scale — render every step ]',
          },
          { type: 'h2', text: '[ Utilities ]' },
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — 11 typography utilities ]',
          },
        ],
      },
      {
        slug: 'spacing',
        label: 'Spacing',
        lede: '[ Canonical step set · 6 density modes · role tokens ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'hero',
            label: '[ Live ruler — step visualizer ]',
          },
          { type: 'h2', text: '[ Density modes ]' },
          {
            type: 'placeholder',
            variant: 'tall',
            label: '[ Side-by-side — 6 modes via data-density switcher ]',
          },
          { type: 'h2', text: '[ Role tokens ]' },
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — control / container / layout ]',
          },
        ],
      },
      {
        slug: 'radius',
        label: 'Radius · Borders · Shadows',
        lede: '[ Visual primitives across modes ]',
        blocks: [
          {
            type: 'row',
            blocks: [
              { label: '[ Radius grid ]' },
              { label: '[ Border-width grid ]' },
            ],
          },
          {
            type: 'placeholder',
            variant: 'tall',
            label: '[ Shadow ramp — light + dark · 5 modes ]',
          },
        ],
      },
      {
        slug: 'layering',
        label: 'Layering',
        lede: '[ 6-token z-index scale · why popover sits above modal ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'diagram',
            label: '[ Diagram — stacking layers from overlay → max ]',
          },
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — token / value / role / consumer ]',
          },
        ],
      },
      {
        slug: 'responsive',
        label: 'Responsive',
        lede: '[ @container for components · viewport for page shell · Show/Hide primitive ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'diagram',
            label: '[ Decision tree — which mechanism when ]',
          },
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code — Show/Hide example ]',
          },
        ],
      },
    ],
  },
  components: {
    slug: 'components',
    title: 'Components',
    href: '/components',
    subs: [
      {
        slug: 'inputs',
        label: 'Inputs',
        nested: ['Button', 'Input', 'Select', 'Switch', 'Tabs'],
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
      {
        slug: 'containers',
        label: 'Containers',
        nested: ['Card', 'Dialog', 'Accordion', 'Alert'],
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
      {
        slug: 'navigation',
        label: 'Navigation',
        nested: ['DropdownMenu'],
        lede: '[ DropdownMenu · (future) NavigationMenu · Breadcrumbs ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'storybook',
            label: '[ Storybook embed ]',
          },
        ],
      },
      {
        slug: 'display',
        label: 'Display',
        nested: ['Badge', 'Avatar', 'Tooltip'],
        lede: '[ Badge · Avatar · Tooltip ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'storybook',
            label: '[ Storybook embed ]',
          },
        ],
      },
      {
        slug: 'primitives',
        label: 'Primitives',
        nested: ['Show / Hide', 'Slot'],
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
    ],
  },
  theming: {
    slug: 'theming',
    title: 'Theming',
    href: '/theming',
    subs: [
      {
        slug: 'appearance',
        label: 'Appearance',
        lede: '[ Appearance model · mode · brand · tone · contrast · density ]',
        blocks: [],
      },
      {
        slug: 'multi-brand',
        label: 'Multi-brand',
        lede: '[ Five bases × light / dark · the brand thesis ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'tall',
            label:
              '[ Live brand swapper — render a Card across base and brand modes ]',
          },
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code — base + brand selection ]',
          },
        ],
      },
      {
        slug: 'density-modes',
        label: 'Density modes',
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
      {
        slug: 'overrides',
        label: 'Consumer overrides',
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
    ],
  },
  tools: {
    slug: 'tools',
    title: 'Tools',
    href: '/tools',
    subs: [
      {
        slug: 'nx-prefix',
        label: 'nx: prefix (Tailwind)',
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
      {
        slug: 'code-connect',
        label: 'Figma Code Connect',
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
      {
        slug: 'eslint',
        label: 'ESLint plugin',
        lede: '[ @nexus/eslint-plugin · canonical-spacing-steps · class conventions ]',
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
      {
        slug: 'audits',
        label: 'Token audits',
        lede: '[ figma-parity · APCA contrast · spacing-modes · storybook-coverage ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — audit · command · exit codes · what it catches ]',
          },
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code — CI workflow snippet ]',
          },
        ],
      },
      {
        slug: 'storybook',
        label: 'Storybook',
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
    ],
  },
  guidance: {
    slug: 'guidance',
    title: 'Guidance',
    href: '/guidance',
    subs: [
      {
        slug: 'engineering',
        label: 'Engineering principles',
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
      {
        slug: 'testing',
        label: 'Testing model',
        lede: '[ Stories are tests · vitest projects · APCA at the token layer ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'diagram',
            label: '[ Diagram — what runs where (storybook / unit / audits) ]',
          },
          {
            type: 'placeholder',
            variant: 'code',
            label: '[ Code — play function example ]',
          },
        ],
      },
      {
        slug: 'contribution',
        label: 'Contribution workflow',
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
    ],
  },
  agents: {
    slug: 'agents',
    title: 'For AI agents',
    href: '/agents',
    subs: [
      {
        slug: 'llms-txt',
        label: 'llms.txt',
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
      {
        slug: 'rules-mirror',
        label: 'Rules mirror',
        lede: '[ All 17 rule files · readable on the web · always up to date ]',
        blocks: [
          {
            type: 'placeholder',
            variant: 'table',
            label: '[ Table — rule file · purpose · related ]',
          },
        ],
      },
      {
        slug: 'authoring',
        label: 'Agent authoring',
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
    ],
  },
} satisfies Record<string, Section>;

const ALL_SECTIONS = SECTIONS as Record<string, Section>;

export function getSection(slug: string): Section | undefined {
  return ALL_SECTIONS[slug];
}

export function getSubPage(
  sectionSlug: string,
  subSlug: string
): SubPage | undefined {
  return ALL_SECTIONS[sectionSlug]?.subs.find((s) => s.slug === subSlug);
}

export function getDefaultSub(sectionSlug: string): string | undefined {
  return ALL_SECTIONS[sectionSlug]?.subs[0]?.slug;
}
