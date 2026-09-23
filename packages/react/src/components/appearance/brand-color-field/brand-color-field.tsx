import type { ComponentProps } from 'react';

import { BRAND_COLOR_PRESETS } from '@nexus_ds/core';

import { normalizeHex } from '../../../lib/normalize-hex';
import { cn } from '../../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select';
import {
  NexusAppearanceColorField,
  type NexusAppearanceColorFieldProps,
} from '../color-field';

export interface NexusAppearanceBrandColorFieldProps
  extends
    Omit<ComponentProps<'div'>, 'onChange' | 'children'>,
    NexusAppearanceColorFieldProps {}

export function NexusAppearanceBrandColorField({
  value,
  onChange,
  label,
  className,
  ...props
}: NexusAppearanceBrandColorFieldProps) {
  const normalizedValue = normalizeHex(value);
  const selected = BRAND_COLOR_PRESETS.find(
    (preset) => preset.color === normalizedValue
  );

  const selectPreset = (next: string) => {
    const preset = BRAND_COLOR_PRESETS.find((option) => option.value === next);
    if (preset) onChange(preset.color);
  };

  return (
    <div
      data-slot="appearance-brand-color-field"
      className={cn(
        'nx:flex nx:max-w-full nx:flex-wrap nx:items-center nx:gap-2',
        className
      )}
      {...props}
    >
      <Select value={selected?.value ?? ''} onValueChange={selectPreset}>
        <SelectTrigger className="nx:w-36" aria-label={`${label} preset`}>
          <SelectValue placeholder="Custom" />
        </SelectTrigger>
        <SelectContent>
          {BRAND_COLOR_PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              <span className="nx:flex nx:items-center nx:gap-2">
                <span
                  aria-hidden="true"
                  className="nx:size-3 nx:shrink-0 nx:rounded-full nx:border-default nx:border-border-default"
                  style={{ backgroundColor: preset.color }}
                />
                {preset.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <NexusAppearanceColorField
        label={label}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
