import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  // The bar is full-width, so every story gets a sized container; the label
  // gives the progressbar an accessible name for the automatic a11y checks.
  args: {
    'aria-label': 'Progress',
  },
  decorators: [
    (Story) => (
      <div className="nx:w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Progress>;

// ============================================
// BASIC STORIES
// ============================================

// A typical mid-task bar.
export const Default: Story = {
  args: { value: 60 },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const Half: Story = {
  args: { value: 50 },
};

export const Full: Story = {
  args: { value: 100 },
};

// ============================================
// ATTRIBUTE TEST
// ============================================

export const WithDataAttributes: Story = {
  args: { value: 40 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar');
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );

    await expect(progress).toHaveAttribute('data-slot', 'progress');
    await expect(indicator).toHaveAttribute('data-slot', 'progress-indicator');
    // value is forwarded to the Radix root, so it reports a determinate value
    await expect(progress).toHaveAttribute('aria-valuenow', '40');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6">
      {[0, 25, 50, 75, 100].map((pct) => (
        <div key={pct} className="nx:flex nx:flex-col nx:gap-2">
          <span className="nx:text-sm nx:text-muted-foreground">{pct}%</span>
          <Progress value={pct} aria-label={`${pct}% complete`} />
        </div>
      ))}
    </div>
  ),
};
