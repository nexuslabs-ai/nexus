import * as React from 'react';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * ScrollAreaProps
 *
 * Props for the ScrollArea component. Inherits the Radix ScrollArea Root —
 * notably `type` (`'hover' | 'always' | 'scroll' | 'auto'`, default `'hover'`)
 * controls when the scrollbars surface, and `scrollHideDelay` tunes how long
 * they linger after scrolling stops.
 */
interface ScrollAreaProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.Root
> {}

/**
 * ScrollArea
 *
 * A viewport with cross-browser custom scrollbars, so a scrollable region reads
 * the same on every platform instead of inheriting the OS scrollbar. This is an
 * intentional divergence from native scrollbar styling guidance: Radix keeps
 * scrolling native, while Nexus owns the visible track and thumb. In
 * `forced-colors` environments, the scrollbar chrome switches to system colors
 * as a progressive enhancement and leaves user content under the browser's
 * normal forced-color adjustment.
 *
 * Wraps its children in a measured viewport and renders a vertical scrollbar
 * for you. For horizontal (or both-axis) scrolling, add a
 * `<ScrollBar orientation="horizontal" />` as a child, after the content.
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
          'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)'
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner
        data-slot="scroll-area-corner"
        className="nx:forced-colors:border-default nx:forced-colors:border-[ButtonBorder] nx:forced-colors:bg-[Canvas]"
      />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * ScrollBarProps
 *
 * Props for the ScrollBar component. Inherits the Radix Scrollbar —
 * `orientation` (`'vertical' | 'horizontal'`, default `'vertical'`) picks the
 * axis the bar controls.
 */
interface ScrollBarProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> {}

const scrollBarVariants = cva(
  'nx:flex nx:touch-none nx:select-none nx:p-px nx:transition-colors nx:forced-colors:bg-[Canvas]',
  {
    variants: {
      orientation: {
        vertical:
          'nx:h-full nx:w-2.5 nx:border-l-default nx:border-l-transparent nx:forced-colors:border-l-[ButtonBorder]',
        horizontal:
          'nx:h-2.5 nx:flex-col nx:border-t-default nx:border-t-transparent nx:forced-colors:border-t-[ButtonBorder]',
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
 * The scrollbar track and its draggable thumb for one axis. ScrollArea renders
 * a vertical ScrollBar for you, so render this directly — as a child of
 * ScrollArea, after the content — only to add the horizontal axis.
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
        className="nx:relative nx:flex-1 nx:rounded-full nx:bg-border-default nx:forced-colors:bg-[CanvasText]"
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
