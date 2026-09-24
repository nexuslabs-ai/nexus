import * as React from 'react';

import { IconLoader2 } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * SpinnerProps
 *
 * Props for the Spinner component.
 */
interface SpinnerProps extends React.ComponentProps<'svg'> {}

/**
 * Spinner
 *
 * A loading indicator — a continuously rotating glyph for full-page loads,
 * "loading more…" rows, overlays on cards and tables, and Suspense fallbacks.
 * Announces itself to assistive tech via `role="status"` and an `aria-label`.
 * Size it with a `nx:size-*` class; it draws in `currentColor`, so recolour
 * with `nx:text-*`.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner className="nx:size-6 nx:text-primary-text" />
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
