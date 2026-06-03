import * as React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

/**
 * SliderProps
 *
 * Props for the Slider component.
 */
interface SliderProps extends React.ComponentProps<
  typeof SliderPrimitive.Root
> {}

/**
 * Slider
 *
 * A value / range slider built on Radix Slider. Renders one thumb per value, so
 * a single `defaultValue={[50]}` is a value slider and `defaultValue={[25, 75]}`
 * is a range slider. Supports steps, keyboard, and vertical orientation.
 *
 * @example
 * ```tsx
 * <Slider defaultValue={[50]} max={100} step={1} />
 * <Slider defaultValue={[25, 75]} max={100} step={1} />
 * ```
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: SliderProps) {
  // Derive the thumb count from the controlled/uncontrolled value; fall back to
  // a two-thumb range spanning the track when neither is provided.
  const values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'nx:relative nx:flex nx:w-full nx:touch-none nx:items-center nx:select-none nx:data-[disabled]:opacity-50 nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:min-h-44 nx:data-[orientation=vertical]:w-auto nx:data-[orientation=vertical]:flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="nx:relative nx:grow nx:overflow-hidden nx:rounded-full nx:bg-muted nx:data-[orientation=horizontal]:h-1.5 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="nx:absolute nx:bg-primary-background nx:data-[orientation=horizontal]:h-full nx:data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          // Radix names the thumb (role="slider") from its own aria-label, not
          // the Root's — forward it to the thumb (and keep it off the role-less
          // Root span, where it would be a prohibited ARIA attribute).
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className="nx:block nx:size-4 nx:shrink-0 nx:rounded-full nx:border nx:border-border-primary nx:bg-background nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider, type SliderProps };
