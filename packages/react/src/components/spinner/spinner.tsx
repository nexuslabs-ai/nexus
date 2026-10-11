import * as React from 'react';

import { IconLoader2 } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * SpinnerProps
 *
 * Props for Spinner.
 */
interface SpinnerProps extends React.ComponentProps<'svg'> {}

/**
 * Spinner
 *
 * Rotating loading indicator with `role="status"` and an `aria-label` of
 * "Loading". Size it with `nx:size-*` and color it with `nx:text-*`.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner className="nx:size-6 nx:text-primary-subtle-foreground" />
 * <Spinner aria-label="Saving changes" />
 * ```
 */
function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <IconLoader2
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn('nx:size-4 nx:animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner, type SpinnerProps };
