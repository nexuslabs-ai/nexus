<script setup lang="ts">
import { reactiveOmit, useVModel } from '@vueuse/core';
import {
  SliderRange,
  SliderRoot,
  type SliderRootEmits,
  type SliderRootProps,
  SliderThumb,
  SliderTrack,
  useForwardProps,
} from 'reka-ui';
import { computed, type HTMLAttributes, useAttrs } from 'vue';

import { cn } from '../../lib/utils';

import {
  sliderMarkerClassName,
  sliderRangeVariants,
  sliderThumbVariants,
  type SliderTrackVariants,
  sliderTrackVariants,
  sliderVariants,
} from '.';

type SliderSize = NonNullable<SliderTrackVariants['size']>;

export interface SliderProps extends SliderRootProps {
  /**
   * Height of the rail and thumb.
   */
  size?: SliderSize;

  /**
   * Marks along the track. Pass values for custom positions, or `"steps"` for one
   * mark per step.
   */
  markers?: number[] | 'steps';
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SliderProps>(), {
  size: 'standard',
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
});
const emits = defineEmits<SliderRootEmits>();

const sliderFloatTolerance = 0.000001;

function getStepMarkerValues(min: number, max: number, step: number) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (!Number.isFinite(step) || step <= 0) return [];
  if (max <= min) return [];

  return Array.from(
    { length: Math.floor((max - min) / step) },
    (_, index) => min + step * (index + 1)
  );
}

function isMarkerCovered(marker: number, sortedValues: number[]) {
  const firstValue = sortedValues[0];

  if (firstValue === undefined) return false;

  if (sortedValues.length === 1) {
    return marker <= firstValue + sliderFloatTolerance;
  }

  const lastValue = sortedValues[sortedValues.length - 1];

  if (lastValue === undefined) return false;

  return (
    marker >= firstValue - sliderFloatTolerance &&
    marker <= lastValue + sliderFloatTolerance
  );
}

function isRangeBoundary(value: number | undefined, boundary: number) {
  return (
    value !== undefined &&
    Number.isFinite(value) &&
    Math.abs(value - boundary) <= sliderFloatTolerance
  );
}

const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue ?? [props.min],
});
const values = computed(() => model.value ?? [props.min]);

const sortedValues = computed(() =>
  [...values.value]
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)
);
const markerPositions = computed(() => {
  const valueRange = props.max - props.min;
  if (valueRange <= 0) return [];
  const markerValues =
    props.markers === 'steps'
      ? getStepMarkerValues(props.min, props.max, props.step)
      : (props.markers ?? []);
  return markerValues
    .filter(
      (marker) =>
        Number.isFinite(marker) &&
        marker > props.min &&
        marker < props.max &&
        !isMarkerCovered(marker, sortedValues.value)
    )
    .map((marker) => ((marker - props.min) / valueRange) * 100);
});
const rangeStartsAtMin = computed(
  () =>
    sortedValues.value.length <= 1 ||
    isRangeBoundary(sortedValues.value[0], props.min)
);
const rangeEndsAtMax = computed(() =>
  isRangeBoundary(sortedValues.value[sortedValues.value.length - 1], props.max)
);

// Reka puts role="slider" on each thumb, not the role-less root, so the
// thumb-owned ARIA (naming and invalid state) goes there.
const THUMB_ATTRS = ['aria-label', 'aria-labelledby', 'aria-invalid'];
const attrs = useAttrs();

function thumbAttrs() {
  return Object.fromEntries(THUMB_ATTRS.map((name) => [name, attrs[name]]));
}

function rootAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !THUMB_ATTRS.includes(name))
  );
}

const delegated = reactiveOmit(
  props,
  'class',
  'size',
  'markers',
  'modelValue',
  'defaultValue'
);
const forwarded = useForwardProps(delegated);
</script>

<template>
  <SliderRoot
    v-bind="{ ...forwarded, ...rootAttrs() }"
    :model-value="values"
    data-slot="slider"
    :data-size="size"
    :class="cn(sliderVariants, props.class)"
    @update:model-value="model = $event"
    @value-commit="emits('valueCommit', $event)"
  >
    <SliderTrack
      data-slot="slider-track"
      :data-size="size"
      :class="sliderTrackVariants({ size })"
    >
      <SliderRange
        data-slot="slider-range"
        :data-orientation="orientation"
        :data-range-end="rangeEndsAtMax ? 'true' : undefined"
        :data-range-start="rangeStartsAtMin ? 'true' : undefined"
        :data-size="size"
        :class="
          cn(
            sliderRangeVariants,
            rangeStartsAtMin &&
              (orientation === 'vertical'
                ? 'nx:rounded-b-md'
                : 'nx:rounded-l-md'),
            rangeEndsAtMax &&
              (orientation === 'vertical'
                ? 'nx:rounded-t-md'
                : 'nx:rounded-r-md')
          )
        "
      />
      <span
        v-for="(position, index) in markerPositions"
        :key="`${position}-${index}`"
        aria-hidden="true"
        :class="sliderMarkerClassName"
        :data-disabled="disabled ? '' : undefined"
        :data-orientation="orientation"
        :data-size="size"
        data-slot="slider-marker"
        :style="
          orientation === 'vertical'
            ? { bottom: `${position}%` }
            : { left: `${position}%` }
        "
      />
    </SliderTrack>
    <SliderThumb
      v-for="(_, index) in values"
      :key="index"
      v-bind="thumbAttrs()"
      data-slot="slider-thumb"
      :data-orientation="orientation"
      :data-size="size"
      :class="sliderThumbVariants({ orientation })"
    />
  </SliderRoot>
</template>
