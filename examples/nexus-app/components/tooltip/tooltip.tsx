'use client';

import * as React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  tooltipSurfaceClassName,
} from '../overlay-layout/overlay-layout';

const TooltipGroupContext = React.createContext(false);

/**
 * TooltipProvider
 *
 * Optional. Groups the tooltips inside it, so they share an open delay and
 * moving between them skips the delay.
 *
 * @example
 * ```tsx
 * <TooltipProvider delayDuration={0}>
 *   <Toolbar>…</Toolbar>
 * </TooltipProvider>
 * ```
 */
function TooltipProvider(
  props: React.ComponentProps<typeof TooltipPrimitive.Provider>
) {
  return (
    <TooltipGroupContext.Provider value={true}>
      <TooltipPrimitive.Provider {...props} />
    </TooltipGroupContext.Provider>
  );
}

/**
 * Tooltip
 *
 * The root component that manages tooltip state. Contains the trigger and content.
 * It works on its own. Inside a `TooltipProvider` it joins that group.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>Hover me</TooltipTrigger>
 *   <TooltipContent>Tooltip text</TooltipContent>
 * </Tooltip>
 * ```
 */
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const inGroup = React.useContext(TooltipGroupContext);
  const root = <TooltipPrimitive.Root {...props} />;
  if (inGroup) return root;

  return <TooltipPrimitive.Provider>{root}</TooltipPrimitive.Provider>;
}

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
