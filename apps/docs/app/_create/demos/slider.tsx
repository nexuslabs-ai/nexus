'use client';
import type * as React from 'react';
import { useState } from 'react';

import { Slider, type SliderProps } from '@nexus_ds/react';

import { cn } from '../../../../../packages/react/src/lib/utils';
function SliderControlRow({
  className,
  defaultValue,
  disabled,
  formatValue,
  label,
  max = 100,
  min = 0,
  step = 1,
  valueLabel,
  ...props
}: SliderControlRowProps) {
  const [sliderValue, setSliderValue] = useState(
    Array.isArray(defaultValue) ? defaultValue : [min]
  );
  const currentValue = sliderValue[0] ?? min;
  const displayValue =
    valueLabel ?? formatValue?.(currentValue) ?? String(currentValue);

  return (
    <div className="nx:relative nx:h-8 nx:w-full">
      <Slider
        {...props}
        disabled={disabled}
        max={max}
        min={min}
        onValueChange={setSliderValue}
        size="comfortable"
        step={step}
        value={sliderValue}
        aria-label={label}
        className={cn('nx:absolute nx:inset-0', className)}
      />
      <div
        className={cn(
          'nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-muted-foreground',
          disabled && 'nx:text-disabled-foreground'
        )}
      >
        <span className="nx:min-w-0 nx:truncate">{label}</span>
        <span className="nx:shrink-0 nx:text-right">{displayValue}</span>
      </div>
    </div>
  );
}
function formatQualityValue(value: number) {
  return qualityLabels[value] ?? String(value);
}
interface SliderControlRowProps extends Omit<
  SliderProps,
  'aria-label' | 'onValueChange' | 'size' | 'value'
> {
  formatValue?: (value: number) => string;
  label: string;
  valueLabel?: string;
}
const qualityLabels = ['Off', 'Low', 'Medium', 'High', 'Ultra'];
function Example0() {
  return <Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />;
}
function Example1() {
  return (
    <div className="nx:grid nx:w-full nx:gap-8">
      <SliderControlRow
        formatValue={String}
        label="Roundness"
        defaultValue={[2]}
        max={4}
        markers="steps"
        step={1}
      />
      <SliderControlRow
        formatValue={(value) => `${value}%`}
        label="Volume"
        defaultValue={[47]}
        max={100}
        step={1}
      />
      <SliderControlRow
        formatValue={formatQualityValue}
        label="Quality"
        defaultValue={[2]}
        max={4}
        markers="steps"
        step={1}
      />
      <SliderControlRow
        disabled
        formatValue={String}
        label="Roundness"
        defaultValue={[2]}
        max={4}
        markers="steps"
        step={1}
      />
      <Slider defaultValue={[25, 75]} max={100} step={1} aria-label="Range" />
      <div className="nx:flex nx:h-48 nx:justify-center">
        <Slider
          defaultValue={[50]}
          max={100}
          step={1}
          orientation="vertical"
          aria-label="Vertical"
        />
      </div>
    </div>
  );
}
function Example2() {
  return <Slider disabled defaultValue={[50]} max={100} aria-label="Volume" />;
}
export default function Demo() {
  return (
    <div className="nx:space-y-8 nx:max-w-full">
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Default">
        <h2 className="nx:typography-heading-small">Default</h2>
        <Example0 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="AllVariants">
        <h2 className="nx:typography-heading-small">All Variants</h2>
        <Example1 />
      </section>
      <section className="nx:space-y-4 nx:max-w-full" aria-label="Disabled">
        <h2 className="nx:typography-heading-small">Disabled</h2>
        <Example2 />
      </section>
    </div>
  );
}
