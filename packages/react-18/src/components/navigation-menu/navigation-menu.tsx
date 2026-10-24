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
 */
const NavigationMenu = React.forwardRef<
  HTMLElement,
  React.PropsWithoutRef<NavigationMenuProps>
>(function NavigationMenu(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    viewport = true,
    ...props
  }: React.PropsWithoutRef<NavigationMenuProps> & {
    ref?: React.ForwardedRef<HTMLElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the NavigationMenuList component.
 */
type NavigationMenuListProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.List
>;

/**
 * Horizontal list of top-level navigation items.
 */
const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.PropsWithoutRef<NavigationMenuListProps>
>(function NavigationMenuList(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<NavigationMenuListProps> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the NavigationMenuItem component.
 */
type NavigationMenuItemProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Item
>;

/**
 * One top-level navigation item, with its trigger and content.
 */
const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.PropsWithoutRef<NavigationMenuItemProps>
>(function NavigationMenuItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<NavigationMenuItemProps> & {
    ref?: React.ForwardedRef<HTMLLIElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('nx:relative', className)}
      {...props}
    />
  );
});

const navigationMenuTriggerStyle = cva(
  'nx:group nx:inline-flex nx:w-max nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-background nx:px-4 nx:py-2 nx:text-inherit nx:typography-label-default nx:transition-control nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:data-[state=open]:bg-background-hover nx:data-[state=open]:text-foreground'
);

/**
 * Props for the NavigationMenuTrigger component.
 */
type NavigationMenuTriggerProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Trigger
>;

/**
 * Button that opens the item's flyout. Its chevron turns while open.
 */
const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<NavigationMenuTriggerProps>
>(function NavigationMenuTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<NavigationMenuTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the NavigationMenuContent component.
 */
type NavigationMenuContentProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Content
>;

/**
 * Flyout panel for a navigation item. Stacks at full width in a narrow menu
 * and floats over the page in a wider one.
 */
const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<NavigationMenuContentProps>
>(function NavigationMenuContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<NavigationMenuContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the NavigationMenuViewport component.
 */
type NavigationMenuViewportProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Viewport
>;

/**
 * Shared panel that shows the open item's content. Fits the content in a
 * wide menu and spans the full width in a narrow one.
 */
const NavigationMenuViewport = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<NavigationMenuViewportProps>
>(function NavigationMenuViewport(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<NavigationMenuViewportProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the NavigationMenuLink component.
 */
type NavigationMenuLinkProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Link
>;

/**
 * Link inside a flyout panel.
 */
const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<NavigationMenuLinkProps>
>(function NavigationMenuLink(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<NavigationMenuLinkProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the NavigationMenuIndicator component.
 */
type NavigationMenuIndicatorProps = React.ComponentProps<
  typeof NavigationMenuPrimitive.Indicator
>;

/**
 * Small arrow from the open trigger to its flyout.
 */
const NavigationMenuIndicator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<NavigationMenuIndicatorProps>
>(function NavigationMenuIndicator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<NavigationMenuIndicatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
