import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';
import { computed, defineComponent, type PropType, ref } from 'vue';

import { cn } from '../../lib/utils';

import { Slider } from '.';

type SliderArgs = InstanceType<typeof Slider>['$props'] & {
  'onUpdate:modelValue'?: Mock<(value: number[] | undefined) => void>;
};

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          'Slider sets a number, or a range with two thumbs, by dragging along a track or with the arrow keys. Use it for settings such as volume or brightness. Give each slider an `aria-label` or `aria-labelledby`.',
      },
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="nx:w-96"><story /></div>',
    }),
  ],
} satisfies Meta<SliderArgs>;

export default meta;
type Story = StoryObj<SliderArgs>;

const qualityLabels = ['Off', 'Low', 'Medium', 'High', 'Ultra'];

function formatQualityValue(value: number) {
  return qualityLabels[value] ?? String(value);
}

/** A comfortable slider with its label and current value drawn over the rail. */
const SliderControlRow = defineComponent({
  components: { Slider },
  props: {
    defaultValue: { type: Array as PropType<number[]>, default: undefined },
    disabled: Boolean,
    formatValue: {
      type: Function as PropType<(value: number) => string>,
      default: String,
    },
    label: { type: String, required: true },
    markers: { type: String as PropType<'steps'>, default: undefined },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    step: { type: Number, default: 1 },
  },
  setup(props) {
    const sliderValue = ref(props.defaultValue ?? [props.min]);
    const displayValue = computed(() =>
      props.formatValue(sliderValue.value[0] ?? props.min)
    );
    const overlayClass = computed(() =>
      cn(
        'nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-muted-foreground',
        props.disabled && 'nx:text-disabled-foreground'
      )
    );
    return { displayValue, overlayClass, sliderValue };
  },
  template: `
    <div class="nx:relative nx:h-8 nx:w-full">
      <Slider
        v-model="sliderValue"
        :disabled="disabled"
        :max="max"
        :min="min"
        :markers="markers"
        size="comfortable"
        :step="step"
        :aria-label="label"
        class="nx:absolute nx:inset-0"
      />
      <div :class="overlayClass">
        <span class="nx:min-w-0 nx:truncate">{{ label }}</span>
        <span class="nx:shrink-0 nx:text-right">{{ displayValue }}</span>
      </div>
    </div>
  `,
});

// A single-value segmented slider with a caret thumb.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Slider },
    template: `<Slider :default-value="[50]" :max="100" :step="1" aria-label="Volume" />`,
  }),
};

// A Fluid-inspired row with a larger segmented control surface.
export const Comfortable: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="comfortable"` for a taller rail and thumb.',
      },
    },
  },
  render: () => ({
    components: { Slider },
    template: `
      <Slider
        size="comfortable"
        :default-value="[60]"
        :max="100"
        :step="1"
        aria-label="Playback position"
      />
    `,
  }),
};

// Reference-style control rows with inline label and value text.
export const ControlRows: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Overlay a label and the current value on a comfortable slider.',
      },
    },
  },
  render: () => ({
    components: { Slider },
    setup: () => ({
      roundness: ref([2]),
      volume: ref([47]),
      quality: ref([2]),
      qualityLabels: ['Off', 'Low', 'Medium', 'High', 'Ultra'],
      locked: ref([2]),
    }),
    template: `
      <div class="nx:grid nx:w-full nx:gap-6">
        <div class="nx:relative nx:h-8 nx:w-full">
          <Slider
            v-model="roundness"
            :max="4"
            markers="steps"
            size="comfortable"
            :step="1"
            aria-label="Roundness"
            class="nx:absolute nx:inset-0"
          />
          <div class="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-muted-foreground">
            <span class="nx:min-w-0 nx:truncate">Roundness</span>
            <span class="nx:shrink-0 nx:text-right">{{ roundness[0] }}</span>
          </div>
        </div>
        <div class="nx:relative nx:h-8 nx:w-full">
          <Slider
            v-model="volume"
            :max="100"
            size="comfortable"
            :step="1"
            aria-label="Volume"
            class="nx:absolute nx:inset-0"
          />
          <div class="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-muted-foreground">
            <span class="nx:min-w-0 nx:truncate">Volume</span>
            <span class="nx:shrink-0 nx:text-right">{{ volume[0] }}%</span>
          </div>
        </div>
        <div class="nx:relative nx:h-8 nx:w-full">
          <Slider
            v-model="quality"
            :max="4"
            markers="steps"
            size="comfortable"
            :step="1"
            aria-label="Quality"
            class="nx:absolute nx:inset-0"
          />
          <div class="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-muted-foreground">
            <span class="nx:min-w-0 nx:truncate">Quality</span>
            <span class="nx:shrink-0 nx:text-right">{{ qualityLabels[quality[0]] }}</span>
          </div>
        </div>
        <div class="nx:relative nx:h-8 nx:w-full">
          <Slider
            v-model="locked"
            disabled
            :max="4"
            markers="steps"
            size="comfortable"
            :step="1"
            aria-label="Roundness"
            class="nx:absolute nx:inset-0"
          />
          <div class="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-disabled-foreground">
            <span class="nx:min-w-0 nx:truncate">Roundness</span>
            <span class="nx:shrink-0 nx:text-right">{{ locked[0] }}</span>
          </div>
        </div>
      </div>
    `,
  }),
};

// Two thumbs define a range.
export const Range: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Pass two values to select a range between two thumbs.',
      },
    },
  },
  render: () => ({
    components: { Slider },
    template: `
      <Slider :default-value="[25, 75]" :max="100" :step="1" aria-label="Price range" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const range = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-range"]'
    )!;

    await expect(range).not.toHaveAttribute('data-range-start');
    await expect(range).not.toHaveAttribute('data-range-end');
    await expect(
      Number.parseFloat(getComputedStyle(range).borderTopLeftRadius)
    ).toBe(0);
    await expect(
      Number.parseFloat(getComputedStyle(range).borderTopRightRadius)
    ).toBe(0);
  },
};

// Larger step increments snap the thumb.
export const Steps: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `step` so the thumb snaps to fixed increments.',
      },
    },
  },
  render: () => ({
    components: { Slider },
    template: `<Slider :default-value="[40]" :max="100" :step="10" aria-label="Brightness" />`,
  }),
};

// Explicit marker arrays render custom future stops through the public API.
export const ExplicitMarkers: Story = {
  render: () => ({
    components: { Slider },
    template: `
      <Slider
        :default-value="[40]"
        :max="100"
        :markers="[25, 75]"
        :step="1"
        aria-label="Custom marker slider"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const markers = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="slider-marker"]')
    );
    const marker = markers[0];

    if (!marker) throw new Error('Expected one future explicit marker.');

    const markerRect = marker.getBoundingClientRect();
    const trackRect = marker
      .closest('[data-slot="slider-track"]')!
      .getBoundingClientRect();
    const markerCenter =
      ((markerRect.left + markerRect.width / 2 - trackRect.left) /
        trackRect.width) *
      100;

    await expect(markers).toHaveLength(1);
    await expect(markerCenter).toBeGreaterThan(74);
    await expect(markerCenter).toBeLessThan(76);
  },
};

// Vertical orientation.
export const Vertical: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `orientation="vertical"` inside a parent with a set height.',
      },
    },
  },
  render: () => ({
    components: { Slider },
    template: `
      <div class="nx:flex nx:h-48 nx:justify-center">
        <Slider
          :default-value="[50]"
          :max="100"
          :step="1"
          orientation="vertical"
          aria-label="Vertical volume"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const range = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-range"]'
    )!;
    const thumb = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-thumb"]'
    )!;
    const thumbHandleStyle = getComputedStyle(thumb, '::before');

    await expect(range).toHaveAttribute('data-orientation', 'vertical');
    await expect(range).toHaveAttribute('data-range-start', 'true');
    await expect(range).not.toHaveAttribute('data-range-end');
    await expect(range).toHaveClass('nx:rounded-b-md');
    await expect(range).not.toHaveClass('nx:rounded-t-md');
    await expect(
      Number.parseFloat(getComputedStyle(range).borderTopLeftRadius)
    ).toBe(0);
    await expect(thumb).toHaveAttribute('data-orientation', 'vertical');
    await expect(getComputedStyle(thumb).height).toBe('20px');
    await expect(getComputedStyle(thumb).width).toBe('20px');
    await expect(thumbHandleStyle.height).toBe('2px');
    await expect(thumbHandleStyle.width).toBe('20px');
  },
};

// Slider ends follow the active nxds corner mode instead of staying fully pill-shaped.
export const CornerModes: Story = {
  render: () => ({
    components: { SliderControlRow },
    setup: () => ({ radii: ['square', 'subtle', 'round'] }),
    template: `
      <div class="nx:grid nx:w-full nx:gap-6">
        <div
          v-for="radius in radii"
          :key="radius"
          :data-radius="radius"
          :data-testid="'radius-' + radius"
          class="nx:grid nx:gap-2"
        >
          <span class="nx:typography-label-small nx:text-muted-foreground">{{ radius }}</span>
          <SliderControlRow
            label="Roundness"
            :default-value="[2]"
            :max="4"
            markers="steps"
            :step="1"
          />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const trackRadiusFor = (radius: string) => {
      const track = canvasElement.querySelector<HTMLElement>(
        `[data-testid="radius-${radius}"] [data-slot="slider-track"]`
      )!;

      return Number.parseFloat(getComputedStyle(track).borderTopLeftRadius);
    };
    const rangeRadiusFor = (radius: string) => {
      const range = canvasElement.querySelector<HTMLElement>(
        `[data-testid="radius-${radius}"] [data-slot="slider-range"]`
      )!;

      return Number.parseFloat(getComputedStyle(range).borderTopLeftRadius);
    };

    const squareRadius = trackRadiusFor('square');
    const subtleRadius = trackRadiusFor('subtle');
    const roundRadius = trackRadiusFor('round');
    const squareRangeRadius = rangeRadiusFor('square');
    const subtleRangeRadius = rangeRadiusFor('subtle');
    const roundRangeRadius = rangeRadiusFor('round');

    await expect(squareRadius).toBe(0);
    await expect(subtleRadius).toBeGreaterThan(squareRadius);
    await expect(roundRadius).toBeGreaterThan(subtleRadius);
    await expect(squareRangeRadius).toBe(0);
    await expect(subtleRangeRadius).toBeGreaterThan(squareRangeRadius);
    await expect(roundRangeRadius).toBeGreaterThan(subtleRangeRadius);
  },
};

// Arrow keys move the focused thumb, update aria-valuenow, and hide the step
// markers the range has passed.
export const KeyboardInteraction: Story = {
  args: { 'onUpdate:modelValue': fn() },
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args }),
    template: `
      <Slider
        size="comfortable"
        :default-value="[2]"
        :max="4"
        markers="steps"
        :step="1"
        aria-label="Roundness"
        @update:model-value="args['onUpdate:modelValue']"
      />
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider', { name: 'Roundness' });
    const getMarkers = () =>
      Array.from(
        canvasElement.querySelectorAll<HTMLElement>(
          '[data-slot="slider-marker"]'
        )
      );
    const [marker] = getMarkers();

    if (!marker) throw new Error('Expected one future step marker.');

    const markerRect = marker.getBoundingClientRect();
    const trackRect = marker
      .closest('[data-slot="slider-track"]')!
      .getBoundingClientRect();
    const markerCenter =
      ((markerRect.left + markerRect.width / 2 - trackRect.left) /
        trackRect.width) *
      100;

    await expect(getMarkers()).toHaveLength(1);
    await expect(markerCenter).toBeGreaterThan(74);
    await expect(markerCenter).toBeLessThan(76);
    await expect(marker).toHaveAttribute('aria-hidden', 'true');
    await expect(marker).toHaveAttribute('data-orientation', 'horizontal');
    await expect(marker).toHaveClass('nx:bg-muted-foreground-subtle');
    await expect(getComputedStyle(marker).height).toBe('6px');
    await expect(getComputedStyle(marker).width).toBe('6px');
    await expect(thumb).toHaveAttribute('aria-valuenow', '2');

    await userEvent.tab();
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '3');
    await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith([3]);
    await expect(getMarkers()).toHaveLength(0);
  },
};

// A disabled slider does not respond to interaction.
export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'A disabled slider uses muted colors and ignores input.',
      },
    },
  },
  render: () => ({
    components: { Slider },
    template: `<Slider disabled :default-value="[50]" :max="100" aria-label="Volume" />`,
  }),
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector('[data-slot="slider"]');
    // Reka marks disabled with data-disabled on the root; the track/range
    // recolor to semantic disabled tokens at full opacity (not a fade), and
    // Reka blocks interaction.
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

// data-slot identifies the root, track, range, marker, and thumb.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { Slider },
    template: `
      <Slider
        size="comfortable"
        :default-value="[2]"
        :max="4"
        markers="steps"
        :step="1"
        aria-label="Volume"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="slider"]');
    const track = canvasElement.querySelector('[data-slot="slider-track"]');
    const range = canvasElement.querySelector('[data-slot="slider-range"]');
    const marker = canvasElement.querySelector('[data-slot="slider-marker"]');
    const thumb = canvasElement.querySelector('[data-slot="slider-thumb"]');

    await expect(root).toHaveAttribute('data-size', 'comfortable');
    await expect(track).toHaveAttribute('data-size', 'comfortable');
    await expect(range).toHaveAttribute('data-size', 'comfortable');
    await expect(marker).toBeInTheDocument();
    await expect(marker).toHaveAttribute('data-size', 'comfortable');
    await expect(thumb).toHaveAttribute('data-size', 'comfortable');
  },
};

// aria-invalid surfaces the error focus ring on the thumb. It is forwarded to
// every role="slider" element, so a two-thumb range reddens both.
export const Invalid: Story = {
  render: () => ({
    components: { Slider },
    template: `
      <Slider
        aria-invalid="true"
        :default-value="[25, 75]"
        :max="100"
        :step="1"
        aria-label="Price range"
      />
    `,
  }),
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

// A parent-bound value moves the thumb and the markers it has passed.
export const VModel: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ roundness: ref([1]) }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Slider v-model="roundness" :max="4" markers="steps" :step="1" aria-label="Roundness" />
        <button type="button" @click="roundness = [3]">Set to 3</button>
        <output data-testid="roundness">{{ roundness[0] }}</output>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumb = canvas.getByRole('slider', { name: 'Roundness' });
    const markers = () =>
      canvasElement.querySelectorAll('[data-slot="slider-marker"]');

    await expect(markers()).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Set to 3' }));
    await expect(thumb).toHaveAttribute('aria-valuenow', '3');
    await expect(markers()).toHaveLength(0);

    thumb.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByTestId('roundness')).toHaveTextContent('2');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Reference-style rows plus range and vertical states.
export const AllVariants: Story = {
  render: () => ({
    components: { Slider, SliderControlRow },
    setup: () => ({
      formatPercent: (value: number) => `${value}%`,
      formatQualityValue,
    }),
    template: `
      <div class="nx:grid nx:w-full nx:gap-8">
        <SliderControlRow label="Roundness" :default-value="[2]" :max="4" markers="steps" :step="1" />
        <SliderControlRow
          :format-value="formatPercent"
          label="Volume"
          :default-value="[47]"
          :max="100"
          :step="1"
        />
        <SliderControlRow
          :format-value="formatQualityValue"
          label="Quality"
          :default-value="[2]"
          :max="4"
          markers="steps"
          :step="1"
        />
        <SliderControlRow
          disabled
          label="Roundness"
          :default-value="[2]"
          :max="4"
          markers="steps"
          :step="1"
        />
        <Slider :default-value="[25, 75]" :max="100" :step="1" aria-label="Range" />
        <div class="nx:flex nx:h-48 nx:justify-center">
          <Slider
            :default-value="[50]"
            :max="100"
            :step="1"
            orientation="vertical"
            aria-label="Vertical"
          />
        </div>
      </div>
    `,
  }),
};
