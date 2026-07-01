import * as React from 'react';

import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Slider, SliderComfortable } from './slider';

const darkGlobals = { mode: 'dark' } as const;

const withSliderWidth: Decorator = (Story, context) => {
  const sliderWidth =
    typeof context.parameters.sliderWidth === 'string'
      ? context.parameters.sliderWidth
      : 'nx:w-64';

  return (
    <div className={sliderWidth}>
      <Story />
    </div>
  );
};

function FluidSliderShowcase({ children }: { children: React.ReactNode }) {
  return (
    <div className="nx:w-[42rem] nx:max-w-[calc(100vw-3rem)] nx:rounded-md nx:bg-background nx:px-11 nx:py-12 nx:text-foreground">
      <div className="nx:flex nx:w-full nx:flex-col nx:gap-6">{children}</div>
    </div>
  );
}

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  decorators: [withSliderWidth],
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
    <Slider
      defaultValue={[40]}
      max={100}
      step={10}
      showSteps
      aria-label="Brightness"
    />
  ),
};

// The current value can sit beside the track.
export const ValueDisplay: Story = {
  render: function ValueDisplayStory() {
    const [value, setValue] = React.useState([40]);

    return (
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
        showValue
        valuePosition="right"
        label="Volume"
      />
    );
  },
};

// Formatters keep the control numeric while displaying domain units.
export const Format: Story = {
  render: function FormatStory() {
    const [value, setValue] = React.useState([75]);

    return (
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={5}
        showValue
        valuePosition="bottom"
        label="Opacity"
        formatValue={(nextValue) => `${nextValue}%`}
      />
    );
  },
};

// Tooltip values appear above the thumb on hover or keyboard focus.
export const TooltipValue: Story = {
  render: function TooltipValueStory() {
    const [value, setValue] = React.useState([60]);

    return (
      <Slider
        value={value}
        onValueChange={setValue}
        max={100}
        step={1}
        showValue
        valuePosition="tooltip"
        aria-label="Volume"
      />
    );
  },
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
    <Slider
      disabled
      defaultValue={[50]}
      max={100}
      showValue
      valuePosition="right"
      aria-label="Volume"
    />
  ),
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector('[data-slot="slider"]');
    // Radix marks disabled with data-disabled on the root; the track/range
    // recolor to semantic disabled tokens at full opacity (not a fade), and
    // Radix blocks interaction.
    await expect(slider).toHaveAttribute('data-disabled');
    await expect(
      canvasElement.querySelector('[data-slot="slider"]')
    ).toBeInTheDocument();

    const track = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-track"]'
    )!;
    await expect(track).toHaveClass('nx:data-disabled:bg-disabled');
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider"]'
    )!;
    await expect(getComputedStyle(root).opacity).toBe('1');
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

// aria-invalid surfaces the error focus ring on the thumb. It is forwarded to
// every role="slider" element, so a two-thumb range reddens both.
export const Invalid: Story = {
  render: () => (
    <Slider
      aria-invalid
      defaultValue={[25, 75]}
      max={100}
      step={1}
      aria-label="Price range"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumbs = canvas.getAllByRole('slider');
    await expect(thumbs).toHaveLength(2);
    for (const thumb of thumbs) {
      await expect(thumb).toHaveAttribute('aria-invalid', 'true');
      await expect(thumb).toHaveClass(
        'nx:aria-invalid:focus-visible:outline-focus-error'
      );
    }
  },
};

type ComfortableStory = StoryObj<typeof SliderComfortable>;

const comfortableDecorators = [
  ((Story) => (
    <div className="nx:w-[36rem] nx:max-w-[calc(100vw-3rem)]">
      <Story />
    </div>
  )) satisfies Decorator,
];

// Pip mode creates a discrete settings-row selector.
export const Comfortable: ComfortableStory = {
  globals: darkGlobals,
  decorators: comfortableDecorators,
  render: function ComfortableStory() {
    const [value, setValue] = React.useState(2);

    return (
      <SliderComfortable
        value={value}
        onValueChange={setValue}
        min={0}
        max={4}
        step={1}
        label="Roundness"
      />
    );
  },
};

// Scrubber mode keeps the larger row but drops discrete pips.
export const ComfortableScrubber: ComfortableStory = {
  globals: darkGlobals,
  decorators: comfortableDecorators,
  render: function ComfortableScrubberStory() {
    const [value, setValue] = React.useState(50);

    return (
      <SliderComfortable
        variant="scrubber"
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={1}
        label="Volume"
        formatValue={(nextValue) => `${nextValue}%`}
      />
    );
  },
};

// Comfortable sliders also accept display formatters.
export const ComfortableFormat: ComfortableStory = {
  globals: darkGlobals,
  decorators: comfortableDecorators,
  render: function ComfortableFormatStory() {
    const [value, setValue] = React.useState(2);
    const qualityLabels = ['Low', 'Medium', 'High'];

    return (
      <SliderComfortable
        value={value}
        onValueChange={setValue}
        min={1}
        max={3}
        step={1}
        label="Quality"
        formatValue={(nextValue) => qualityLabels[nextValue - 1] ?? 'Medium'}
      />
    );
  },
};

// Disabled comfortable sliders keep their row mounted but inert.
export const ComfortableDisabled: ComfortableStory = {
  globals: darkGlobals,
  decorators: comfortableDecorators,
  render: () => (
    <SliderComfortable
      disabled
      defaultValue={2}
      min={0}
      max={4}
      step={1}
      label="Roundness"
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable"]')
    ).toHaveAttribute('data-disabled');
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable-track"]')
    ).toHaveClass('nx:bg-disabled');
  },
};

// Arrow keys operate the comfortable slider through Radix semantics.
export const ComfortableKeyboardInteraction: ComfortableStory = {
  args: { onValueChange: fn() },
  globals: darkGlobals,
  decorators: comfortableDecorators,
  render: (args) => (
    <SliderComfortable
      defaultValue={2}
      min={0}
      max={4}
      step={1}
      label="Roundness"
      onValueChange={args.onValueChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider');
    await expect(thumb).toHaveAttribute('aria-valuenow', '2');
    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '3');
    await expect(args.onValueChange).toHaveBeenCalledWith(3);
  },
};

// Comfortable data slots identify the row, track, range, thumb, label, and value.
export const ComfortableWithDataAttributes: ComfortableStory = {
  globals: darkGlobals,
  decorators: comfortableDecorators,
  render: () => (
    <SliderComfortable
      defaultValue={2}
      min={0}
      max={4}
      step={1}
      label="Roundness"
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable"]')
    ).toHaveAttribute('data-variant', 'pips');
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable-track"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable-range"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable-thumb"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable-label"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="slider-comfortable-value"]')
    ).toBeInTheDocument();
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Compact and comfortable slider examples. Reused by the per-base variant generator.
export const AllVariants: Story = {
  globals: darkGlobals,
  parameters: {
    sliderWidth: 'nx:w-auto',
  },
  render: () => (
    <FluidSliderShowcase>
      <div className="nx:grid nx:grid-cols-[3rem_minmax(0,1fr)] nx:items-center nx:gap-x-6 nx:gap-y-5">
        <span className="nx:tabular-nums nx:typography-label-default nx:text-muted-foreground">
          50
        </span>
        <Slider defaultValue={[50]} max={100} step={1} aria-label="Single" />
        <span className="nx:tabular-nums nx:typography-label-default nx:text-muted-foreground">
          50
        </span>
        <Slider
          defaultValue={[70]}
          max={100}
          step={10}
          showSteps
          showValue
          valuePosition="tooltip"
          aria-label="Stepped volume"
        />
      </div>
      <div className="nx:pt-5">
        <SliderComfortable
          defaultValue={2}
          min={0}
          max={4}
          step={1}
          label="Roundness"
        />
      </div>
      <SliderComfortable
        variant="scrubber"
        defaultValue={50}
        min={0}
        max={100}
        step={1}
        label="Volume"
        formatValue={(nextValue) => `${nextValue}%`}
      />
    </FluidSliderShowcase>
  ),
};
