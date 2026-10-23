import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-vue';
import { expect, within } from 'storybook/test';

import { Spinner } from '../spinner';

import { Badge } from '.';

const VARIANTS = [
  'default',
  'secondary',
  'error',
  'warning',
  'success',
  'information',
] as const;
const FILLS = ['solid', 'light', 'outline'] as const;

// `nx:h-6` / `nx:w-6` at `density: default`.
const BADGE_SIZE_PX = 24;
// `nx:size-3.5` icon slot.
const BADGE_ICON_SIZE_PX = 14;

const meta = {
  title: 'Components/Badge',
  parameters: {
    docs: {
      description: {
        component:
          "Badge labels an item with a short status, category or count. It is not interactive. Pair a status color with text or an icon, because color alone doesn't carry meaning.",
      },
    },
  },
  component: Badge,
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    fill: { control: 'select', options: FILLS },
    isCaps: { control: 'boolean' },
    isNumber: { control: 'boolean' },
  },
  render: (args) => ({
    components: { Badge },
    setup: () => ({ args }),
    template: '<Badge v-bind="args">Active</Badge>',
  }),
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Badge },
    template: `
      <Badge>Badge</Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Badge');

    await expect(badge).toHaveAttribute('data-variant', 'default');
    await expect(badge).toHaveAttribute('data-fill', 'solid');
    await expect(badge).toHaveAttribute('data-caps', 'true');
  },
};

export const WithRightIcon: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a trailing icon with the `#right-icon` slot.',
      },
    },
  },
  render: () => ({
    components: { Badge, IconX },
    template: `
      <Badge variant="secondary" :is-caps="false">
        Dismiss
        <template #right-icon><IconX /></template>
      </Badge>
    `,
  }),
};

export const IconOnly: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show only an icon, named for screen readers with `aria-label`.',
      },
    },
  },
  globals: { density: 'default' },
  render: () => ({
    components: { Badge, IconCheck },
    template: `
      <Badge variant="success" fill="light" aria-label="Approved">
        <template #left-icon><IconCheck /></template>
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('img', { name: 'Approved' });
    const svg = badge.querySelector('svg');
    const rect = badge.getBoundingClientRect();

    if (!(svg instanceof SVGElement)) {
      throw new Error('Expected icon-only badge to render an SVG icon.');
    }

    const svgRect = svg.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-icon-only', 'true');
    expect(badge.textContent).toBe('');
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThanOrEqual(BADGE_SIZE_PX);
    expect(Math.round(svgRect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(svgRect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const StatusWithIcons: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Pair each status color with text and a suggested icon, so status never relies on color alone.',
      },
    },
  },
  render: () => ({
    components: {
      Badge,
      IconAlertCircle,
      IconAlertTriangle,
      IconCircleCheck,
      IconInfoCircle,
    },
    template: `
      <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
        <Badge variant="success" fill="light" :is-caps="false">
          <template #left-icon><IconCircleCheck /></template>
          Success
        </Badge>
        <Badge variant="warning" fill="light" :is-caps="false">
          <template #left-icon><IconAlertTriangle /></template>
          Warning
        </Badge>
        <Badge variant="error" fill="light" :is-caps="false">
          <template #left-icon><IconAlertCircle /></template>
          Error
        </Badge>
        <Badge variant="information" fill="light" :is-caps="false">
          <template #left-icon><IconInfoCircle /></template>
          Info
        </Badge>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare every `variant` and `fill` in caps and sentence case.',
      },
    },
  },
  render: () => ({
    components: { Badge, IconCheck, IconX, Spinner },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Solid Fill (Caps)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default">Label</Badge>
            <Badge variant="secondary">Label</Badge>
            <Badge variant="error">Label</Badge>
            <Badge variant="warning">Label</Badge>
            <Badge variant="success">Label</Badge>
            <Badge variant="information">Label</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Solid Fill (Sentence)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" :is-caps="false">Label</Badge>
            <Badge variant="secondary" :is-caps="false">Label</Badge>
            <Badge variant="error" :is-caps="false">Label</Badge>
            <Badge variant="warning" :is-caps="false">Label</Badge>
            <Badge variant="success" :is-caps="false">Label</Badge>
            <Badge variant="information" :is-caps="false">Label</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Light Fill (Caps)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" fill="light">Label</Badge>
            <Badge variant="secondary" fill="light">Label</Badge>
            <Badge variant="error" fill="light">Label</Badge>
            <Badge variant="warning" fill="light">Label</Badge>
            <Badge variant="success" fill="light">Label</Badge>
            <Badge variant="information" fill="light">Label</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Light Fill (Sentence)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" fill="light" :is-caps="false">Label</Badge>
            <Badge variant="secondary" fill="light" :is-caps="false">Label</Badge>
            <Badge variant="error" fill="light" :is-caps="false">Label</Badge>
            <Badge variant="warning" fill="light" :is-caps="false">Label</Badge>
            <Badge variant="success" fill="light" :is-caps="false">Label</Badge>
            <Badge variant="information" fill="light" :is-caps="false">Label</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Outline Fill (Caps)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" fill="outline">Default</Badge>
            <Badge variant="secondary" fill="outline">Secondary</Badge>
            <Badge variant="error" fill="outline">Error</Badge>
            <Badge variant="warning" fill="outline">Warning</Badge>
            <Badge variant="success" fill="outline">Success</Badge>
            <Badge variant="information" fill="outline">Info</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Outline Fill (Sentence)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" fill="outline" :is-caps="false">Default</Badge>
            <Badge variant="secondary" fill="outline" :is-caps="false">Secondary</Badge>
            <Badge variant="error" fill="outline" :is-caps="false">Error</Badge>
            <Badge variant="warning" fill="outline" :is-caps="false">Warning</Badge>
            <Badge variant="success" fill="outline" :is-caps="false">Success</Badge>
            <Badge variant="information" fill="outline" :is-caps="false">Info</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Number Badges</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" is-number>8</Badge>
            <Badge variant="secondary" is-number>8</Badge>
            <Badge variant="error" is-number>8</Badge>
            <Badge variant="warning" is-number>8</Badge>
            <Badge variant="success" is-number>8</Badge>
            <Badge variant="information" is-number>8</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Icon Only</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="success" fill="light" aria-label="Approved"><template #left-icon><IconCheck /></template></Badge>
            <Badge variant="default" fill="solid" aria-label="Verified"><template #left-icon><IconCheck /></template></Badge>
            <Badge variant="error" fill="outline" aria-label="Error"><template #right-icon><IconX /></template></Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">With Icons</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="default" :is-caps="false"><template #left-icon><IconCheck /></template>Label</Badge>
            <Badge variant="success" :is-caps="false"><template #left-icon><IconCheck /></template>Label</Badge>
            <Badge variant="error" :is-caps="false"><template #right-icon><IconX /></template>Label</Badge>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">With SVG Loader</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Badge variant="information" fill="outline" :is-caps="false">
              <template #left-icon><Spinner role="presentation" aria-hidden="true" :aria-label="undefined" /></template>
              Loading
            </Badge>
            <Badge variant="information" fill="light" :is-caps="false">
              <template #left-icon><Spinner role="presentation" aria-hidden="true" :aria-label="undefined" /></template>
              Syncing
            </Badge>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Badge },
    template:
      '<Badge variant="success" fill="light" :is-caps="false">Status</Badge>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');

    await expect(badge).toHaveAttribute('data-slot', 'badge');
    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'light');
    await expect(badge).toHaveAttribute('data-caps', 'false');
  },
};

export const OutlineFill: Story = {
  render: () => ({
    components: { Badge },
    template: '<Badge variant="success" fill="outline">Outline</Badge>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Outline');
    const badgeStyles = getComputedStyle(badge);

    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'outline');
    // Assert the rendered result (opaque fill + visible border), not the
    // utility class names — class names are implementation detail and mergeable.
    expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(badgeStyles.borderTopWidth)).toBeGreaterThan(0);
  },
};

export const Caps: Story = {
  globals: { density: 'default' },
  render: () => ({
    components: { Badge },
    template: '<Badge is-caps>Label</Badge>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Label');
    const rect = badge.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-caps', 'true');
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
  },
};

const GEOMETRY_VARIANTS = VARIANTS;
const GEOMETRY_FILLS = FILLS;
const GEOMETRY_SHAPES = [
  { shape: 'caps', isSquare: false, props: {}, icon: false, label: 'Label' },
  {
    shape: 'sentence',
    isSquare: false,
    props: { isCaps: false },
    icon: false,
    label: 'Label',
  },
  {
    shape: 'icon + label',
    isSquare: false,
    props: { isCaps: false },
    icon: true,
    label: 'Label',
  },
  {
    shape: 'icon-only',
    isSquare: true,
    props: { 'aria-label': 'Approved' },
    icon: true,
    label: '',
  },
  {
    shape: 'number',
    isSquare: true,
    props: { isNumber: true },
    icon: false,
    label: 8,
  },
];

export const Geometry: Story = {
  tags: ['!autodocs'],
  globals: { density: 'default', stroke: 'strong' },
  render: () => ({
    components: { Badge, IconCheck },
    setup: () => ({
      variants: GEOMETRY_VARIANTS,
      fills: GEOMETRY_FILLS,
      shapes: GEOMETRY_SHAPES,
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-2">
        <template v-for="variant in variants" :key="variant">
          <div v-for="fill in fills" :key="variant + '-' + fill" class="nx:flex nx:items-center nx:gap-2">
            <Badge
              v-for="{ shape, isSquare, props, icon, label } in shapes"
              :key="shape"
              :data-shape="shape"
              :data-square="isSquare || undefined"
              :variant="variant"
              :fill="fill"
              v-bind="props"
            >
              <template v-if="icon" #left-icon><IconCheck /></template>
              {{ label }}
            </Badge>
          </div>
        </template>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const badges = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="badge"]'
    );

    await expect(badges).toHaveLength(
      GEOMETRY_VARIANTS.length * GEOMETRY_FILLS.length * GEOMETRY_SHAPES.length
    );
    for (const badge of badges) {
      const rect = badge.getBoundingClientRect();
      const label = `${badge.dataset.variant} / ${badge.dataset.fill} / ${badge.dataset.shape}`;

      expect(Math.round(rect.height), label).toBe(BADGE_SIZE_PX);
      if (badge.hasAttribute('data-square'))
        expect(Math.round(rect.width), label).toBe(BADGE_SIZE_PX);
    }
  },
};

export const WithCustomClassName: Story = {
  render: () => ({
    components: { Badge },
    template: '<Badge class="nx:mt-2">Custom</Badge>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Custom');

    await expect(badge).toHaveClass('nx:mt-2');
  },
};

export const WithBothIcons: Story = {
  render: () => ({
    components: { Badge, IconCheck, IconX },
    template: `
      <Badge variant="default" :is-caps="false">
        <template #left-icon><IconCheck /></template>
        Status
        <template #right-icon><IconX /></template>
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');
    const svgs = badge.querySelectorAll('svg');

    await expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      const rect = svg.getBoundingClientRect();

      expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
      expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
    }
  },
};

export const WithSvgLoader: Story = {
  render: () => ({
    components: { Badge, Spinner },
    template: `
      <Badge variant="information" fill="outline" :is-caps="false">
        <template #left-icon><Spinner role="presentation" aria-hidden="true" :aria-label="undefined" /></template>
        Loading
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Loading');
    const spinner = badge.querySelector('[data-slot="spinner"]');

    if (!(spinner instanceof SVGElement)) {
      throw new Error('Expected loader badge to render a Spinner SVG.');
    }

    const rect = spinner.getBoundingClientRect();

    await expect(spinner).toHaveAttribute('role', 'presentation');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await expect(spinner).not.toHaveAttribute('aria-label');
    expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const NumberBadgeHighValue: Story = {
  globals: { density: 'default' },
  render: () => ({
    components: { Badge },
    template: '<Badge is-number variant="error">99+</Badge>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('99+');
    const rect = badge.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-number', 'true');
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThan(BADGE_SIZE_PX);
  },
};

export const NumberBadgeIgnoresIcons: Story = {
  render: () => ({
    components: { Badge, IconCheck, IconX },
    template: `
      <Badge is-number>
        <template #left-icon><IconCheck /></template>
        5
        <template #right-icon><IconX /></template>
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('5');

    // Number mode wins over icons.
    await expect(badge).toHaveAttribute('data-number', 'true');
    await expect(badge.querySelectorAll('svg')).toHaveLength(0);
  },
};

export const LongContent: Story = {
  render: () => ({
    components: { Badge },
    template: '<Badge :is-caps="false">This is a very long badge text</Badge>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('This is a very long badge text');

    await expect(badge).toBeInTheDocument();
  },
};

export const IconOnlyWithConditionalLabel: Story = {
  render: () => ({
    components: { Badge, IconCheck },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Badge aria-label="Approved">
          <template #left-icon><IconCheck /></template>
          <span v-if="false">Approved</span>
        </Badge>
        <Badge aria-label="Approved">
          <template #left-icon><IconCheck /></template>
          {{ '' }}
        </Badge>
        <Badge aria-label="Approved">
          <template #left-icon><IconCheck /></template>
          {{ ' ' }}
        </Badge>
        <Badge aria-label="Approved">
          <template #left-icon><IconCheck /></template>
          <template v-for="label in []" :key="label">{{ label }}</template>
        </Badge>
        <Badge aria-label="Approved">
          <template #left-icon><IconCheck /></template>
          <template v-for="label in [' ']" :key="label">{{ label }}</template>
        </Badge>
        <Badge data-testid="label-badge">
          <template #left-icon><IconCheck /></template>
          {{ 0 }}
        </Badge>
        <Badge data-testid="label-badge">
          <template #left-icon><IconCheck /></template>
          <template v-for="label in ['Approved']" :key="label">{{ label }}</template>
        </Badge>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iconOnlyBadges = canvas.getAllByRole('img', { name: 'Approved' });
    const [zeroBadge, fragmentBadge] = canvas.getAllByTestId('label-badge');

    await expect(iconOnlyBadges).toHaveLength(5);
    for (const badge of iconOnlyBadges) {
      await expect(badge).toHaveAttribute('data-icon-only', 'true');
    }
    await expect(zeroBadge).toHaveTextContent('0');
    await expect(fragmentBadge).toHaveTextContent('Approved');
    for (const badge of [zeroBadge, fragmentBadge]) {
      await expect(badge).not.toHaveAttribute('data-icon-only');
    }
  },
};
