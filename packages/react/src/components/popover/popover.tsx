import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Popover
 *
 * Root component for the popover. Controls open/close state.
 *
 * @example
 * ```tsx
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button variant="outline">Open</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>Place content for the popover here.</PopoverContent>
 * </Popover>
 * ```
 */
const Popover = PopoverPrimitive.Root;

/**
 * PopoverTrigger
 *
 * Button that toggles the popover. Use `asChild` to render as your own component.
 */
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * PopoverAnchor
 *
 * Optional element to anchor the popover against, instead of the trigger. Useful
 * when the popover should position relative to a different element than the one
 * that opens it.
 */
const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * PopoverContentProps
 *
 * Props for the PopoverContent component.
 */
interface PopoverContentProps extends React.ComponentProps<
  typeof PopoverPrimitive.Content
> {}

/**
 * PopoverContent
 *
 * The floating content container, anchored to the trigger and portaled to the body.
 *
 * @example
 * ```tsx
 * <PopoverContent align="start" sideOffset={8}>
 *   <p>Popover content</p>
 * </PopoverContent>
 * ```
 */
function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  forceMount,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal forceMount={forceMount}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        forceMount={forceMount}
        className={cn(
          'nx:z-popover nx:w-72 nx:p-container nx:outline-none',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
};
