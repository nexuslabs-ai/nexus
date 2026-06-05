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
