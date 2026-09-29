import * as React from 'react';

import { IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

function FilterCondition({ className, ...props }: React.ComponentProps<'div'>) {
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
}

interface FilterConditionTriggerProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'type'
> {
  children: string;
}

function FilterConditionTrigger({
  children,
  className,
  ...props
}: FilterConditionTriggerProps) {
  return (
    <button
      {...props}
      type="button"
      data-slot="filter-condition-trigger"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:min-w-0 nx:justify-start nx:rounded-e-none nx:active:scale-100 nx:focus-visible:relative nx:focus-visible:z-10',
        className
      )}
    >
      <span className="nx:min-w-0 nx:truncate">{children}</span>
      <IconChevronDown
        aria-hidden="true"
        className="nx:text-muted-foreground"
      />
    </button>
  );
}

function FilterConditionField({
  children,
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      {...props}
      data-slot="filter-condition-field"
      className={cn(
        // eslint-disable-next-line no-restricted-syntax -- the start segment of a joined control whose other segments are Buttons follows the Button radius override
        'nx:inline-flex nx:h-(--nx-spacing-8) nx:shrink-0 nx:items-center nx:gap-2 nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0 nx:rounded-s-base nx:border-default nx:border-border-default nx:bg-container nx:px-2.5 nx:typography-label-default nx:text-muted-foreground',
        className
      )}
    >
      {children}
    </span>
  );
}

/** An independently operable segment in a composed field / operator / value condition. */
function FilterConditionSegment({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<'button'>, 'type'>) {
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
}

interface FilterConditionRemoveProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'type'
> {
  'aria-label': string;
}

function FilterConditionRemove({
  className,
  ...props
}: FilterConditionRemoveProps) {
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
}

export {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  type FilterConditionRemoveProps,
  FilterConditionSegment,
  FilterConditionTrigger,
  type FilterConditionTriggerProps,
};
