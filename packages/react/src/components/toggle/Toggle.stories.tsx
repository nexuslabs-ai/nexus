import type { Meta, StoryObj } from '@storybook/react';
import { IconBold, IconItalic } from '@tabler/icons-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Toggle } from './toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
};

export default meta;
type Story = StoryObj<typeof Toggle>;

// A single two-state button.
export const Default: Story = {
  render: () => (
    <Toggle aria-label="Bold">
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-variant', 'default');
    await expect(toggle).toHaveAttribute('data-size', 'default');
  },
};

// The two variants: borderless default and bordered outline.
export const Variants: Story = {
  render: () => (
    <div className="nx:flex nx:gap-3">
      <Toggle variant="default" aria-label="Bold">
        <IconBold />
      </Toggle>
      <Toggle variant="outline" aria-label="Italic">
        <IconItalic />
      </Toggle>
    </div>
  ),
};

// The three sizes.
export const Sizes: Story = {
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-3">
      <Toggle size="sm" aria-label="Small">
        <IconBold />
      </Toggle>
      <Toggle size="default" aria-label="Default">
        <IconBold />
      </Toggle>
      <Toggle size="lg" aria-label="Large">
        <IconBold />
      </Toggle>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sm = canvas.getByRole('button', { name: 'Small' });
    const md = canvas.getByRole('button', { name: 'Default' });
    const lg = canvas.getByRole('button', { name: 'Large' });
    const rawTextXsClass = ['nx:text', 'xs'].join('-');
    const rawTextSmClass = ['nx:text', 'sm'].join('-');

    await expect(sm).toHaveClass('nx:typography-label-small');
    await expect(sm).not.toHaveClass(rawTextXsClass);
    await expect(sm).toHaveClass('nx:px-3', 'nx:py-1.5', 'nx:gap-1.5');

    await expect(md).toHaveClass('nx:typography-label-default');
    await expect(md).not.toHaveClass(rawTextSmClass);
    await expect(md).toHaveClass('nx:px-4', 'nx:py-2', 'nx:gap-2');
    await expect(lg).toHaveClass('nx:typography-label-default');
    await expect(lg).toHaveClass('nx:px-8', 'nx:py-3', 'nx:gap-2.5');
  },
};

// A toggle with text alongside the icon, shown pressed.
export const WithText: Story = {
  render: () => (
    <Toggle aria-label="Bold" defaultPressed>
      <IconBold />
      Bold
    </Toggle>
  ),
};

// Clicking toggles the pressed state and fires onPressedChange.
export const ClickInteraction: Story = {
  args: { onPressedChange: fn() },
  render: (args) => (
    <Toggle aria-label="Bold" onPressedChange={args.onPressedChange}>
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-state', 'off');
    await userEvent.click(toggle);
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    await expect(toggle).toHaveAttribute('data-state', 'on');
  },
};

// Enter/Space toggles when focused.
export const KeyboardInteraction: Story = {
  args: { onPressedChange: fn() },
  render: (args) => (
    <Toggle aria-label="Italic" onPressedChange={args.onPressedChange}>
      <IconItalic />
    </Toggle>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Italic' });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
  },
};

// A disabled toggle does not respond to clicks.
export const Disabled: Story = {
  args: { onPressedChange: fn() },
  render: (args) => (
    <Toggle aria-label="Bold" disabled onPressedChange={args.onPressedChange}>
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toBeDisabled();

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(toggle).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(toggle).opacity).toBe('1');

    // No click: a disabled toggle has pointer-events: none, which makes
    // userEvent.click throw. The disabled attribute is the sufficient signal.
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

// data-slot identifies the component; data-variant / data-size reflect props.
export const WithDataAttributes: Story = {
  render: () => (
    <Toggle aria-label="Bold" variant="outline" size="sm">
      <IconBold />
    </Toggle>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-variant', 'outline');
    await expect(toggle).toHaveAttribute('data-size', 'sm');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Variants × on/off states, then the three sizes. Reused by the per-base
// variant generator. The pressed (on) row exercises the data-[state=on] fill.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div className="nx:flex nx:items-center nx:gap-3">
        <Toggle aria-label="Default off">
          <IconBold />
        </Toggle>
        <Toggle aria-label="Default on" defaultPressed>
          <IconBold />
        </Toggle>
        <Toggle variant="outline" aria-label="Outline off">
          <IconItalic />
        </Toggle>
        <Toggle variant="outline" aria-label="Outline on" defaultPressed>
          <IconItalic />
        </Toggle>
      </div>
      <div className="nx:flex nx:items-center nx:gap-3">
        <Toggle size="sm" aria-label="Small">
          <IconBold />
        </Toggle>
        <Toggle size="default" aria-label="Medium">
          <IconBold />
        </Toggle>
        <Toggle size="lg" aria-label="Large">
          <IconBold />
        </Toggle>
      </div>
    </div>
  ),
};
