'use client';

import * as React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const sliderVariants =
  'nx:group/slider nx:relative nx:flex nx:w-full nx:touch-none nx:select-none nx:data-disabled:pointer-events-none nx:data-[orientation=horizontal]:h-8 nx:data-[orientation=horizontal]:items-center nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:min-h-44 nx:data-[orientation=vertical]:w-8 nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:justify-center';

const sliderTrackVariants = cva(
  'nx:relative nx:grow nx:overflow-hidden nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:shadow-xs nx:transition-colors nx:duration-fast nx:data-disabled:border-border-disabled nx:data-disabled:bg-disabled',
  {
    variants: {
      size: {
        standard:
          'nx:p-0.5 nx:data-[orientation=horizontal]:h-4 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-4',
        comfortable:
          'nx:p-0.5 nx:data-[orientation=horizontal]:h-8 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-8',
      },
    },
    defaultVariants: {
      size: 'standard',
    },
  }
);

const sliderRangeVariants =
  'nx:absolute nx:bg-control-background nx:bg-clip-content nx:p-0.5 nx:transition-colors nx:duration-fast nx:data-disabled:bg-disabled nx:data-[orientation=horizontal]:top-0 nx:data-[orientation=horizontal]:h-full nx:data-[orientation=vertical]:left-0 nx:data-[orientation=vertical]:w-full';

const sliderThumbVariants = cva(
  "nx:relative nx:block nx:size-5 nx:shrink-0 nx:bg-transparent nx:before:absolute nx:before:top-1/2 nx:before:left-1/2 nx:before:-translate-x-1/2 nx:before:-translate-y-1/2 nx:before:rounded-sm nx:before:bg-foreground nx:before:content-[''] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:aria-invalid:focus-visible:outline-focus-error nx:data-disabled:before:bg-disabled-foreground",
  {
    variants: {
      orientation: {
        horizontal: 'nx:before:h-5 nx:before:w-0.5',
        vertical: 'nx:before:h-0.5 nx:before:w-5',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

const sliderMarkerClassName =
  'nx:pointer-events-none nx:absolute nx:z-10 nx:size-1.5 nx:rounded-full nx:bg-muted-foreground-subtle nx:opacity-50 nx:transition-colors nx:duration-fast nx:data-disabled:bg-disabled-foreground nx:data-[orientation=horizontal]:top-1/2 nx:data-[orientation=horizontal]:-translate-x-1/2 nx:data-[orientation=horizontal]:-translate-y-1/2 nx:data-[orientation=vertical]:left-1/2 nx:data-[orientation=vertical]:-translate-x-1/2 nx:data-[orientation=vertical]:translate-y-1/2';

const sliderFloatTolerance = 0.000001;
type SliderSize = NonNullable<VariantProps<typeof sliderTrackVariants>['size']>;
type SliderMarkers = number[] | 'steps';

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

/**
 * Props for Slider.
 */
interface SliderProps extends React.ComponentProps<
  typeof SliderPrimitive.Root
> {
  /**
   * Height of the rail and thumb.
   */
  size?: SliderSize;

  /**
   * Marks along the track. Pass values for custom positions, or `"steps"` for one
   * mark per step.
   */
  markers?: SliderMarkers;
}

/**
 * Picks a value or a range. Renders one thumb per value, so `[50]` gives one
 * thumb and `[25, 75]` gives a range.
 */
const Slider = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<SliderProps>
>(function Slider(propsWithoutRef, forwardedRef) {
  const {
    className,
    size = 'standard',
    defaultValue,
    disabled,
    markers,
    value,
    min = 0,
    max = 100,
    orientation = 'horizontal',
    step = 1,
    onValueChange,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-invalid': ariaInvalid,
    ...props
  }: React.PropsWithoutRef<SliderProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    Array.isArray(defaultValue)
      ? defaultValue
      : Array.isArray(value)
        ? value
        : [min]
  );
  const isControlled = Array.isArray(value);
  const values = isControlled ? value : uncontrolledValue;
  const valueRange = max - min;
  const sortedValues = [...values]
    .filter((nextValue) => Number.isFinite(nextValue))
    .sort((a, b) => a - b);
  const markerValues =
    markers === 'steps' ? getStepMarkerValues(min, max, step) : (markers ?? []);
  const markerPositions =
    valueRange > 0
      ? markerValues
          .filter(
            (marker) =>
              Number.isFinite(marker) &&
              marker > min &&
              marker < max &&
              !isMarkerCovered(marker, sortedValues)
          )
          .map((marker) => ((marker - min) / valueRange) * 100)
      : [];
  const rangeStartValue = sortedValues[0];
  const rangeEndValue = sortedValues[sortedValues.length - 1];
  const isSingleValue = sortedValues.length <= 1;
  const rangeStartsAtMin =
    isSingleValue || isRangeBoundary(rangeStartValue, min);
  const rangeEndsAtMax = isRangeBoundary(rangeEndValue, max);

  function handleValueChange(nextValue: number[]) {
    if (!isControlled) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-size={size}
      disabled={disabled}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      step={step}
      onValueChange={handleValueChange}
      className={cn(sliderVariants, className)}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        data-size={size}
        className={sliderTrackVariants({ size })}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          data-orientation={orientation}
          data-range-end={rangeEndsAtMax ? 'true' : undefined}
          data-range-start={rangeStartsAtMin ? 'true' : undefined}
          data-size={size}
          className={cn(
            sliderRangeVariants,
            rangeStartsAtMin &&
              (orientation === 'vertical'
                ? 'nx:rounded-b-md'
                : 'nx:rounded-l-md'),
            rangeEndsAtMax &&
              (orientation === 'vertical'
                ? 'nx:rounded-t-md'
                : 'nx:rounded-r-md')
          )}
        />
        {markerPositions.map((position, index) => (
          <span
            aria-hidden="true"
            className={sliderMarkerClassName}
            data-disabled={disabled ? '' : undefined}
            data-orientation={orientation}
            data-size={size}
            data-slot="slider-marker"
            key={`${position}-${index}`}
            style={
              orientation === 'vertical'
                ? { bottom: `${position}%` }
                : { left: `${position}%` }
            }
          />
        ))}
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          // Radix puts role="slider" on the thumb, not the role-less Root span:
          // forward the thumb-owned ARIA here (naming + invalid state) so it lands
          // on the right element and stays off the Root, where it'd be prohibited.
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-invalid={ariaInvalid}
          data-orientation={orientation}
          data-size={size}
          className={sliderThumbVariants({ orientation })}
        />
      ))}
    </SliderPrimitive.Root>
  );
});

export {
  Slider,
  sliderMarkerClassName,
  type SliderProps,
  sliderRangeVariants,
  sliderThumbVariants,
  sliderTrackVariants,
  sliderVariants,
};
