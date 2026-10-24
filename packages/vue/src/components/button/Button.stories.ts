import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconArrowRight, IconRocket, IconStar } from '@tabler/icons-vue';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';

import { expectHeightPinned } from '../../stories/support/story-height-test-utils';

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

/** A story render that binds the story args, so `args.onClick` stays a spy. */
const labelled = (template: string) => (args: ButtonArgs) => ({
  components: { Button, IconArrowRight, IconRocket },
  setup: () => ({ args }),
  template,
});

export const Link: Story = {
  render: () => ({
    components: { Button },
    template: '<Button variant="link" data-testid="button-link">Link</Button>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Link' });

    await expect(button).toHaveClass('nx:underline-offset-4');
    await expect(button).toHaveClass('nx:hover:underline');
    await expect(button).toHaveClass('nx:border-0');
    await expect(button).toHaveClass('nx:p-0!');
    await expect(button).not.toHaveClass('nx:hover:bg-primary-subtle-hover');
    await expectHeightPinned(canvas, 'button-link', 20);
  },
};

export const Disabled: Story = {
  render: labelled('<Button v-bind="args" disabled>Disabled</Button>'),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify disabled state
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('disabled');

    // Verify onClick was not attached or callable
    // Note: Can't test click with pointer-events: none, disabled state is sufficient
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  render: labelled(`
    <Button v-bind="args" loading>
      <template #start-icon><IconRocket /></template>
      Submitting
      <template #end-icon><IconArrowRight /></template>
    </Button>
  `),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submitting' });
    const loadingLabel = button.querySelector(
      '[data-slot="button-loading-label"]'
    );

    // Loading button should be disabled
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('data-loading', 'true');
    await expect(
      button.querySelector('[data-slot="button-start-icon"]')
    ).not.toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="button-end-icon"]')
    ).not.toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="spinner"]')
    ).toBeInTheDocument();
    await expect(loadingLabel).toBeInTheDocument();
    await expect(loadingLabel).toHaveClass('nx:opacity-0');
    await expect(loadingLabel).toHaveTextContent('Submitting');
    await expect(button).toHaveAccessibleName('Submitting');

    // Click should not trigger onClick
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ClickInteraction: Story = {
  render: labelled('<Button v-bind="args">Click me</Button>'),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Button should be clickable
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Multiple clicks should increment
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardInteraction: Story = {
  render: labelled('<Button v-bind="args">Press Enter</Button>'),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).not.toHaveFocus();

    // Tab to focus
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // The ring is a real outline with a transparent 2px gap, so the gap shows
    // whatever surface the button sits on rather than an opaque page-background
    // band painted by a box-shadow.
    const focusStyles = getComputedStyle(button);
    await expect(focusStyles.outlineOffset).toBe('2px');
    await expect(focusStyles.outlineStyle).toBe('solid');
    await expect(focusStyles.outlineWidth).toBe('2px');
    await expect(focusStyles.boxShadow).toBe('none');

    // Enter triggers click
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Space triggers click
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    // Shift+Tab should blur
    await userEvent.tab({ shift: true });
    await expect(button).not.toHaveFocus();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-2">
        <Button>Default attrs</Button>
        <Button variant="secondary" size="lg">Explicit attrs</Button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button', {
      name: 'Default attrs',
    });
    const explicitButton = canvas.getByRole('button', {
      name: 'Explicit attrs',
    });

    await expect(defaultButton).toHaveAttribute('data-slot', 'button');
    await expect(defaultButton).toHaveAttribute('data-variant', 'default');
    await expect(defaultButton).toHaveAttribute('data-size', 'default');
    await expect(defaultButton).toHaveAttribute('type', 'button');
    await expect(explicitButton).toHaveAttribute('data-slot', 'button');
    await expect(explicitButton).toHaveAttribute('data-variant', 'secondary');
    await expect(explicitButton).toHaveAttribute('data-size', 'lg');
  },
};

export const AsLink: Story = {
  render: labelled(
    '<Button v-bind="args" as-child><a href="https://example.com">Visit Website</a></Button>'
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'button');
  },
};

export const DisabledAsLink: Story = {
  render: labelled(
    '<Button v-bind="args" disabled as-child><a href="#disabled-as-link">Disabled link</a></Button>'
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    // asChild disabled is best-effort: an <a> ignores native `disabled`, so
    // non-interactivity comes from aria-disabled + tabIndex=-1 + the
    // aria-disabled:pointer-events-none class (no JS click guard).
    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(link).toHaveClass('nx:aria-disabled:pointer-events-none');
    await expect(link).toHaveClass('nx:aria-disabled:opacity-100');
    await expect(link).toHaveClass('nx:aria-disabled:bg-primary-disabled');
  },
};
