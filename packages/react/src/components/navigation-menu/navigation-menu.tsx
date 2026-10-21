import * as React from 'react';

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  navigationMenuInlinePopoverSurfaceClassName,
  navigationMenuInlinePopoverTransitionClassName,
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Props for the NavigationMenu component.
 */
interface NavigationMenuProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Root
> {
  /**
   * Shows every flyout in one shared panel under the menu. Set `false` to
   * show each flyout under its own trigger.
   */
  viewport?: boolean;
}

/**
 * Top-level site navigation with flyout panels. Flyouts adapt to the width
 * of the menu, not the viewport.
 *
 * @example
 * ```tsx
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>
 *       <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *       <NavigationMenuContent>...</NavigationMenuContent>
 *     </NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 * ```
 */
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        'nx:group/navigation-menu nx:@container/navmenu nx:relative nx:flex nx:w-full nx:items-center nx:justify-center',
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

/**
 * Props for the NavigationMenuList component.
 */
interface NavigationMenuListProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.List
> {}

/**
 * Horizontal list of top-level navigation items.
 */
function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        'nx:group nx:m-0 nx:flex nx:flex-1 nx:list-none nx:items-center nx:justify-center nx:gap-1 nx:p-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the NavigationMenuItem component.
 */
interface NavigationMenuItemProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Item
> {}

/**
 * One top-level navigation item, with its trigger and content.
 */
function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('nx:relative', className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  'nx:group nx:inline-flex nx:w-max nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-background nx:px-4 nx:py-2 nx:text-inherit nx:typography-label-default nx:transition-control nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:data-[state=open]:bg-background-hover nx:data-[state=open]:text-foreground'
);

/**
 * Props for the NavigationMenuTrigger component.
 */
interface NavigationMenuTriggerProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Trigger
> {}

/**
 * Button that opens the item's flyout. Its chevron turns while open.
 */
function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), 'nx:group', className)}
      {...props}
    >
      {children}{' '}
      <IconChevronDown
        className="nx:relative nx:top-px nx:ml-1 nx:size-3 nx:transition nx:duration-slow nx:group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

/**
 * Props for the NavigationMenuContent component.
 */
interface NavigationMenuContentProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Content
> {}

/**
 * Flyout panel for a navigation item. Stacks at full width in a narrow menu
 * and floats over the page in a wider one.
 */
function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuContentProps) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'nx:top-0 nx:left-0 nx:w-full nx:p-2 nx:pr-2.5',
        'nx:data-[motion=from-end]:slide-in-from-right-[1.5rem] nx:data-[motion=from-start]:slide-in-from-left-[1.5rem]',
        'nx:data-[motion=to-end]:slide-out-to-right-[1.5rem] nx:data-[motion=to-start]:slide-out-to-left-[1.5rem]',
        'nx:duration-fast nx:data-[motion^=from-]:animate-in nx:data-[motion^=from-]:fade-in nx:data-[motion^=to-]:animate-out nx:data-[motion^=to-]:fade-out',
        'nx:data-[motion^=from-]:duration-default nx:data-[motion^=from-]:ease-enter',
        'nx:data-[motion^=to-]:duration-fast nx:data-[motion^=to-]:ease-exit',
        'nx:@md/navmenu:absolute nx:@md/navmenu:w-auto',
        'nx:group-data-[viewport=false]/navigation-menu:top-full',
        'nx:group-data-[viewport=false]/navigation-menu:mt-1.5',
        'nx:group-data-[viewport=false]/navigation-menu:overflow-hidden',
        navigationMenuInlinePopoverSurfaceClassName,
        navigationMenuInlinePopoverTransitionClassName,
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the NavigationMenuViewport component.
 */
interface NavigationMenuViewportProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Viewport
> {}

/**
 * Shared panel that shows the open item's content. Fits the content in a
 * wide menu and spans the full width in a narrow one.
 */
function NavigationMenuViewport({
  className,
  ...props
}: NavigationMenuViewportProps) {
  return (
    <div className="nx:absolute nx:top-full nx:left-0 nx:isolate nx:z-popover nx:flex nx:justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          'nx:origin-top nx:relative nx:mt-1.5 nx:h-(--radix-navigation-menu-viewport-height) nx:w-full nx:overflow-hidden',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          'nx:@md/navmenu:w-(--radix-navigation-menu-viewport-width)',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Props for the NavigationMenuLink component.
 */
interface NavigationMenuLinkProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Link
> {}

/**
 * Link inside a flyout panel.
 */
function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        'nx:flex nx:flex-col nx:gap-1 nx:rounded-sm nx:p-2 nx:text-inherit nx:no-underline nx:typography-body-default nx:transition-control',
        'nx:hover:bg-popover-hover nx:hover:text-popover-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:data-[active=true]:bg-popover-hover nx:data-[active=true]:text-popover-foreground',
        'nx:[&_svg:not([class*=size-])]:size-4 nx:[&_svg:not([class*=text-])]:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * Props for the NavigationMenuIndicator component.
 */
interface NavigationMenuIndicatorProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Indicator
> {}

/**
 * Small arrow from the open trigger to its flyout.
 */
function NavigationMenuIndicator({
  className,
  ...props
}: NavigationMenuIndicatorProps) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        'nx:top-full nx:z-1 nx:flex nx:h-1.5 nx:items-end nx:justify-center nx:overflow-hidden',
        'nx:transition-opacity nx:duration-fast nx:ease-move',
        'nx:data-[state=hidden]:opacity-0 nx:data-[state=hidden]:animate-overlay-presence-exit',
        className
      )}
      {...props}
    >
      <div className="nx:relative nx:top-[60%] nx:size-2 nx:rotate-45 nx:rounded-tl-sm nx:bg-border-default nx:shadow-sm" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  type NavigationMenuContentProps,
  NavigationMenuIndicator,
  type NavigationMenuIndicatorProps,
  NavigationMenuItem,
  type NavigationMenuItemProps,
  NavigationMenuLink,
  type NavigationMenuLinkProps,
  NavigationMenuList,
  type NavigationMenuListProps,
  type NavigationMenuProps,
  NavigationMenuTrigger,
  type NavigationMenuTriggerProps,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
  type NavigationMenuViewportProps,
};
