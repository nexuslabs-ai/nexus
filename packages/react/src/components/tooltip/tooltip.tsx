'use client';

import * as React from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  tooltipSurfaceClassName,
} from '../overlay-layout/overlay-layout';

import { TooltipGroupContext } from './tooltip-group';

/**
 * Optional. Groups the tooltips inside it, so they share an open delay and
 * moving between them skips the delay.
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
 * Root of one tooltip. Holds its open state, trigger and content. Works on its
 * own, and joins the group inside a `TooltipProvider`.
 */
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const inGroup = React.useContext(TooltipGroupContext);
  const root = <TooltipPrimitive.Root {...props} />;
  if (inGroup) return root;

  return <TooltipPrimitive.Provider>{root}</TooltipPrimitive.Provider>;
}

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
