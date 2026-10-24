import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Separator } from '.';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          'Separator draws a thin rule between groups of content. Use `orientation="vertical"` inside a flex row with a set height. Set `:decorative="false"` when the rule marks a real boundary that screen readers should announce.',
      },
    },
    layout: 'padded',
  },
  render: (args) => ({
    components: { Separator },
    setup: () => ({ args }),
    template: '<Separator v-bind="args" />',
  }),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// BASIC STORIES
// ============================================

export const InContext: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Separator },
    template: `
      <div class="nx:max-w-xs nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-4">
        <div class="nx:flex nx:flex-col nx:gap-1">
          <span class="nx:typography-label-default nx:text-container-foreground">
            Radix Primitives
          </span>
          <span class="nx:typography-label-default nx:text-muted-foreground">
            An open-source UI component library.
          </span>
        </div>
        <Separator class="nx:my-4" />
        <div class="nx:flex nx:h-5 nx:items-center nx:gap-3 nx:typography-label-default nx:text-muted-foreground">
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Source</span>
        </div>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Divide inline links with vertical rules inside a row of fixed height.',
      },
    },
  },
  // A vertical rule stretches to its parent's height — the row sets `nx:h-5`.
  render: () => ({
    components: { Separator },
    template: `
      <div class="nx:flex nx:h-5 nx:items-center nx:gap-3 nx:typography-label-default nx:text-foreground">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Source</span>
        <Separator orientation="vertical" />
        <span>Issues</span>
      </div>
    `,
  }),
};

// ============================================
// ATTRIBUTE TESTS
// ============================================

export const WithDataAttributes: Story = {
  // `decorative: false` exposes the semantic `separator` role — the default
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
  render: () => ({
    components: { Separator },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6 nx:typography-label-default nx:text-foreground">
        <div class="nx:flex nx:flex-col nx:gap-2">
          <span class="nx:text-muted-foreground">Horizontal</span>
          <Separator />
        </div>
        <div class="nx:flex nx:h-5 nx:items-center nx:gap-3">
          <span class="nx:text-muted-foreground">Vertical</span>
          <Separator orientation="vertical" />
          <span>before</span>
          <Separator orientation="vertical" />
          <span>after</span>
        </div>
      </div>
    `,
  }),
};
