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
const Spinner = React.forwardRef<
  SVGSVGElement,
  React.PropsWithoutRef<SpinnerProps>
>(function Spinner(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SpinnerProps> & {
    ref?: React.ForwardedRef<SVGSVGElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <IconLoader2
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn('nx:size-4 nx:animate-spin', className)}
      {...props}
    />
  );
});

export { Spinner, type SpinnerProps };
