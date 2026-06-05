import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

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
          'nx:rounded-md nx:border nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:shadow-lg',
          'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
          'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
          'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
          'nx:data-[side=bottom]:slide-in-from-top-2 nx:data-[side=left]:slide-in-from-right-2',
          'nx:data-[side=right]:slide-in-from-left-2 nx:data-[side=top]:slide-in-from-bottom-2',
          'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
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
