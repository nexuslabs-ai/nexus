import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * SkeletonProps
 *
 * Props for Skeleton.
 */
interface SkeletonProps extends React.ComponentProps<'div'> {}

/**
 * Skeleton
 *
 * Pulsing placeholder that holds the layout while content loads. Set its shape
 * with utilities, such as `nx:h-4 nx:w-48` or `nx:size-12 nx:rounded-full`.
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
      className={cn('nx:animate-pulse nx:rounded-md nx:bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
