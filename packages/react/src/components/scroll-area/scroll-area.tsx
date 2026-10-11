import * as React from 'react';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * ScrollAreaProps
 *
 * Props for ScrollArea, from the Radix ScrollArea Root. `type` sets when the
 * scrollbars show. `scrollHideDelay` sets how long they stay after scrolling.
 */
interface ScrollAreaProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.Root
> {}

/**
 * ScrollArea
 *
 * Scrollable region with custom scrollbars that look the same on every
 * platform. Renders a vertical scrollbar for you. For horizontal scrolling, add
 * `<ScrollBar orientation="horizontal" />` after the content.
 *
 * @example
 * ```tsx
 * <ScrollArea className="nx:h-72 nx:w-64 nx:rounded-md nx:border-default nx:border-border-default">
 *   <div className="nx:p-4">{longContent}</div>
 * </ScrollArea>
 * ```
 *
 * @example
 * ```tsx
 * // Horizontal scrolling — add a horizontal ScrollBar after the content.
 * <ScrollArea className="nx:w-96 nx:rounded-md nx:border-default nx:border-border-default nx:whitespace-nowrap">
 *   <div className="nx:flex nx:w-max nx:gap-4 nx:p-4">{tags}</div>
 *   <ScrollBar orientation="horizontal" />
 * </ScrollArea>
 * ```
 */
function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('nx:relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        // Keyboard access for the scroll region (WCAG / axe
        // scrollable-region-focusable): an overflow container with no focusable
        // children is unreachable by keyboard unless the viewport itself is.
        tabIndex={0}
        className={cn(
          'nx:size-full nx:rounded-[inherit]',
          'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default'
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * ScrollBarProps
 *
 * Props for ScrollBar, from the Radix Scrollbar. `orientation` picks the axis
 * the bar controls.
 */
interface ScrollBarProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> {}

const scrollBarVariants = cva(
  'nx:flex nx:touch-none nx:select-none nx:p-px nx:transition-colors',
  {
    variants: {
      orientation: {
        vertical:
          'nx:h-full nx:w-2.5 nx:border-l-default nx:border-l-transparent',
        horizontal:
          'nx:h-2.5 nx:flex-col nx:border-t-default nx:border-t-transparent',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

/**
 * ScrollBar
 *
 * Scrollbar track and thumb for one axis. Render it only to add the horizontal
 * axis, as a child of ScrollArea after the content.
 *
 * @example
 * ```tsx
 * <ScrollBar orientation="horizontal" />
 * ```
 */
function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-bar"
      orientation={orientation}
      className={cn(scrollBarVariants({ orientation }), className)}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-bar-thumb"
        className="nx:relative nx:flex-1 nx:rounded-full nx:bg-border-default"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export {
  ScrollArea,
  type ScrollAreaProps,
  ScrollBar,
  type ScrollBarProps,
  scrollBarVariants,
};
