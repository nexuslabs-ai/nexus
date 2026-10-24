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
type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root>;

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
type HoverCardTriggerProps = React.ComponentProps<
  typeof HoverCardPrimitive.Trigger
>;

/**
 * The element that opens the card on hover or focus. Use `asChild` to render
 * your own element, such as a link or avatar.
 */
const HoverCardTrigger = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<HoverCardTriggerProps>
>(function HoverCardTrigger(propsWithoutRef, forwardedRef) {
  const props: React.PropsWithoutRef<HoverCardTriggerProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
});

/**
 * HoverCardContentProps
 *
 * Props for the HoverCardContent component.
 */
type HoverCardContentProps = React.ComponentProps<
  typeof HoverCardPrimitive.Content
>;

/**
 * The floating card. Anchors to the trigger and renders into `document.body`.
 */
const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<HoverCardContentProps>
>(function HoverCardContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    align = 'center',
    sideOffset = 4,
    ...props
  }: React.PropsWithoutRef<HoverCardContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

export {
  HoverCard,
  HoverCardContent,
  type HoverCardContentProps,
  type HoverCardProps,
  HoverCardTrigger,
  type HoverCardTriggerProps,
};
