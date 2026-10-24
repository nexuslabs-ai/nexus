import * as React from 'react';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * Props for ScrollArea, from the Radix ScrollArea Root. `type` sets when the
 * scrollbars show. `scrollHideDelay` sets how long they stay after scrolling.
 */
type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root>;

/**
 * Scrollable region with custom scrollbars that look the same on every
 * platform. Renders a vertical scrollbar for you. For horizontal scrolling, add
 * `<ScrollBar orientation="horizontal" />` after the content. `type` sets when
 * the scrollbars show, `hover` by default.
 */
const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ScrollAreaProps>
>(function ScrollArea(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<ScrollAreaProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for ScrollBar, from the Radix Scrollbar. `orientation` picks the axis
 * the bar controls.
 */
type ScrollBarProps = React.ComponentProps<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;

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
 * Scrollbar track and thumb for one axis. Render it only to add the horizontal
 * axis, as a child of ScrollArea after the content.
 */
const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ScrollBarProps>
>(function ScrollBar(propsWithoutRef, forwardedRef) {
  const {
    className,
    orientation = 'vertical',
    ...props
  }: React.PropsWithoutRef<ScrollBarProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

export {
  ScrollArea,
  type ScrollAreaProps,
  ScrollBar,
  type ScrollBarProps,
  scrollBarVariants,
};
