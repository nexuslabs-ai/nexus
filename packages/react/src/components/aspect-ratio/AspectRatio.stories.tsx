import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { AspectRatio } from './aspect-ratio';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

// A muted, labelled fill standing in for media across the stories.
function Placeholder({ label }: { label: string }) {
  return (
    <div className="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
      {label}
    </div>
  );
}

// A 16:9 box — the most common media ratio. AspectRatio fills its parent's
// width, so wrap it in a sized container.
export const Default: Story = {
  render: () => (
    <div className="nx:w-80">
      <AspectRatio ratio={16 / 9}>
        <Placeholder label="16 / 9" />
      </AspectRatio>
    </div>
  ),
};

// Common ratios side by side.
export const Ratios: Story = {
  render: () => (
    <div className="nx:flex nx:items-start nx:gap-4">
      <div className="nx:w-40">
        <AspectRatio ratio={1}>
          <Placeholder label="1 / 1" />
        </AspectRatio>
      </div>
      <div className="nx:w-40">
        <AspectRatio ratio={4 / 3}>
          <Placeholder label="4 / 3" />
        </AspectRatio>
      </div>
      <div className="nx:w-56">
        <AspectRatio ratio={16 / 9}>
          <Placeholder label="16 / 9" />
        </AspectRatio>
      </div>
    </div>
  ),
};

// The wrapper carries a data-slot hook.
export const WithDataAttributes: Story = {
  render: () => (
    <div className="nx:w-80">
      <AspectRatio ratio={16 / 9}>
        <Placeholder label="16 / 9" />
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="aspect-ratio"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A range of ratios with muted fills. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:items-start nx:gap-4">
      <div className="nx:w-40">
        <AspectRatio ratio={1}>
          <Placeholder label="1 / 1" />
        </AspectRatio>
      </div>
      <div className="nx:w-56">
        <AspectRatio ratio={16 / 9}>
          <Placeholder label="16 / 9" />
        </AspectRatio>
      </div>
    </div>
  ),
};
