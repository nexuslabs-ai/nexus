import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

// ============================================
// BASIC STORIES
// ============================================

// Horizontal is the default orientation — a full-width 1px rule.
export const Default: Story = {};

export const Vertical: Story = {
  // A vertical rule stretches to its parent's height — the row sets `nx:h-5`.
  render: () => (
    <div className="nx:flex nx:h-5 nx:items-center nx:gap-3 nx:text-sm nx:text-foreground">
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
      <Separator orientation="vertical" />
      <span>Issues</span>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="nx:max-w-xs nx:rounded-lg nx:border nx:border-border-default nx:bg-container nx:p-4">
      <div className="nx:flex nx:flex-col nx:gap-1">
        <span className="nx:text-sm nx:font-medium nx:text-container-foreground">
          Radix Primitives
        </span>
        <span className="nx:text-sm nx:text-muted-foreground">
          An open-source UI component library.
        </span>
      </div>
      <Separator className="nx:my-4" />
      <div className="nx:flex nx:h-5 nx:items-center nx:gap-3 nx:text-sm nx:text-muted-foreground">
        <span>Blog</span>
        <Separator orientation="vertical" />
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  ),
};

// ============================================
// ATTRIBUTE TESTS
// ============================================

export const WithDataAttributes: Story = {
  // `decorative={false}` exposes the semantic `separator` role — the default
  // decorative separator renders `role="none"`, so it isn't query-able by role.
  args: { decorative: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator');

    await expect(separator).toHaveAttribute('data-slot', 'separator');
    await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-6 nx:text-sm nx:text-foreground">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Horizontal</span>
        <Separator />
      </div>
      <div className="nx:flex nx:h-5 nx:items-center nx:gap-3">
        <span className="nx:text-muted-foreground">Vertical</span>
        <Separator orientation="vertical" />
        <span>before</span>
        <Separator orientation="vertical" />
        <span>after</span>
      </div>
    </div>
  ),
};
