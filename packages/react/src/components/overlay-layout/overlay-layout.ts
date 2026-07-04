import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Popover-family surfaces share the translucent/blurred recipe; Tooltip uses a
 * solid carve-out because its small, brief text appears over arbitrary content.
 */
const popoverSurfaceClassName = [
  'nx:rounded-md',
  'nx:border-default',
  'nx:border-border-default',
  'nx:bg-popover-alpha',
  'nx:backdrop-blur-lg',
  'nx:text-popover-foreground',
  'nx:shadow-lg',
  'nx:reduce-transparency:bg-popover',
].join(' ');

const tooltipSurfaceClassName = [
  'nx:rounded-md',
  'nx:border-default',
  'nx:border-border-default',
  'nx:bg-popover',
  'nx:text-popover-foreground',
  'nx:shadow-lg',
].join(' ');

const navigationMenuInlinePopoverSurfaceClassName = [
  'nx:group-data-[viewport=false]/navigation-menu:rounded-md',
  'nx:group-data-[viewport=false]/navigation-menu:border-default',
  'nx:group-data-[viewport=false]/navigation-menu:border-border-default',
  'nx:group-data-[viewport=false]/navigation-menu:bg-popover-alpha',
  'nx:group-data-[viewport=false]/navigation-menu:backdrop-blur-lg',
  'nx:group-data-[viewport=false]/navigation-menu:text-popover-foreground',
  'nx:group-data-[viewport=false]/navigation-menu:shadow-lg',
  'nx:group-data-[viewport=false]/navigation-menu:reduce-transparency:bg-popover',
].join(' ');

const navigationMenuInlinePopoverTransitionClassName = [
  'nx:group-data-[viewport=false]/navigation-menu:transition-[opacity,scale]',
  'nx:group-data-[viewport=false]/navigation-menu:duration-fast',
  'nx:group-data-[viewport=false]/navigation-menu:ease-move',
  'nx:motion-reduce:group-data-[viewport=false]/navigation-menu:transition-none',
  'nx:group-data-[viewport=false]/navigation-menu:data-[state=closed]:scale-95',
  'nx:group-data-[viewport=false]/navigation-menu:data-[state=closed]:opacity-0',
  'nx:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-overlay-presence-exit',
  'nx:motion-reduce:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-none',
].join(' ');

// `animate-overlay-presence-exit` is a non-visual "presence bridge": the installed
// Radix Presence only waits on `animationName`, not `transitionend`, so this inert
// animation keeps a closing overlay mounted while the opacity/scale/translate
// TRANSITIONS above run the visible exit. It animates an unread custom property (see
// generateMotionUtilitiesCSS in @nexus/core), never a transitioned property, so it
// cannot override those transitions. Reduced motion drops both. Retire this bridge if
// Radix Presence gains a transition-aware unmount path.
const overlayPresenceExitClassName =
  'nx:data-[state=closed]:animate-overlay-presence-exit nx:motion-reduce:data-[state=closed]:animate-none';

const overlayFloatingTransitionClassName = [
  'nx:transition-[opacity,scale]',
  'nx:duration-fast',
  'nx:ease-move',
  'nx:motion-reduce:transition-none',
  'nx:data-[state=closed]:scale-95',
  'nx:data-[state=closed]:opacity-0',
  overlayPresenceExitClassName,
].join(' ');

const overlayContentTransitionClassName = [
  'nx:transition-[opacity,scale]',
  'nx:duration-default',
  'nx:ease-move',
  'nx:motion-reduce:transition-none',
  'nx:data-[state=closed]:scale-95',
  'nx:data-[state=closed]:opacity-0',
  overlayPresenceExitClassName,
].join(' ');

const overlayScrimTransitionClassName = [
  'nx:transition-opacity',
  'nx:duration-default',
  'nx:ease-move',
  'nx:motion-reduce:transition-none',
  'nx:data-[state=closed]:opacity-0',
  overlayPresenceExitClassName,
].join(' ');

const overlayPanelTransitionClassName = [
  'nx:transition-[translate]',
  'nx:duration-slow',
  'nx:ease-move',
  'nx:motion-reduce:transition-none',
  overlayPresenceExitClassName,
].join(' ');

const overlayContentVariants = cva(
  [
    'nx:fixed nx:left-1/2 nx:top-1/2 nx:z-modal nx:flex nx:w-full nx:max-w-lg nx:flex-col',
    'nx:max-h-[calc(100svh-2rem)] nx:overflow-hidden',
    'nx:-translate-x-1/2 nx:-translate-y-1/2',
    'nx:gap-4 nx:border-default nx:border-border-default nx:bg-container nx:py-6 nx:shadow-lg',
    overlayContentTransitionClassName,
    'nx:sm:rounded-lg',
  ].join(' ')
);

const overlayScrimVariants = cva(
  [
    'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
    overlayScrimTransitionClassName,
  ].join(' ')
);

const overlayHeaderVariants = cva(
  'nx:flex nx:shrink-0 nx:flex-col nx:gap-1 nx:px-6',
  {
    variants: {
      variant: {
        default: 'nx:text-center nx:sm:text-left',
        center: 'nx:items-center nx:text-center',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const overlayBodyClassName = [
  'nx:min-h-0',
  'nx:overflow-y-auto',
  'nx:px-6',
  'nx:focus-visible:outline-2',
  'nx:focus-visible:outline-focus-default',
  'nx:focus-visible:[outline-offset:-2px]',
].join(' ');

const overlayFooterVariants = cva('nx:flex nx:shrink-0 nx:gap-2 nx:px-6', {
  variants: {
    orientation: {
      horizontal:
        'nx:flex-col nx:sm:flex-row nx:sm:items-center nx:sm:justify-end',
      vertical: 'nx:flex-col nx:items-stretch nx:*:w-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

const overlayCloseButtonClassName = [
  'nx:absolute nx:right-6 nx:top-6 nx:rounded-sm nx:p-1 nx:text-muted-foreground-subtle',
  'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-2.5',
  'nx:transition-colors',
  'nx:motion-reduce:transition-none',
  'nx:hover:bg-background-hover nx:hover:text-foreground',
  'nx:focus-visible:bg-background-hover nx:focus-visible:text-foreground',
  'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
  'nx:disabled:pointer-events-none',
].join(' ');

type OverlayVariant = NonNullable<
  VariantProps<typeof overlayHeaderVariants>['variant']
>;

type OverlayButtonOrientation = NonNullable<
  VariantProps<typeof overlayFooterVariants>['orientation']
>;

type OverlayLayoutContextValue = {
  variant: OverlayVariant;
  buttonOrientation: OverlayButtonOrientation;
};

const defaultOverlayLayout: OverlayLayoutContextValue = {
  variant: 'default',
  buttonOrientation: 'horizontal',
};

function resolveOverlayButtonOrientation(
  variant: OverlayVariant
): OverlayButtonOrientation {
  return variant === 'center' ? 'vertical' : 'horizontal';
}

function containsComposedSlot(
  children: React.ReactNode,
  slot: React.ElementType
): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    if (child.type === slot) return true;
    if (child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      return containsComposedSlot(fragment.props.children, slot);
    }
    return false;
  });
}

export {
  containsComposedSlot,
  defaultOverlayLayout,
  navigationMenuInlinePopoverSurfaceClassName,
  navigationMenuInlinePopoverTransitionClassName,
  overlayBodyClassName,
  type OverlayButtonOrientation,
  overlayCloseButtonClassName,
  overlayContentVariants,
  overlayFloatingTransitionClassName,
  overlayFooterVariants,
  overlayHeaderVariants,
  type OverlayLayoutContextValue,
  overlayPanelTransitionClassName,
  overlayScrimTransitionClassName,
  overlayScrimVariants,
  type OverlayVariant,
  popoverSurfaceClassName,
  resolveOverlayButtonOrientation,
  tooltipSurfaceClassName,
};
