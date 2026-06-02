import * as React from 'react';

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '@/lib/utils';

/**
 * HoverCardProps
 *
 * Props for the HoverCard root.
 */
interface HoverCardProps extends React.ComponentProps<
  typeof HoverCardPrimitive.Root
> {}

/**
 * HoverCard
 *
 * A popover-style card revealed when the user hovers (or focuses) the trigger —
 * for rich previews (profile cards, link previews). Opens on hover intent, not
 * click; for click-driven content use `Popover`.
 *
 * @example
 * ```tsx
 * <HoverCard>
 *   <HoverCardTrigger asChild>
 *     <a href="/users/nexus">@nexus</a>
 *   </HoverCardTrigger>
 *   <HoverCardContent>Joined March 2026 · 1.2k followers</HoverCardContent>
 * </HoverCard>
 * ```
 */
function HoverCard({ ...props }: HoverCardProps) {
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
 * HoverCardTrigger
 *
 * The element that reveals the card on hover / focus. Use `asChild` to render
 * as your own element (a link, an avatar).
 */
function HoverCardTrigger({ ...props }: HoverCardTriggerProps) {
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
 * HoverCardContent
 *
 * The floating card, anchored to the trigger and portaled to the body.
 *
 * @example
 * ```tsx
 * <HoverCardContent align="start" sideOffset={8}>
 *   <p>Preview content</p>
 * </HoverCardContent>
 * ```
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
          'nx:rounded-md nx:border nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:shadow-lg',
          'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
          'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
          'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
          'nx:data-[side=bottom]:slide-in-from-top-2 nx:data-[side=left]:slide-in-from-right-2',
          'nx:data-[side=right]:slide-in-from-left-2 nx:data-[side=top]:slide-in-from-bottom-2',
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
