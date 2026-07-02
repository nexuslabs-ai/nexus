import * as React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '../../lib/utils';

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
  'aria-invalid': ariaInvalid,
  ...props
}: SliderProps) {
  // Derive the thumb count from the controlled/uncontrolled value; fall back to
  // a two-thumb range spanning the track when neither is provided.
  const values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'nx:relative nx:flex nx:w-full nx:touch-none nx:items-center nx:select-none nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:min-h-44 nx:data-[orientation=vertical]:w-auto nx:data-[orientation=vertical]:flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="nx:relative nx:grow nx:overflow-hidden nx:rounded-full nx:bg-control-background nx:data-disabled:bg-disabled nx:data-[orientation=horizontal]:h-1.5 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="nx:absolute nx:bg-primary-background nx:data-disabled:bg-primary-disabled nx:data-[orientation=horizontal]:h-full nx:data-[orientation=vertical]:w-full"
        />
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
          className="nx:block nx:size-4 nx:shrink-0 nx:rounded-full nx:border-default nx:border-border-primary nx:bg-background nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:aria-invalid:focus-visible:outline-focus-error"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider, type SliderProps };
