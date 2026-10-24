import * as React from 'react';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

import { IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

/**
 * Props for the RadioGroup component.
 */
type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

/**
 * Props for the RadioGroupItem component.
 */
type RadioGroupItemProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
>;

/**
 * Set of options where only one can be selected. Render one `RadioGroupItem`
 * per option, labelled with `Label` or wrapped in `ChoiceRow` or `ChoiceCard`.
 */
const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<RadioGroupProps>
>(function RadioGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<RadioGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('nx:grid nx:gap-2', className)}
      {...props}
    />
  );
});

/**
 * One option in a `RadioGroup`. Give it an `id` and a `Label` with a matching
 * `htmlFor`, or wrap it in `ChoiceRow` or `ChoiceCard`.
 */
const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<RadioGroupItemProps>
>(function RadioGroupItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<RadioGroupItemProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'nx:group nx:size-4 nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:p-0 nx:border-default nx:border-border-default nx:bg-container',
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
});

export {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupItemProps,
  type RadioGroupProps,
};
