import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// The default spinner — a 16px glyph rotating in the current text color.
export const Default: Story = {
  render: () => <Spinner />,
};

// Sized with nx:size-* utilities; the glyph inherits currentColor, so it tints
// with nx:text-*.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:text-foreground">
      <Spinner className="nx:size-4" />
      <Spinner className="nx:size-6" />
      <Spinner className="nx:size-8 nx:text-primary-subtle-foreground" />
    </div>
  ),
};

// The spinner is a status live-region: role="status" carrying an accessible
// name, plus a data-slot hook.
export const WithDataAttributes: Story = {
  render: () => <Spinner />,
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole('status');
    await expect(spinner).toHaveAccessibleName('Loading');
    await expect(spinner).toHaveAttribute('data-slot', 'spinner');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A range of sizes, a tinted variant, and an inline "loading more" caption.
// Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:text-foreground">
      <div className="nx:flex nx:items-center nx:gap-4">
        <Spinner className="nx:size-4" />
        <Spinner className="nx:size-6" />
        <Spinner className="nx:size-8" />
      </div>
      <div className="nx:flex nx:items-center nx:gap-2 nx:text-sm nx:text-muted-foreground">
        <Spinner className="nx:size-4" />
        <span>Loading more…</span>
      </div>
    </div>
  ),
};
