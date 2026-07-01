import * as React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

type SliderValuePosition = 'left' | 'right' | 'top' | 'bottom' | 'tooltip';

/**
 * SliderProps
 *
 * Props for the Slider component.
 */
interface SliderProps extends React.ComponentProps<
  typeof SliderPrimitive.Root
> {
  /**
   * Render step markers along the track.
   *
   * @default false
   * @example
   * ```tsx
   * <Slider defaultValue={[50]} step={10} showSteps aria-label="Volume" />
   * ```
   */
  showSteps?: boolean;
  /**
   * Render the current value beside, above, below, or above the thumb.
   *
   * @default false
   * @example
   * ```tsx
   * <Slider value={[value]} showValue valuePosition="right" />
   * ```
   */
  showValue?: boolean;
  /**
   * Where the value display appears when `showValue` is true.
   *
   * @default "left"
   */
  valuePosition?: SliderValuePosition;
  /**
   * Formats visible value labels and slider `aria-valuetext`.
   *
   * @default String
   */
  formatValue?: (value: number) => string;
  /**
   * Visible value prefix and accessible-name fallback.
   */
  label?: string;
}

interface SliderComfortableProps extends Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation'
> {
  /**
   * Controlled scalar value.
   */
  value?: number;
  /**
   * Initial scalar value for uncontrolled usage.
   *
   * @default min
   */
  defaultValue?: number;
  /**
   * Called with the scalar value whenever the slider changes.
   */
  onValueChange?: (value: number) => void;
  /**
   * Comfortable visual treatment.
   *
   * @default "pips"
   */
  variant?: 'pips' | 'scrubber';
  /**
   * Label shown inside the comfortable slider row.
   */
  label?: string;
  /**
   * Formats the visible value and slider `aria-valuetext`.
   *
   * @default String
   */
  formatValue?: (value: number) => string;
}

function getInitialSliderValues({
  value,
  defaultValue,
  min,
  max,
}: {
  value?: number[];
  defaultValue?: number[];
  min: number;
  max: number;
}) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(defaultValue)) {
    return defaultValue;
  }

  return [min, max];
}

function getStepValues(min: number, max: number, step: number) {
  if (step <= 0 || max <= min) {
    return [];
  }

  const count = Math.floor((max - min) / step);

  return Array.from({ length: count + 1 }, (_, index) => {
    const value = min + index * step;

    return Math.min(value, max);
  });
}

function getValuePercent(value: number, min: number, max: number) {
  if (max === min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
}

function SliderValueDisplay({
  values,
  label,
  formatValue,
}: {
  values: number[];
  label?: string;
  formatValue: (value: number) => string;
}) {
  const firstValue = values[0] ?? 0;
  const secondValue = values[1] ?? firstValue;
  const formattedValue =
    values.length > 1
      ? `${formatValue(firstValue)} - ${formatValue(secondValue)}`
      : formatValue(firstValue);

  return (
    <span
      data-slot="slider-value"
      className="nx:shrink-0 nx:select-none nx:tabular-nums nx:typography-label-default nx:text-muted-foreground"
    >
      {label ? `${label}: ` : null}
      {formattedValue}
    </span>
  );
}

/**
 * Slider
 *
 * A value / range slider built on Radix Slider. Renders one thumb per value, so
 * a single `defaultValue={[50]}` is a value slider and `defaultValue={[25, 75]}`
 * is a range slider. Supports step markers, value display, keyboard, and
 * vertical orientation.
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
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  showSteps = false,
  showValue = false,
  valuePosition = 'left',
  formatValue = String,
  label,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-invalid': ariaInvalid,
  ...props
}: SliderProps) {
  const isControlled = Array.isArray(value);
  const [uncontrolledValues, setUncontrolledValues] = React.useState(() =>
    getInitialSliderValues({ value, defaultValue, min, max })
  );
  const values = isControlled ? value : uncontrolledValues;
  const stepValues = showSteps ? getStepValues(min, max, step) : [];
  const showStaticValue = showValue && valuePosition !== 'tooltip';
  const valueDisplay = showStaticValue ? (
    <SliderValueDisplay
      values={values}
      label={label}
      formatValue={formatValue}
    />
  ) : null;

  const handleValueChange = React.useCallback(
    (nextValues: number[]) => {
      if (!isControlled) {
        setUncontrolledValues(nextValues);
      }

      onValueChange?.(nextValues);
    },
    [isControlled, onValueChange]
  );

  const slider = (
    <SliderPrimitive.Root
      data-slot="slider"
      value={values}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      className={cn(
        'nx:group/slider nx:relative nx:flex nx:w-full nx:cursor-pointer nx:select-none nx:items-center nx:data-disabled:cursor-default nx:data-[orientation=horizontal]:touch-pan-y nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:min-h-44 nx:data-[orientation=vertical]:w-auto nx:data-[orientation=vertical]:touch-pan-x nx:data-[orientation=vertical]:flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="nx:relative nx:grow nx:overflow-hidden nx:rounded-full nx:border-default nx:border-border-default nx:bg-control-background nx:data-disabled:border-border-disabled nx:data-disabled:bg-disabled nx:data-[orientation=horizontal]:h-2 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-2"
      >
        {stepValues.map((stepValue) => (
          <span
            aria-hidden="true"
            data-slot="slider-step"
            key={stepValue}
            className="nx:pointer-events-none nx:absolute nx:top-1/2 nx:size-1 nx:-translate-x-1/2 nx:-translate-y-1/2 nx:rounded-full nx:bg-muted-foreground nx:opacity-60 nx:data-[orientation=vertical]:left-1/2 nx:data-[orientation=vertical]:top-auto nx:data-[orientation=vertical]:-translate-x-1/2 nx:data-[orientation=vertical]:translate-y-1/2"
            style={
              orientation === 'vertical'
                ? { bottom: `${getValuePercent(stepValue, min, max)}%` }
                : { left: `${getValuePercent(stepValue, min, max)}%` }
            }
          />
        ))}
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="nx:pointer-events-none nx:absolute nx:bg-control-background-hover nx:data-disabled:bg-disabled nx:data-[orientation=horizontal]:h-full nx:data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          // Radix puts role="slider" on the thumb, not the role-less Root span:
          // forward the thumb-owned ARIA here (naming + invalid state) so it lands
          // on the right element and stays off the Root, where it'd be prohibited.
          aria-label={
            ariaLabel ??
            (label && values.length > 1
              ? `${label} ${index === 0 ? 'minimum' : 'maximum'}`
              : label)
          }
          aria-labelledby={ariaLabelledby}
          aria-invalid={ariaInvalid}
          aria-valuetext={formatValue(values[index] ?? values[0] ?? min)}
          className="nx:relative nx:z-30 nx:block nx:size-5 nx:shrink-0 nx:cursor-grab nx:rounded-full nx:border-default nx:border-border-default nx:bg-control-thumb nx:transition-[background-color,border-color,transform] nx:duration-fast nx:after:absolute nx:after:-inset-3 nx:after:cursor-grab nx:after:content-[''] nx:hover:scale-105 nx:active:cursor-grabbing nx:active:after:cursor-grabbing nx:motion-reduce:transition-none nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:data-disabled:cursor-not-allowed nx:data-disabled:border-border-disabled nx:data-disabled:bg-disabled nx:data-disabled:after:cursor-not-allowed nx:aria-invalid:focus-visible:outline-focus-error"
        >
          {showValue && valuePosition === 'tooltip' ? (
            <span
              data-slot="slider-tooltip"
              className="nx:pointer-events-none nx:absolute nx:bottom-full nx:left-1/2 nx:mb-4 nx:-translate-x-1/2 nx:rounded-lg nx:bg-popover nx:px-3 nx:py-1.5 nx:tabular-nums nx:typography-label-default nx:text-popover-foreground nx:opacity-0 nx:transition-opacity nx:duration-fast nx:before:absolute nx:before:left-1/2 nx:before:top-full nx:before:size-2 nx:before:-translate-x-1/2 nx:before:-translate-y-1/2 nx:before:rotate-45 nx:before:bg-popover nx:before:content-[''] nx:motion-reduce:transition-none nx:group-hover/slider:opacity-100 nx:group-focus-within/slider:opacity-100"
            >
              {formatValue(values[index] ?? values[0] ?? min)}
            </span>
          ) : null}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );

  if (!showStaticValue) {
    return slider;
  }

  return (
    <div
      data-slot="slider-field"
      data-value-position={valuePosition}
      className={cn(
        'nx:flex nx:gap-4',
        valuePosition === 'top' || valuePosition === 'bottom'
          ? 'nx:flex-col'
          : 'nx:items-center',
        valuePosition === 'right' && 'nx:flex-row',
        valuePosition === 'bottom' && 'nx:flex-col'
      )}
    >
      {(valuePosition === 'left' || valuePosition === 'top') && valueDisplay}
      {slider}
      {(valuePosition === 'right' || valuePosition === 'bottom') &&
        valueDisplay}
    </div>
  );
}

/**
 * SliderComfortable
 *
 * A roomier settings-row slider inspired by the Fluid Functionalism comfortable
 * examples. It uses the existing Radix slider primitive, keeps the value scalar,
 * and renders either a discrete pip rail or a continuous scrubber row.
 *
 * @example
 * ```tsx
 * <SliderComfortable label="Roundness" defaultValue={2} min={0} max={4} />
 * <SliderComfortable variant="scrubber" label="Volume" defaultValue={50} />
 * ```
 */
function SliderComfortable({
  className,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  variant = 'pips',
  label,
  formatValue = String,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: SliderComfortableProps) {
  const isControlled = typeof value === 'number';
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? min
  );
  const currentValue = isControlled ? value : uncontrolledValue;
  const values = [currentValue];
  const pipValues = variant === 'pips' ? getStepValues(min, max, step) : [];

  const handleValueChange = React.useCallback(
    (nextValues: number[]) => {
      const nextValue = nextValues[0] ?? min;

      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, min, onValueChange]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider-comfortable"
      data-variant={variant}
      value={values}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(
        'nx:group/slider-comfortable nx:relative nx:flex nx:h-10 nx:w-full nx:cursor-pointer nx:select-none nx:items-center nx:touch-pan-y nx:data-disabled:cursor-default',
        disabled && 'nx:pointer-events-none',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-comfortable-track"
        className={cn(
          'nx:relative nx:h-10 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default nx:bg-control-background nx:text-foreground nx:transition-colors nx:duration-fast nx:motion-reduce:transition-none',
          disabled &&
            'nx:border-border-disabled nx:bg-disabled nx:text-disabled-foreground'
        )}
      >
        {pipValues.map((pipValue) => (
          <span
            aria-hidden="true"
            data-slot="slider-comfortable-pip"
            key={pipValue}
            className={cn(
              'nx:pointer-events-none nx:absolute nx:top-1/2 nx:size-1 nx:-translate-x-1/2 nx:-translate-y-1/2 nx:rounded-full nx:bg-muted-foreground nx:opacity-50',
              pipValue === currentValue && 'nx:bg-control-thumb nx:opacity-90'
            )}
            style={{ left: `${getValuePercent(pipValue, min, max)}%` }}
          />
        ))}
        <SliderPrimitive.Range
          data-slot="slider-comfortable-range"
          className={cn(
            'nx:pointer-events-none nx:absolute nx:inset-y-0 nx:left-0 nx:min-w-36 nx:bg-control-background-hover',
            disabled && 'nx:bg-disabled'
          )}
        />
        <span className="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:gap-4 nx:px-5 nx:typography-label-default">
          {label ? (
            <span data-slot="slider-comfortable-label" className="nx:truncate">
              {label}
            </span>
          ) : null}
          <span
            data-slot="slider-comfortable-value"
            className="nx:ml-auto nx:shrink-0 nx:tabular-nums nx:text-muted-foreground"
          >
            {formatValue(currentValue)}
          </span>
        </span>
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-comfortable-thumb"
        aria-label={ariaLabel ?? label}
        aria-labelledby={ariaLabelledby}
        aria-valuetext={formatValue(currentValue)}
        className="nx:relative nx:z-40 nx:block nx:h-5 nx:w-0.5 nx:shrink-0 nx:cursor-grab nx:rounded-full nx:bg-control-thumb nx:transition-[background-color,transform] nx:duration-fast nx:after:absolute nx:after:-inset-5 nx:after:cursor-grab nx:after:content-[''] nx:hover:scale-y-110 nx:active:cursor-grabbing nx:active:after:cursor-grabbing nx:motion-reduce:transition-none nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:data-disabled:cursor-not-allowed nx:data-disabled:bg-disabled-foreground nx:data-disabled:after:cursor-not-allowed"
      >
        {!disabled ? (
          <span
            data-slot="slider-comfortable-tooltip"
            className="nx:pointer-events-none nx:absolute nx:bottom-full nx:left-1/2 nx:mb-3 nx:-translate-x-1/2 nx:rounded-lg nx:bg-popover nx:px-3 nx:py-1.5 nx:tabular-nums nx:typography-label-default nx:text-popover-foreground nx:opacity-0 nx:shadow-sm nx:transition-opacity nx:duration-fast nx:before:absolute nx:before:left-1/2 nx:before:top-full nx:before:size-2 nx:before:-translate-x-1/2 nx:before:-translate-y-1/2 nx:before:rotate-45 nx:before:bg-popover nx:before:content-[''] nx:motion-reduce:transition-none nx:group-hover/slider-comfortable:opacity-100 nx:group-focus-within/slider-comfortable:opacity-100"
          >
            {formatValue(currentValue)}
          </span>
        ) : null}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}

export {
  Slider,
  SliderComfortable,
  type SliderComfortableProps,
  type SliderProps,
  type SliderValuePosition,
};
