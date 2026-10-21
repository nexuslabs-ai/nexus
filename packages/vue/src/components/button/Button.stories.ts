import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconArrowRight, IconPlus } from '@tabler/icons-vue';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';

import { Button } from '.';

const VARIANTS = [
  'default',
  'error',
  'destructive',
  'outline',
  'dashed',
  'secondary',
  'ghost',
  'link',
] as const;

// `click` falls through to the native element, so it is not a declared prop.
type ButtonArgs = InstanceType<typeof Button>['$props'] & {
  onClick: Mock<(event: MouseEvent) => void>;
};

const meta = {
  title: 'Components/Button',
  parameters: {
    docs: {
      description: {
        component:
          'Button triggers an action. Use it for short, visible labels.\n\n- Use one decorative icon slot at most: `#start-icon` or `#end-icon`.\n- A loading button shows only a spinner and hides its icons.\n- Icon-only buttons need `aria-label` or `aria-labelledby`.',
      },
    },
  },
  component: Button,
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon-sm', 'icon', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Save changes</Button>',
  }),
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Button },
    template: `
      <Button>Save changes</Button>
    `,
  }),
};

export const IconOnlySizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Square sizes for an icon on its own. Give each one an `aria-label`.',
      },
    },
  },
  render: () => ({
    components: { Button, IconPlus },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Button size="icon-sm" variant="outline" aria-label="Add item"><IconPlus /></Button>
        <Button size="icon" variant="outline" aria-label="Add item"><IconPlus /></Button>
        <Button size="icon-lg" variant="outline" aria-label="Add item"><IconPlus /></Button>
      </div>
    `,
  }),
};

export const StartIconSlot: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'The `#start-icon` slot places a decorative icon before the label.',
      },
    },
  },
  render: () => ({
    components: { Button, IconPlus },
    template: `
      <Button>
        <template #start-icon><IconPlus /></template>
        New project
      </Button>
    `,
  }),
};

export const EndIconSlot: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'The `#end-icon` slot places a decorative icon after the label.',
      },
    },
  },
  render: () => ({
    components: { Button, IconArrowRight },
    template: `
      <Button variant="outline">
        Continue
        <template #end-icon><IconArrowRight /></template>
      </Button>
    `,
  }),
};

export const AllVariants: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Button },
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="dashed">Dashed</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="error">Error</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { Button, IconPlus },
    template: `
      <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon-sm" aria-label="Add"><IconPlus /></Button>
        <Button size="icon" aria-label="Add"><IconPlus /></Button>
        <Button size="icon-lg" aria-label="Add"><IconPlus /></Button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iconButtons = canvas.getAllByRole('button', { name: 'Add' });

    for (const button of iconButtons) {
      await expect(button).toHaveAttribute('data-icon-only', 'true');
    }
    await expect(
      canvas.getByRole('button', { name: 'Small' })
    ).not.toHaveAttribute('data-icon-only');
  },
};

export const WithStartIcon: Story = {
  render: (args) => ({
    components: { Button, IconPlus },
    setup: () => ({ args }),
    template: `
      <Button v-bind="args">
        <template #start-icon><IconPlus /></template>
        New project
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'New project',
    });
    const icon = button.querySelector('[data-slot="button-start-icon"]');

    await expect(icon).toHaveAttribute('aria-hidden', 'true');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });
    const label = button.querySelector('[data-slot="button-loading-label"]');

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('data-loading', 'true');
    await expect(
      button.querySelector('[data-slot="spinner"]')
    ).toBeInTheDocument();
    await expect(label).toHaveClass('nx:opacity-0');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');

    await userEvent.click(button);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="nx:flex nx:gap-2">
        <Button>Default attrs</Button>
        <Button variant="secondary" size="lg">Explicit attrs</Button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaults = canvas.getByRole('button', { name: 'Default attrs' });
    const explicit = canvas.getByRole('button', { name: 'Explicit attrs' });

    await expect(defaults).toHaveAttribute('data-slot', 'button');
    await expect(defaults).toHaveAttribute('data-variant', 'default');
    await expect(defaults).toHaveAttribute('data-size', 'default');
    await expect(defaults).toHaveAttribute('type', 'button');
    await expect(explicit).toHaveAttribute('data-variant', 'secondary');
    await expect(explicit).toHaveAttribute('data-size', 'lg');
  },
};

export const AsChild: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button as-child variant="outline">
        <a href="#docs">Read the docs</a>
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Read the docs',
    });

    await expect(link).toHaveAttribute('data-slot', 'button');
    await expect(link).toHaveAttribute('data-variant', 'outline');
    await expect(link).not.toHaveAttribute('type');
  },
};

export const DisabledAsChild: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button as-child disabled>
        <a href="#docs">Read the docs</a>
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Read the docs',
    });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
  },
};

export const DisabledAsAnchor: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button as="a" href="#docs" disabled>Read the docs</Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Read the docs',
    });

    await expect(link).not.toHaveAttribute('type');
    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
  },
};
