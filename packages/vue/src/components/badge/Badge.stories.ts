import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconArrowUpRight, IconCheck } from '@tabler/icons-vue';
import { expect, within } from 'storybook/test';

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
      <Badge>Active</Badge>
    `,
  }),
};

export const WithRightIcon: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'The `#right-icon` slot places an icon after the label.',
      },
    },
  },
  render: () => ({
    components: { Badge, IconArrowUpRight },
    template: `
      <Badge variant="success" fill="light">
        Live
        <template #right-icon><IconArrowUpRight /></template>
      </Badge>
    `,
  }),
};

export const IconOnly: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'With no label, the icon shows alone. Name it with `aria-label`.',
      },
    },
  },
  render: () => ({
    components: { Badge, IconCheck },
    template: `
      <Badge variant="success" aria-label="Verified">
        <template #left-icon><IconCheck /></template>
      </Badge>
    `,
  }),
};

export const StatusVariants: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Badge },
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-2">
        <Badge variant="success" fill="light">Paid</Badge>
        <Badge variant="warning" fill="light">Pending</Badge>
        <Badge variant="error" fill="light">Failed</Badge>
        <Badge variant="information" fill="light">Draft</Badge>
      </div>
    `,
  }),
};

export const Count: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          '`is-number` makes a round count badge. Describe the count with `aria-label`.',
      },
    },
  },
  render: () => ({
    components: { Badge },
    template: `
      <Badge is-number variant="error" aria-label="8 unread">8</Badge>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({ variants: VARIANTS, fills: FILLS }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div v-for="fill in fills" :key="fill" class="nx:flex nx:flex-wrap nx:gap-2">
          <Badge v-for="variant in variants" :key="variant" :variant="variant" :fill="fill">
            {{ variant }}
          </Badge>
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
