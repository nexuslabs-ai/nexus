import * as React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  tooltipSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Required wrapper for tooltips. Place it at your app root or around the
 * components that use tooltips.
 *
 * @example
 * ```tsx
 * <TooltipProvider>
 *   <App />
 * </TooltipProvider>
 * ```
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Root of one tooltip. Holds its open state, trigger and content.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip text</TooltipContent>
 * </Tooltip>
 * ```
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * Element that opens the tooltip on hover or focus.
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * Props for TooltipContent.
 */
interface TooltipContentProps extends React.ComponentProps<
  typeof TooltipPrimitive.Content
> {}

/**
 * Popup that shows the tooltip text. Position it with `side` and `align`.
 *
 * @example
 * ```tsx
 * <TooltipContent side="top" align="center">
 *   <p>Helpful information</p>
 * </TooltipContent>
 * ```
 */
function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'nx:z-popover nx:overflow-hidden',
          tooltipSurfaceClassName,
          'nx:px-3 nx:py-1.5',
          'nx:typography-body-small',
          overlayFloatingTransitionClassName,
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export {
  Tooltip,
  TooltipContent,
  type TooltipContentProps,
  TooltipProvider,
  TooltipTrigger,
};
