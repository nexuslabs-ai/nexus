import * as React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  tooltipSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * TooltipProvider
 *
 * Wraps your app to provide tooltip context. Required for tooltips to work.
 * Place this at the root of your application or around components using tooltips.
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
 * Tooltip
 *
 * The root component that manages tooltip state. Contains the trigger and content.
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
 * TooltipTrigger
 *
 * The element that triggers the tooltip on hover or focus.
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * TooltipContentProps
 *
 * Props for the TooltipContent component.
 */
interface TooltipContentProps extends React.ComponentProps<
  typeof TooltipPrimitive.Content
> {}

/**
 * TooltipContent
 *
 * The popup content that appears when the tooltip is triggered.
 * Supports positioning via `side` and `align` props.
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
