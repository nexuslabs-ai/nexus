import * as React from 'react';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button/button';

interface FilterChipProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'type'
> {
  children: string;
  /** Names the action, field and full value, such as "Remove status filter: Active". */
  'aria-label': string;
}

/** An applied filter that is removed when activated. Your app owns the filter state and where focus goes next. */
const FilterChip = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<FilterChipProps>
>(function FilterChip(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    ...props
  }: React.PropsWithoutRef<FilterChipProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      {...props}
      type="button"
      data-slot="filter-chip"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:max-w-full nx:min-w-0 nx:justify-start nx:active:scale-100',
        className
      )}
    >
      <span data-slot="filter-chip-label" className="nx:min-w-0 nx:truncate">
        {children}
      </span>
      <IconX aria-hidden="true" />
    </button>
  );
});

export { FilterChip, type FilterChipProps };
