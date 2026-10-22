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

export const SentenceCase: Story = {
  args: { isCaps: false },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Active');

    await expect(badge).toHaveAttribute('data-caps', 'false');
    await expect(badge).toHaveClass('nx:typography-label-default');
    await expect(badge).not.toHaveClass('nx:uppercase');
  },
};

export const NumberBadge: Story = {
  render: () => ({
    components: { Badge, IconCheck },
    template: `
      <Badge is-number variant="error" aria-label="8 unread">
        <template #left-icon><IconCheck /></template>
        8
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByLabelText('8 unread');

    await expect(badge).toHaveAttribute('data-number', 'true');
    await expect(badge).toHaveClass('nx:rounded-full', 'nx:tabular-nums');
    await expect(badge.querySelector('svg')).toBeNull();
  },
};

export const WithIcon: Story = {
  render: () => ({
    components: { Badge, IconCheck },
    template: `
      <Badge variant="success" fill="light">
        <template #left-icon><IconCheck /></template>
        Verified
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Verified');
    const icon = badge.querySelector('svg')?.parentElement;

    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(badge).not.toHaveAttribute('role');
  },
};

export const IconOnlyRole: Story = {
  render: () => ({
    components: { Badge, IconCheck },
    template: `
      <Badge variant="success" aria-label="Verified">
        <template #left-icon><IconCheck /></template>
      </Badge>
    `,
  }),
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByRole('img', { name: 'Verified' });

    await expect(badge).toHaveAttribute('data-icon-only', 'true');
    await expect(badge).toHaveClass('nx:w-6', 'nx:p-0');
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
          <template v-for="label in []" :key="label">{{ label }}</template>
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

    await expect(iconOnlyBadges).toHaveLength(3);
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

export const WithDataAttributes: Story = {
  args: { variant: 'warning', fill: 'outline' },
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Active');

    await expect(badge).toHaveAttribute('data-slot', 'badge');
    await expect(badge).toHaveAttribute('data-variant', 'warning');
    await expect(badge).toHaveAttribute('data-fill', 'outline');
    await expect(badge).toHaveAttribute('data-caps', 'true');
  },
};
