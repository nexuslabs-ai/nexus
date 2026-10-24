import * as React from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '../../lib/utils';

/**
 * Props for the Progress component.
 */
type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * Bar that shows task progress from `value` 0 to 100, or an animated bar
 * without `value`. Always pass an `aria-label` or `aria-labelledby`.
 */
const Progress = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ProgressProps>
>(function Progress(propsWithoutRef, forwardedRef) {
  const {
    className,
    value,
    ...props
  }: React.PropsWithoutRef<ProgressProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        'nx:relative nx:h-2 nx:w-full nx:overflow-hidden nx:rounded-full nx:bg-control-background',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="nx:h-full nx:w-full nx:bg-primary-background nx:transition-transform nx:duration-fast nx:data-[state=indeterminate]:w-1/3 nx:data-[state=indeterminate]:animate-progress-indeterminate"
        style={
          value == null
            ? undefined
            : { transform: `translateX(-${100 - value}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
});

export { Progress, type ProgressProps };
