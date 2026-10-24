import * as React from 'react';

import { IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button/button';

const FilterCondition = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function FilterCondition(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      {...props}
      data-slot="filter-condition"
      className={cn(
        'nx:inline-flex nx:max-w-full nx:min-w-0 nx:items-stretch',
        className
      )}
    />
  );
});

const FilterConditionField = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<React.ComponentProps<'span'>>
>(function FilterConditionField(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'span'>> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      {...props}
      data-slot="filter-condition-field"
      className={cn(
        'nx:inline-flex nx:h-(--nx-spacing-8) nx:shrink-0 nx:items-center nx:gap-2 nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0 nx:rounded-s-base nx:border-default nx:border-border-default nx:bg-container nx:px-2.5 nx:typography-label-default nx:text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  );
});

/** One clickable part of a condition, such as its operator or value. */
const FilterConditionSegment = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<Omit<React.ComponentProps<'button'>, 'type'>>
>(function FilterConditionSegment(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    ...props
  }: React.PropsWithoutRef<Omit<React.ComponentProps<'button'>, 'type'>> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      {...props}
      type="button"
      data-slot="filter-condition-segment"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:min-w-0 nx:rounded-none nx:border-s-0 nx:active:scale-100 nx:focus-visible:relative nx:focus-visible:z-10',
        className
      )}
    >
      <span className="nx:truncate">{children}</span>
      <IconChevronDown
        aria-hidden="true"
        className="nx:text-muted-foreground"
      />
    </button>
  );
});

interface FilterConditionRemoveProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'type'
> {
  'aria-label': string;
}

const FilterConditionRemove = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<FilterConditionRemoveProps>
>(function FilterConditionRemove(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<FilterConditionRemoveProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      {...props}
      type="button"
      data-slot="filter-condition-remove"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'icon-sm' }),
        'nx:size-(--nx-spacing-8) nx:shrink-0 nx:rounded-s-none nx:border-s-0 nx:text-muted-foreground nx:active:scale-100 nx:focus-visible:relative nx:focus-visible:z-10',
        className
      )}
    >
      <IconX aria-hidden="true" />
    </button>
  );
});

export {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  type FilterConditionRemoveProps,
  FilterConditionSegment,
};
