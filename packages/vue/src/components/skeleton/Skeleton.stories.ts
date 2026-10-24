import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';

import { Skeleton } from '.';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton shows a pulsing placeholder where content is still loading. Use it to keep the layout steady until data arrives. For a short wait with no known layout, use Spinner.',
      },
    },
    layout: 'padded',
  },
  render: (args) => ({
    components: { Skeleton },
    setup: () => ({ args }),
    template: '<Skeleton v-bind="args" />',
  }),
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

// A composed "card is loading" layout: a media block over an avatar circle
// with heading and subtitle lines.
export const CardSkeleton: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-4">
        <Skeleton class="nx:h-40 nx:w-full nx:rounded-lg" />
        <div class="nx:flex nx:items-center nx:gap-3">
          <Skeleton class="nx:size-10 nx:rounded-full" />
          <div class="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
            <Skeleton class="nx:h-4 nx:w-1/2" />
            <Skeleton class="nx:h-3 nx:w-3/4" />
          </div>
        </div>
      </div>
    `,
  }),
};

export const Circle: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Use a round placeholder for an avatar or icon.',
      },
    },
  },
  render: () => ({
    components: { Skeleton },
    template: `
      <Skeleton class="nx:size-12 nx:rounded-full" />
    `,
  }),
};

// Stacked lines for a paragraph; the last line is shorter to mimic a ragged
// final row of text.
export const TextLines: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Stack bars of different widths to stand in for a paragraph.',
      },
    },
  },
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <Skeleton class="nx:h-4 nx:w-full" />
        <Skeleton class="nx:h-4 nx:w-full" />
        <Skeleton class="nx:h-4 nx:w-4/5" />
      </div>
    `,
  }),
};

// ============================================
// ATTRIBUTE TEST
// ============================================

export const WithDataAttributes: Story = {
  args: {
    class: 'nx:h-4 nx:w-48',
  },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-slot="skeleton"]');

    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <Skeleton class="nx:h-4 nx:w-48" />
        <Skeleton class="nx:size-12 nx:rounded-full" />
        <div class="nx:flex nx:flex-col nx:gap-2">
          <Skeleton class="nx:h-4 nx:w-full" />
          <Skeleton class="nx:h-4 nx:w-4/5" />
        </div>
        <div class="nx:flex nx:w-80 nx:flex-col nx:gap-4">
          <Skeleton class="nx:h-40 nx:w-full nx:rounded-lg" />
          <div class="nx:flex nx:items-center nx:gap-3">
            <Skeleton class="nx:size-10 nx:rounded-full" />
            <div class="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
              <Skeleton class="nx:h-4 nx:w-1/2" />
              <Skeleton class="nx:h-3 nx:w-3/4" />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};
