import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Root of the popover. Holds the open state.
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
type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
>;

/**
 * Floating panel next to the trigger, rendered in a portal on `document.body`.
 */
const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<PopoverContentProps>
>(function PopoverContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    align = 'center',
    sideOffset = 4,
    ...props
  }: React.PropsWithoutRef<PopoverContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
};
