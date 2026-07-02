import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * SkeletonProps
 *
 * Props for the Skeleton component.
 */
interface SkeletonProps extends React.ComponentProps<'div'> {}

/**
 * Skeleton
 *
 * A pulsing placeholder block for loading states. Render one — or a cluster —
 * in place of content that hasn't arrived yet to hold the layout and signal
 * that something is coming. Shape and size come from consumer utilities:
 * `nx:h-*` / `nx:w-*` for a bar, `nx:size-* nx:rounded-full` for a circle.
 *
 * @example
 * ```tsx
 * <Skeleton className="nx:h-4 nx:w-48" />
 * <Skeleton className="nx:size-12 nx:rounded-full" />
 * ```
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'nx:animate-pulse nx:rounded-md nx:bg-muted nx:motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
