import * as React from 'react';

import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '../../lib/utils';
import { overlayBodyClassName } from '../overlay-layout/overlay-layout';

/**
 * Drawer
 *
 * Root for a gesture-driven drawer that slides in from a viewport edge with
 * drag-to-dismiss (built on vaul). `vaul` is an optional peer dependency —
 * install it in the consuming app.
 *
 * @example
 * ```tsx
 * <Drawer>
 *   <DrawerTrigger asChild>
 *     <Button>Open</Button>
 *   </DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Title</DrawerTitle>
 *       <DrawerDescription>Description.</DrawerDescription>
 *     </DrawerHeader>
 *     <DrawerFooter>
 *       <DrawerClose asChild>
 *         <Button variant="outline">Close</Button>
 *       </DrawerClose>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 * ```
 */
const Drawer = DrawerPrimitive.Root;

/**
 * DrawerTrigger
 *
 * Button that opens the drawer. Use `asChild` to render as your own component.
 */
const DrawerTrigger = DrawerPrimitive.Trigger;

/**
 * DrawerPortal
 *
 * Portals the drawer content to document.body.
 */
const DrawerPortal = DrawerPrimitive.Portal;

/**
 * DrawerClose
 *
 * Button that closes the drawer. Use `asChild` to render as your own component.
 */
const DrawerClose = DrawerPrimitive.Close;

/**
 * DrawerOverlay
 *
 * Semi-transparent scrim behind the drawer content.
 */
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
        'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
        'nx:data-[state=open]:duration-slower nx:data-[state=open]:ease-enter',
        'nx:data-[state=closed]:duration-slow nx:data-[state=closed]:ease-exit',
        'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * DrawerContent
 *
 * The sliding panel. Renders inside a portal with an overlay; vaul's `direction`
 * prop on the root picks which edge it slides from (defaults to `bottom`). The
 * drag handle shows only for the bottom direction.
 */
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'nx:group/drawer-content nx:fixed nx:z-modal nx:flex nx:h-auto nx:flex-col nx:overflow-hidden nx:bg-container nx:shadow-lg',
          'nx:motion-reduce:transition-none',
          'nx:data-[vaul-drawer-direction=top]:inset-x-0 nx:data-[vaul-drawer-direction=top]:top-0 nx:data-[vaul-drawer-direction=top]:mb-24 nx:data-[vaul-drawer-direction=top]:max-h-[80svh] nx:data-[vaul-drawer-direction=top]:rounded-b-lg nx:data-[vaul-drawer-direction=top]:border-b-default nx:data-[vaul-drawer-direction=top]:border-border-default',
          'nx:data-[vaul-drawer-direction=bottom]:inset-x-0 nx:data-[vaul-drawer-direction=bottom]:bottom-0 nx:data-[vaul-drawer-direction=bottom]:mt-24 nx:data-[vaul-drawer-direction=bottom]:max-h-[80svh] nx:data-[vaul-drawer-direction=bottom]:rounded-t-lg nx:data-[vaul-drawer-direction=bottom]:border-t-default nx:data-[vaul-drawer-direction=bottom]:border-border-default',
          'nx:data-[vaul-drawer-direction=right]:right-0 nx:data-[vaul-drawer-direction=right]:top-0 nx:data-[vaul-drawer-direction=right]:h-svh nx:data-[vaul-drawer-direction=right]:w-3/4 nx:data-[vaul-drawer-direction=right]:border-l-default nx:data-[vaul-drawer-direction=right]:border-border-default nx:data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'nx:data-[vaul-drawer-direction=left]:left-0 nx:data-[vaul-drawer-direction=left]:top-0 nx:data-[vaul-drawer-direction=left]:h-svh nx:data-[vaul-drawer-direction=left]:w-3/4 nx:data-[vaul-drawer-direction=left]:border-r-default nx:data-[vaul-drawer-direction=left]:border-border-default nx:data-[vaul-drawer-direction=left]:sm:max-w-sm',
          className
        )}
        {...props}
      >
        <div
          data-slot="drawer-handle"
          className="nx:mx-auto nx:mt-4 nx:hidden nx:h-2 nx:w-[100px] nx:shrink-0 nx:rounded-full nx:bg-muted nx:group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
        />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

/**
 * DrawerHeader
 *
 * Container for the drawer title and description.
 */
function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
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
}

/**
 * DrawerBody
 *
 * Container for the drawer's main content between the header and footer. Insets
 * its content horizontally to match the header and footer.
 */
function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      {...props}
    />
  );
}

/**
 * DrawerFooter
 *
 * Container for the drawer action buttons. Pinned to the bottom of the panel.
 */
function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
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
}

/**
 * DrawerTitle
 *
 * The accessible title of the drawer. Required for screen-reader labelling —
 * vaul wires `aria-labelledby` to it.
 */
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('nx:typography-heading-xsmall', className)}
      {...props}
    />
  );
}

/**
 * DrawerDescription
 *
 * Supporting text that provides additional context for the drawer.
 */
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn(
        'nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
