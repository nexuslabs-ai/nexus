import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Spinner } from '.';

const meta = {
  title: 'Components/Spinner',
  parameters: {
    docs: {
      description: {
        component:
          'Spinner shows that something is loading. For a loading Button, use its `loading` prop.',
      },
    },
  },
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Spinner },
    template: `
      <Spinner />
    `,
  }),
};

export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Size the spinner with `nx:size-*` and tint it with `nx:text-*`.',
      },
    },
  },
  render: () => ({
    components: { Spinner },
    template: `
      <div class="nx:flex nx:items-center nx:gap-4 nx:text-foreground">
        <Spinner class="nx:size-4" />
        <Spinner class="nx:size-6" />
        <Spinner class="nx:size-8 nx:text-primary-subtle-foreground" />
      </div>
    `,
  }),
};

export const WithText: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place the spinner beside text that says what is loading.',
      },
    },
  },
  render: () => ({
    components: { Spinner },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2 nx:typography-body-default nx:text-muted-foreground">
        <Spinner class="nx:size-4" />
        Loading results…
      </div>
    `,
  }),
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Spinner },
    template: '<Spinner />',
  }),
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole('status');
    await expect(spinner).toHaveAccessibleName('Loading');
    await expect(spinner).toHaveAttribute('data-slot', 'spinner');
  },
};

export const CustomLabelAndSize: Story = {
  render: () => ({
    components: { Spinner },
    template:
      '<Spinner class="nx:size-6 nx:text-primary-subtle-foreground" aria-label="Saving changes" />',
  }),
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole('status', {
      name: 'Saving changes',
    });

    await expect(spinner).toHaveClass('nx:size-6');
    await expect(spinner).not.toHaveClass('nx:size-4');
  },
};
