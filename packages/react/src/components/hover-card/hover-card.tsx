import * as React from 'react';

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * HoverCardProps
 *
 * Props for the HoverCard root.
 */
interface HoverCardProps extends React.ComponentProps<
  typeof HoverCardPrimitive.Root
> {}

/**
 * A card that opens when the user hovers or focuses the trigger. Use it for
 * previews such as profile or link cards. For content opened by a click, use
 * `Popover`.
 */
function HoverCard(props: HoverCardProps) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

/**
 * HoverCardTriggerProps
 *
 * Props for the HoverCardTrigger.
 */
interface HoverCardTriggerProps extends React.ComponentProps<
  typeof HoverCardPrimitive.Trigger
> {}

/**
 * The element that opens the card on hover or focus. Use `asChild` to render
 * your own element, such as a link or avatar.
 */
function HoverCardTrigger(props: HoverCardTriggerProps) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

/**
 * HoverCardContentProps
 *
 * Props for the HoverCardContent component.
 */
interface HoverCardContentProps extends React.ComponentProps<
  typeof HoverCardPrimitive.Content
> {}

/**
 * The floating card. Anchors to the trigger and renders into `document.body`.
 */
function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: HoverCardContentProps) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'nx:z-popover nx:w-64 nx:p-container nx:outline-none',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export {
  HoverCard,
  HoverCardContent,
  type HoverCardContentProps,
  type HoverCardProps,
  HoverCardTrigger,
  type HoverCardTriggerProps,
};
