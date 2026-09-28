import * as React from 'react';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

interface FilterChipProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'type'
> {
  children: string;
  /** Include the action, field and full value, e.g. "Remove status filter: Active". */
  'aria-label': string;
}

/** An applied filter. Activating any part removes it; the consumer owns state and subsequent focus. */
function FilterChip({ children, className, ...props }: FilterChipProps) {
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
}

export { FilterChip, type FilterChipProps };
