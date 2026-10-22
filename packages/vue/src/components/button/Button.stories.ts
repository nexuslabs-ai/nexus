import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconArrowRight,
  IconPlus,
  IconRocket,
  IconStar,
} from '@tabler/icons-vue';
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
      <Button>Button</Button>
    `,
  }),
};

export const IconOnlySizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show the three icon-only sizes, each named with `aria-label`.',
      },
    },
  },
  render: () => ({
    components: { Button, IconStar },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Button size="icon-sm" aria-label="Small icon"><IconStar /></Button>
        <Button size="icon" aria-label="Default icon"><IconStar /></Button>
        <Button size="icon-lg" aria-label="Large icon"><IconStar /></Button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Small icon' })
    ).toHaveClass('nx:size-8');
    await expect(
      canvas.getByRole('button', { name: 'Default icon' })
    ).toHaveClass('nx:size-10');
    await expect(
      canvas.getByRole('button', { name: 'Large icon' })
    ).toHaveClass('nx:size-12');
  },
};

export const StartIconSlot: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a decorative icon before the label with the `#start-icon` slot.',
      },
    },
  },
  render: () => ({
    components: { Button, IconRocket },
    template: `
      <Button>
        <template #start-icon><IconRocket data-testid="start-icon" /></template>
        Launch
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launch' });
    const startIcon = button.querySelector('[data-slot="button-start-icon"]');

    await expect(startIcon).toBeInTheDocument();
    await expect(startIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('start-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Launch');
  },
};

export const EndIconSlot: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a decorative icon after the label with the `#end-icon` slot.',
      },
    },
  },
  render: () => ({
    components: { Button, IconArrowRight },
    template: `
      <Button>
        Continue
        <template #end-icon><IconArrowRight data-testid="end-icon" /></template>
      </Button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });
    const endIcon = button.querySelector('[data-slot="button-end-icon"]');

    await expect(endIcon).toBeInTheDocument();
    await expect(endIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('end-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Continue');
  },
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Compare every variant, size, icon slot, disabled and loading state.',
      },
    },
  },
  render: () => ({
    components: { Button, IconArrowRight, IconRocket, IconStar },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Variants</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="error">Error</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="dashed">Dashed</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Sizes</h3>
          <div class="nx:flex nx:items-center nx:gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon-sm" aria-label="Small icon"><IconStar /></Button>
            <Button size="icon" aria-label="Icon"><IconStar /></Button>
            <Button size="icon-lg" aria-label="Large icon"><IconStar /></Button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Icon slots</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Button><template #start-icon><IconRocket /></template>Start icon</Button>
            <Button>End icon<template #end-icon><IconArrowRight /></template></Button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Disabled</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Button variant="default" disabled>Default</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="error" disabled>Error</Button>
            <Button variant="destructive" disabled>Destructive</Button>
            <Button variant="outline" disabled>Outline</Button>
            <Button variant="dashed" disabled>Dashed</Button>
            <Button variant="ghost" disabled>Ghost</Button>
            <Button variant="link" disabled>Link</Button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Loading</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <Button variant="default" loading>Default</Button>
            <Button variant="secondary" loading>Secondary</Button>
            <Button variant="error" loading>Error</Button>
            <Button variant="destructive" loading>Destructive</Button>
            <Button variant="outline" loading>Outline</Button>
            <Button variant="dashed" loading>Dashed</Button>
          </div>
        </div>
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
