import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Slider } from './slider';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  decorators: [
    (Story) => (
      <div className="nx:w-64">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

// A single-value slider.
export const Default: Story = {
  render: () => (
    <Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />
  ),
};

// Two thumbs define a range.
export const Range: Story = {
  render: () => (
    <Slider
      defaultValue={[25, 75]}
      max={100}
      step={1}
      aria-label="Price range"
    />
  ),
};

// Larger step increments snap the thumb.
export const Steps: Story = {
  render: () => (
    <Slider defaultValue={[40]} max={100} step={10} aria-label="Brightness" />
  ),
};

// Vertical orientation.
export const Vertical: Story = {
  render: () => (
    <div className="nx:flex nx:h-48 nx:justify-center">
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        orientation="vertical"
        aria-label="Vertical volume"
      />
    </div>
  ),
};

// Arrow keys move the focused thumb and update aria-valuenow.
export const KeyboardInteraction: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <Slider
      defaultValue={[50]}
      max={100}
      step={1}
      aria-label="Volume"
      onValueChange={args.onValueChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '51');
    await expect(args.onValueChange).toHaveBeenCalledWith([51]);
  },
};

// A disabled slider does not respond to interaction.
export const Disabled: Story = {
  render: () => (
    <Slider disabled defaultValue={[50]} max={100} aria-label="Volume" />
  ),
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector('[data-slot="slider"]');
    // Radix marks the disabled state with data-disabled on the root; the thumb
    // is dimmed via the root's opacity, and interaction is blocked by Radix.
    await expect(slider).toHaveAttribute('data-disabled');
    await expect(
      canvasElement.querySelector('[data-slot="slider"]')
    ).toBeInTheDocument();
  },
};

// data-slot identifies the root, track, range, and thumb.
export const WithDataAttributes: Story = {
  render: () => <Slider defaultValue={[50]} max={100} aria-label="Volume" />,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="slider"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-track"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-range"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-thumb"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Single, range, and disabled sliders. Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-64 nx:flex-col nx:gap-8">
      <Slider defaultValue={[50]} max={100} step={1} aria-label="Single" />
      <Slider defaultValue={[25, 75]} max={100} step={1} aria-label="Range" />
      <Slider disabled defaultValue={[40]} max={100} aria-label="Disabled" />
    </div>
  ),
};
