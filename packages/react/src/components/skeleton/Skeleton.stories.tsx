import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
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
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// ============================================
// BASIC STORIES
// ============================================

// A single bar — shape and size come from consumer utilities.
export const Default: Story = {
  args: {
    className: 'nx:h-4 nx:w-48',
  },
};

// A composed "card is loading" layout: a media block over an avatar circle
// with heading and subtitle lines.
export const CardSkeleton: Story = {
  tags: ['docs'],
  render: () => (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-4">
      <Skeleton className="nx:h-40 nx:w-full nx:rounded-lg" />
      <div className="nx:flex nx:items-center nx:gap-3">
        <Skeleton className="nx:size-10 nx:rounded-full" />
        <div className="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
          <Skeleton className="nx:h-4 nx:w-1/2" />
          <Skeleton className="nx:h-3 nx:w-3/4" />
        </div>
      </div>
    </div>
  ),
};

// A circular placeholder for an avatar or icon.
export const Circle: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Use a round placeholder for an avatar or icon.',
      },
    },
  },
  args: {
    className: 'nx:size-12 nx:rounded-full',
  },
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
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Skeleton className="nx:h-4 nx:w-full" />
      <Skeleton className="nx:h-4 nx:w-full" />
      <Skeleton className="nx:h-4 nx:w-4/5" />
    </div>
  ),
};

// ============================================
// ATTRIBUTE TEST
// ============================================

export const WithDataAttributes: Story = {
  args: {
    className: 'nx:h-4 nx:w-48',
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
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      <Skeleton className="nx:h-4 nx:w-48" />
      <Skeleton className="nx:size-12 nx:rounded-full" />
      <div className="nx:flex nx:flex-col nx:gap-2">
        <Skeleton className="nx:h-4 nx:w-full" />
        <Skeleton className="nx:h-4 nx:w-4/5" />
      </div>
      <div className="nx:flex nx:w-80 nx:flex-col nx:gap-4">
        <Skeleton className="nx:h-40 nx:w-full nx:rounded-lg" />
        <div className="nx:flex nx:items-center nx:gap-3">
          <Skeleton className="nx:size-10 nx:rounded-full" />
          <div className="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
            <Skeleton className="nx:h-4 nx:w-1/2" />
            <Skeleton className="nx:h-3 nx:w-3/4" />
          </div>
        </div>
      </div>
    </div>
  ),
};
