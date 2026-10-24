import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * Props for Skeleton.
 */
type SkeletonProps = React.ComponentProps<'div'>;

/**
 * Pulsing placeholder that holds the layout while content loads. Set its shape
 * with utilities, such as `nx:h-4 nx:w-48` or `nx:size-12 nx:rounded-full`.
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SkeletonProps>
>(function Skeleton(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SkeletonProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="skeleton"
      className={cn('nx:animate-pulse nx:rounded-md nx:bg-muted', className)}
      {...props}
    />
  );
});

export { Skeleton, type SkeletonProps };
