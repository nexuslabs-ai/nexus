import * as React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

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
 * Set of options where only one can be selected. Render one `RadioGroupItem`
 * per option, labelled with `Label` or wrapped in `ChoiceRow` or `ChoiceCard`.
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
 * One option in a `RadioGroup`. Give it an `id` and a `Label` with a matching
 * `htmlFor`, or wrap it in `ChoiceRow` or `ChoiceCard`.
 */
function RadioGroupItem({ className, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'nx:group nx:size-4 nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:border-default nx:border-border-default nx:bg-container',
        'nx:transition-control',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:text-primary-background nx:data-[state=checked]:disabled:border-primary-disabled',
        'nx:aria-invalid:data-[state=checked]:border-error-border nx:aria-invalid:data-[state=checked]:text-error-background',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        forceMount
        data-slot="radio-group-indicator"
        className="nx:flex nx:items-center nx:justify-center"
      >
        <IconCircleFilled
          data-slot="radio-group-dot"
          aria-hidden="true"
          className={cn(
            'nx:size-2.5 nx:text-current',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )}
        />
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
