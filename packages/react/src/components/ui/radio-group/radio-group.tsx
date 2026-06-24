import * as React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { IconCircleFilled } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * RadioGroupProps
 *
 * Props for the RadioGroup component.
 */
interface RadioGroupProps extends React.ComponentProps<
  typeof RadioGroupPrimitive.Root
> {}

/**
 * RadioGroupItemProps
 *
 * Props for the RadioGroupItem component.
 */
interface RadioGroupItemProps extends React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> {}

/**
 * RadioGroup
 *
 * A set of mutually exclusive options where exactly one can be selected. Render
 * one `RadioGroupItem` per option; Radix handles roving focus and arrow-key
 * navigation between them. Control the selection with `value` / `onValueChange`,
 * or set an initial selection with `defaultValue`.
 *
 * @example
 * ```tsx
 * <RadioGroup defaultValue="comfortable">
 *   <div className="nx:flex nx:items-center nx:gap-2">
 *     <RadioGroupItem value="default" id="r-default" />
 *     <Label htmlFor="r-default">Default</Label>
 *   </div>
 *   <div className="nx:flex nx:items-center nx:gap-2">
 *     <RadioGroupItem value="comfortable" id="r-comfortable" />
 *     <Label htmlFor="r-comfortable">Comfortable</Label>
 *   </div>
 * </RadioGroup>
 * ```
 */
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('nx:grid nx:gap-2', className)}
      {...props}
    />
  );
}

/**
 * RadioGroupItem
 *
 * A single selectable option within a `RadioGroup`. Pair it with a `Label`
 * (via matching `id` / `htmlFor`) so the option's text toggles it.
 */
function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'nx:size-4 nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:border nx:border-border-default nx:bg-background',
        'nx:transition-colors',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:text-primary-background nx:data-[state=checked]:disabled:border-primary-disabled',
        'nx:aria-invalid:data-[state=checked]:border-border-error nx:aria-invalid:data-[state=checked]:text-error-background',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="nx:flex nx:items-center nx:justify-center"
      >
        <IconCircleFilled className="nx:size-2.5 nx:text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupItemProps,
  type RadioGroupProps,
};
