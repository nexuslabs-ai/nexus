import * as React from 'react';

import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '../../lib/utils';
import {
  overlayBodyClassName,
  overlayScrimTransitionClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Root for a drawer that slides in from a screen edge and drags to dismiss.
 * Install `vaul` in your app first.
 */
const Drawer = DrawerPrimitive.Root;

/**
 * Opens the drawer. Use `asChild` to render your own button.
 */
const DrawerTrigger = DrawerPrimitive.Trigger;

/**
 * Renders the drawer content into `document.body`.
 */
const DrawerPortal = DrawerPrimitive.Portal;

/**
 * Closes the drawer. Use `asChild` to render your own button.
 */
const DrawerClose = DrawerPrimitive.Close;

/**
 * DrawerOverlayProps
 *
 * Props for the DrawerOverlay component.
 */
type DrawerOverlayProps = React.ComponentProps<typeof DrawerPrimitive.Overlay>;

/**
 * Semi-transparent backdrop behind the drawer.
 */
const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DrawerOverlayProps>
>(function DrawerOverlay(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DrawerOverlayProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        // Drawer is vaul-driven and owns its own unmount, so the Radix presence bridge in
        // this shared class is inert here; the opacity transition still fades the scrim.
        overlayScrimTransitionClassName,
        className
      )}
      {...props}
    />
  );
});

/**
 * DrawerContentProps
 *
 * Props for the DrawerContent component.
 */
interface DrawerContentProps extends React.ComponentProps<
  typeof DrawerPrimitive.Content
> {
  /**
   * Shows the handle on bottom drawers. Hiding it does not change dragging or
   * dismissal.
   */
  showHandle?: boolean;
}

/**
 * The sliding panel. Renders in a portal above an overlay. Set `direction` on
 * the root to pick the edge, which is `bottom` by default.
 */
const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DrawerContentProps>
>(function DrawerContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    showHandle = true,
    ...props
  }: React.PropsWithoutRef<DrawerContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'nx:group/drawer-content nx:fixed nx:z-modal nx:flex nx:h-auto nx:flex-col nx:overflow-hidden nx:bg-container nx:shadow-lg',
          'nx:data-[vaul-drawer-direction=top]:inset-x-0 nx:data-[vaul-drawer-direction=top]:top-0 nx:data-[vaul-drawer-direction=top]:mb-24 nx:data-[vaul-drawer-direction=top]:max-h-[80svh] nx:data-[vaul-drawer-direction=top]:rounded-b-lg nx:data-[vaul-drawer-direction=top]:border-b-default nx:data-[vaul-drawer-direction=top]:border-border-default',
          'nx:data-[vaul-drawer-direction=bottom]:inset-x-0 nx:data-[vaul-drawer-direction=bottom]:bottom-0 nx:data-[vaul-drawer-direction=bottom]:mt-24 nx:data-[vaul-drawer-direction=bottom]:max-h-[80svh] nx:data-[vaul-drawer-direction=bottom]:rounded-t-lg nx:data-[vaul-drawer-direction=bottom]:border-t-default nx:data-[vaul-drawer-direction=bottom]:border-border-default',
          'nx:data-[vaul-drawer-direction=right]:right-0 nx:data-[vaul-drawer-direction=right]:top-0 nx:data-[vaul-drawer-direction=right]:h-svh nx:data-[vaul-drawer-direction=right]:w-3/4 nx:data-[vaul-drawer-direction=right]:border-l-default nx:data-[vaul-drawer-direction=right]:border-border-default nx:data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'nx:data-[vaul-drawer-direction=left]:left-0 nx:data-[vaul-drawer-direction=left]:top-0 nx:data-[vaul-drawer-direction=left]:h-svh nx:data-[vaul-drawer-direction=left]:w-3/4 nx:data-[vaul-drawer-direction=left]:border-r-default nx:data-[vaul-drawer-direction=left]:border-border-default nx:data-[vaul-drawer-direction=left]:sm:max-w-sm',
          className
        )}
        {...props}
      >
        {showHandle && (
          <div
            data-slot="drawer-handle"
            className="nx:mx-auto nx:mt-4 nx:hidden nx:h-2 nx:w-[100px] nx:shrink-0 nx:rounded-full nx:bg-muted nx:group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
          />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});

/**
 * DrawerHeaderProps
 *
 * Props for the DrawerHeader component.
 */
type DrawerHeaderProps = React.ComponentProps<'div'>;

/**
 * Holds the drawer title and description.
 */
const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DrawerHeaderProps>
>(function DrawerHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DrawerHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'nx:flex nx:shrink-0 nx:flex-col nx:gap-1.5 nx:p-6 nx:group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center nx:group-data-[vaul-drawer-direction=top]/drawer-content:text-center nx:md:text-left',
        className
      )}
      {...props}
    />
  );
});

/**
 * DrawerBodyProps
 *
 * Props for the DrawerBody component.
 */
type DrawerBodyProps = React.ComponentProps<'div'>;

/**
 * Holds the drawer's main content between the header and footer. Scrolls when
 * the content overflows.
 */
const DrawerBody = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DrawerBodyProps>
>(function DrawerBody(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DrawerBodyProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="drawer-body"
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      tabIndex={0}
      {...props}
    />
  );
});

/**
 * DrawerFooterProps
 *
 * Props for the DrawerFooter component.
 */
type DrawerFooterProps = React.ComponentProps<'div'>;

/**
 * Holds the drawer's action buttons at the bottom of the panel.
 */
const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DrawerFooterProps>
>(function DrawerFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DrawerFooterProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'nx:mt-auto nx:flex nx:shrink-0 nx:flex-col nx:gap-2 nx:p-6',
        className
      )}
      {...props}
    />
  );
});

/**
 * DrawerTitleProps
 *
 * Props for the DrawerTitle component.
 */
type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>;

/**
 * The drawer's title. Required, because screen readers use it to name the
 * drawer.
 */
const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.PropsWithoutRef<DrawerTitleProps>
>(function DrawerTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DrawerTitleProps> & {
    ref?: React.ForwardedRef<HTMLHeadingElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('nx:m-0 nx:typography-heading-xsmall', className)}
      {...props}
    />
  );
});

/**
 * DrawerDescriptionProps
 *
 * Props for the DrawerDescription component.
 */
type DrawerDescriptionProps = React.ComponentProps<
  typeof DrawerPrimitive.Description
>;

/**
 * Supporting text that explains the drawer.
 */
const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<DrawerDescriptionProps>
>(function DrawerDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DrawerDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

export {
  Drawer,
  DrawerBody,
  type DrawerBodyProps,
  DrawerClose,
  DrawerContent,
  type DrawerContentProps,
  DrawerDescription,
  type DrawerDescriptionProps,
  DrawerFooter,
  type DrawerFooterProps,
  DrawerHeader,
  type DrawerHeaderProps,
  DrawerOverlay,
  type DrawerOverlayProps,
  DrawerPortal,
  DrawerTitle,
  type DrawerTitleProps,
  DrawerTrigger,
};
