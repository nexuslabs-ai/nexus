import * as React from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

/**
 * ProgressProps
 *
 * Props for the Progress component.
 */
interface ProgressProps extends React.ComponentProps<
  typeof ProgressPrimitive.Root
> {}

/**
 * Progress
 *
 * A determinate progress bar for showing how far along a task is — a file
 * upload, a multi-step form, a loading sequence. Read-only: it reflects
 * progress, it doesn't accept input. Drive it with `value` (0–100); omit
 * `value` for an indeterminate bar. Always pass an `aria-label` (or
 * `aria-labelledby`) so the bar is announced.
 *
 * @example
 * ```tsx
 * <Progress value={66} aria-label="Upload progress" />
 * ```
 *
 * @example
 * ```tsx
 * // Indeterminate — omit value while the total is unknown
 * <Progress aria-label="Loading" />
 * ```
 */
function Progress({ className, value, ...props }: ProgressProps) {
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
        className="nx:h-full nx:w-full nx:bg-primary-background nx:transition-transform nx:data-[state=indeterminate]:w-1/3 nx:data-[state=indeterminate]:animate-progress-indeterminate nx:motion-reduce:data-[state=indeterminate]:animate-none"
        style={
          value == null
            ? undefined
            : { transform: `translateX(-${100 - value}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress, type ProgressProps };
