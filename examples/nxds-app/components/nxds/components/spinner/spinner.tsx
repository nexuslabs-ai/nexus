import * as React from 'react';

import { IconLoader2 } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * Props for Spinner.
 */
type SpinnerProps = React.ComponentProps<'svg'>;

/**
 * Rotating loading indicator with `role="status"` and a default `aria-label`
 * of "Loading". Size it with `nx:size-*` and color it with `nx:text-*`.
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
