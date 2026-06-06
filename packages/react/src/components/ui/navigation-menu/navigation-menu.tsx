import * as React from 'react';

import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';

import { IconChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * NavigationMenuProps
 *
 * Props for the NavigationMenu component.
 */
interface NavigationMenuProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Root
> {
  /**
   * Render the shared flyout viewport panel beneath the menu. Set `false` to
   * render each item's content inline under its own trigger instead.
   * @default true
   */
  viewport?: boolean;
}

/**
 * NavigationMenu
 *
 * Root component for top-level site navigation with flyout panels.
 * Declares the `navmenu` container so the flyout positioning adapts to the
 * menu's own width (see NavigationMenuContent / NavigationMenuViewport).
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
 * NavigationMenuListProps
 *
 * Props for the NavigationMenuList component.
 */
interface NavigationMenuListProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.List
> {}

/**
 * NavigationMenuList
 *
 * The horizontal list of top-level navigation items.
 */
function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        'nx:group nx:flex nx:flex-1 nx:list-none nx:items-center nx:justify-center nx:gap-1',
        className
      )}
      {...props}
    />
  );
}

/**
 * NavigationMenuItemProps
 *
 * Props for the NavigationMenuItem component.
 */
interface NavigationMenuItemProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Item
> {}

/**
 * NavigationMenuItem
 *
 * A single top-level navigation item (trigger + content).
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
  'nx:group nx:inline-flex nx:w-max nx:items-center nx:justify-center nx:rounded-md nx:bg-background nx:px-4 nx:py-2 nx:text-sm nx:font-medium nx:outline-none nx:transition-colors nx:motion-reduce:transition-none nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:opacity-50 nx:data-[state=open]:bg-background-hover nx:data-[state=open]:text-foreground'
);

/**
 * NavigationMenuTriggerProps
 *
 * Props for the NavigationMenuTrigger component.
 */
interface NavigationMenuTriggerProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Trigger
> {}

/**
 * NavigationMenuTrigger
 *
 * A top-level trigger that opens its flyout content. Renders a chevron that
 * rotates when open.
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
        className="nx:relative nx:top-px nx:ml-1 nx:size-3 nx:transition nx:duration-300 nx:motion-reduce:transition-none nx:group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

/**
 * NavigationMenuContentProps
 *
 * Props for the NavigationMenuContent component.
 */
interface NavigationMenuContentProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Content
> {}

/**
 * NavigationMenuContent
 *
 * The flyout panel for a navigation item. Below the `navmenu` container's `md`
 * width it stacks in-flow (full width); at/above it becomes an absolute panel.
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
        'nx:data-[motion=from-end]:slide-in-from-right-52 nx:data-[motion=from-start]:slide-in-from-left-52',
        'nx:data-[motion=to-end]:slide-out-to-right-52 nx:data-[motion=to-start]:slide-out-to-left-52',
        'nx:data-[motion^=from-]:animate-in nx:data-[motion^=from-]:fade-in nx:data-[motion^=to-]:animate-out nx:data-[motion^=to-]:fade-out',
        'nx:motion-reduce:data-[motion^=from-]:animate-none nx:motion-reduce:data-[motion^=to-]:animate-none',
        // @container conversion of shadcn's `md:absolute md:w-auto`
        'nx:@md/navmenu:absolute nx:@md/navmenu:w-auto',
        'nx:group-data-[viewport=false]/navigation-menu:top-full',
        'nx:group-data-[viewport=false]/navigation-menu:mt-1.5',
        'nx:group-data-[viewport=false]/navigation-menu:overflow-hidden nx:group-data-[viewport=false]/navigation-menu:rounded-md',
        'nx:group-data-[viewport=false]/navigation-menu:border nx:group-data-[viewport=false]/navigation-menu:border-border-default',
        'nx:group-data-[viewport=false]/navigation-menu:bg-popover nx:group-data-[viewport=false]/navigation-menu:text-popover-foreground',
        'nx:group-data-[viewport=false]/navigation-menu:shadow-lg nx:group-data-[viewport=false]/navigation-menu:duration-200',
        'nx:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out nx:group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 nx:group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95',
        'nx:group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in nx:group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 nx:group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95',
        'nx:motion-reduce:group-data-[viewport=false]/navigation-menu:duration-0',
        'nx:motion-reduce:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-none nx:motion-reduce:group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * NavigationMenuViewportProps
 *
 * Props for the NavigationMenuViewport component.
 */
interface NavigationMenuViewportProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Viewport
> {}

/**
 * NavigationMenuViewport
 *
 * The shared flyout container that holds the active item's content. Sized to
 * the Radix-measured content width at/above the `navmenu` container's `md`
 * width; full-width below it.
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
          'nx:origin-top-center nx:relative nx:mt-1.5 nx:h-[var(--radix-navigation-menu-viewport-height)] nx:w-full nx:overflow-hidden',
          'nx:rounded-md nx:border nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:shadow-lg',
          'nx:data-[state=closed]:animate-out nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:animate-in nx:data-[state=open]:zoom-in-90',
          'nx:motion-reduce:data-[state=closed]:animate-none nx:motion-reduce:data-[state=open]:animate-none',
          // @container conversion of shadcn's `md:w-[var(...)]`
          'nx:@md/navmenu:w-[var(--radix-navigation-menu-viewport-width)]',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * NavigationMenuLinkProps
 *
 * Props for the NavigationMenuLink component.
 */
interface NavigationMenuLinkProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Link
> {}

/**
 * NavigationMenuLink
 *
 * A navigable link inside a flyout panel.
 */
function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        'nx:flex nx:flex-col nx:gap-1 nx:rounded-sm nx:p-2 nx:text-sm nx:outline-none nx:transition-colors',
        'nx:motion-reduce:transition-none',
        'nx:hover:bg-popover-hover nx:hover:text-popover-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:data-[active=true]:bg-popover-hover nx:data-[active=true]:text-popover-foreground',
        'nx:[&_svg:not([class*=size-])]:size-4 nx:[&_svg:not([class*=text-])]:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * NavigationMenuIndicatorProps
 *
 * Props for the NavigationMenuIndicator component.
 */
interface NavigationMenuIndicatorProps extends React.ComponentProps<
  typeof NavigationMenuPrimitive.Indicator
> {}

/**
 * NavigationMenuIndicator
 *
 * A small arrow that points from the active trigger to its flyout.
 */
function NavigationMenuIndicator({
  className,
  ...props
}: NavigationMenuIndicatorProps) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        'nx:top-full nx:z-[1] nx:flex nx:h-1.5 nx:items-end nx:justify-center nx:overflow-hidden',
        'nx:data-[state=hidden]:animate-out nx:data-[state=hidden]:fade-out nx:data-[state=visible]:animate-in nx:data-[state=visible]:fade-in',
        'nx:motion-reduce:data-[state=hidden]:animate-none nx:motion-reduce:data-[state=visible]:animate-none',
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
