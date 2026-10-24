import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';

import { AspectRatio } from '.';

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  parameters: {
    docs: {
      description: {
        component:
          'AspectRatio keeps its content at a fixed width-to-height ratio. Use it for images, video, embeds and maps. AspectRatio fills its parent width, so place it in a sized container.',
      },
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

// A 16:9 box — the most common media ratio. AspectRatio fills its parent's
// width, so wrap it in a sized container.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { AspectRatio },
    template: `
      <div class="nx:w-80">
        <AspectRatio :ratio="16 / 9">
          <div class="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
            16 / 9
          </div>
        </AspectRatio>
      </div>
    `,
  }),
};

export const Ratios: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Compare square, 4:3 and 16:9 boxes side by side.',
      },
    },
  },
  render: () => ({
    components: { AspectRatio },
    template: `
      <div class="nx:flex nx:items-start nx:gap-4">
        <div class="nx:w-40">
          <AspectRatio :ratio="1">
            <div class="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
              1 / 1
            </div>
          </AspectRatio>
        </div>
        <div class="nx:w-40">
          <AspectRatio :ratio="4 / 3">
            <div class="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
              4 / 3
            </div>
          </AspectRatio>
        </div>
        <div class="nx:w-56">
          <AspectRatio :ratio="16 / 9">
            <div class="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
              16 / 9
            </div>
          </AspectRatio>
        </div>
      </div>
    `,
  }),
};

// The wrapper carries a data-slot hook.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { AspectRatio },
    template: `
      <div class="nx:w-80">
        <AspectRatio :ratio="16 / 9">
          <div class="nx:size-full nx:rounded-md nx:bg-muted" />
        </AspectRatio>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="aspect-ratio"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { AspectRatio },
    template: `
      <div class="nx:flex nx:items-start nx:gap-4">
        <div class="nx:w-40">
          <AspectRatio :ratio="1">
            <div class="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
              1 / 1
            </div>
          </AspectRatio>
        </div>
        <div class="nx:w-56">
          <AspectRatio :ratio="16 / 9">
            <div class="nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-md nx:bg-muted nx:text-muted-foreground nx:typography-label-small">
              16 / 9
            </div>
          </AspectRatio>
        </div>
      </div>
    `,
  }),
};
