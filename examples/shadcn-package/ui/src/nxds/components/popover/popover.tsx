import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Root of the popover. Holds the open state.
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
 * Button that opens and closes the popover. Use `asChild` to render your own
 * button.
 */
const PopoverTrigger = PopoverPrimitive.Trigger;

/**
 * Element to position the popover against instead of the trigger.
 */
const PopoverAnchor = PopoverPrimitive.Anchor;

/**
 * Props for the PopoverContent component.
 */
interface PopoverContentProps extends React.ComponentProps<
  typeof PopoverPrimitive.Content
> {}

/**
 * Floating panel next to the trigger, rendered in a portal on `document.body`.
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
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
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
