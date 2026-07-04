import * as React from 'react';

import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronRight, IconCircleFilled } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  staggeredItemClassName,
  staggeredItemContainerClassName,
} from '../motion/motion';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * MenubarProps
 *
 * Props for the Menubar component.
 */
interface MenubarProps extends React.ComponentProps<
  typeof MenubarPrimitive.Root
> {}

/**
 * Menubar
 *
 * Root component — a horizontal bar of menus (desktop-app style).
 *
 * @example
 * ```tsx
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>New Tab</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 * ```
 */
function Menubar({ className, ...props }: MenubarProps) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        'nx:flex nx:items-center nx:gap-1 nx:rounded-md nx:border-default nx:border-border-default nx:bg-background nx:p-1 nx:shadow-xs',
        className
      )}
      {...props}
    />
  );
}

/**
 * MenubarMenu
 *
 * Groups a trigger with its content. One per top-level menu.
 */
const MenubarMenu = MenubarPrimitive.Menu;

/**
 * MenubarGroup
 *
 * Groups related menu items together.
 */
const MenubarGroup = MenubarPrimitive.Group;

/**
 * MenubarPortal
 *
 * Portals the content to the body.
 */
const MenubarPortal = MenubarPrimitive.Portal;

/**
 * MenubarRadioGroup
 *
 * Groups radio items together.
 */
const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

/**
 * MenubarSub
 *
 * Contains a submenu.
 */
const MenubarSub = MenubarPrimitive.Sub;

/**
 * MenubarTriggerProps
 *
 * Props for the MenubarTrigger component.
 */
interface MenubarTriggerProps extends React.ComponentProps<
  typeof MenubarPrimitive.Trigger
> {}

/**
 * MenubarTrigger
 *
 * A top-level menu trigger in the bar. Opens its menu on click.
 */
function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'nx:flex nx:select-none nx:items-center nx:rounded-sm nx:px-2 nx:py-1',
        'nx:typography-label-default nx:outline-none',
        'nx:focus:bg-background-hover nx:focus:text-foreground',
        'nx:data-[state=open]:bg-background-hover nx:data-[state=open]:text-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * MenubarSubTriggerProps
 *
 * Props for the MenubarSubTrigger component.
 */
interface MenubarSubTriggerProps extends React.ComponentProps<
  typeof MenubarPrimitive.SubTrigger
> {
  /**
   * Indents the trigger to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * MenubarSubTrigger
 *
 * The trigger for a submenu. Renders a chevron to indicate a submenu.
 */
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenubarSubTriggerProps) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        'nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2',
        'nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-[state=open]:bg-popover-hover nx:data-[state=open]:text-popover-foreground',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        staggeredItemClassName,
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    >
      {children}
      <IconChevronRight className="nx:ml-auto nx:size-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

/**
 * MenubarSubContentProps
 *
 * Props for the MenubarSubContent component.
 */
interface MenubarSubContentProps extends React.ComponentProps<
  typeof MenubarPrimitive.SubContent
> {}

/**
 * MenubarSubContent
 *
 * The content container for a submenu.
 */
function MenubarSubContent({ className, ...props }: MenubarSubContentProps) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        'nx:z-popover nx:min-w-32 nx:overflow-hidden',
        popoverSurfaceClassName,
        'nx:p-1',
        overlayFloatingTransitionClassName,
        staggeredItemContainerClassName,
        className
      )}
      {...props}
    />
  );
}

/**
 * MenubarContentProps
 *
 * Props for the MenubarContent component.
 */
interface MenubarContentProps extends React.ComponentProps<
  typeof MenubarPrimitive.Content
> {}

/**
 * MenubarContent
 *
 * The menu content container. Anchors below its trigger.
 *
 * @example
 * ```tsx
 * <MenubarContent>
 *   <MenubarItem>New Tab</MenubarItem>
 *   <MenubarItem>New Window</MenubarItem>
 * </MenubarContent>
 * ```
 */
function MenubarContent({
  className,
  align = 'start',
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenubarContentProps) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'nx:z-popover nx:min-w-48 nx:overflow-hidden',
          popoverSurfaceClassName,
          'nx:p-1',
          overlayFloatingTransitionClassName,
          staggeredItemContainerClassName,
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}

const menubarItemVariants = cva(
  `nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none nx:transition-colors nx:focus:bg-popover-hover nx:focus:text-popover-foreground nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0 ${staggeredItemClassName}`,
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'nx:text-error-subtle-foreground nx:focus:bg-error-background nx:focus:text-error-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * MenubarItemProps
 *
 * Props for the MenubarItem component.
 */
interface MenubarItemProps
  extends
    React.ComponentProps<typeof MenubarPrimitive.Item>,
    VariantProps<typeof menubarItemVariants> {
  /**
   * Indents the item to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * MenubarItem
 *
 * An individual menu item.
 *
 * @example
 * ```tsx
 * <MenubarItem>New Tab</MenubarItem>
 * <MenubarItem variant="destructive">Delete</MenubarItem>
 * ```
 */
function MenubarItem({
  className,
  inset,
  variant = 'default',
  ...props
}: MenubarItemProps) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        menubarItemVariants({ variant }),
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    />
  );
}

/**
 * MenubarCheckboxItemProps
 *
 * Props for the MenubarCheckboxItem component.
 */
interface MenubarCheckboxItemProps extends React.ComponentProps<
  typeof MenubarPrimitive.CheckboxItem
> {}

/**
 * MenubarCheckboxItem
 *
 * A menu item that can be checked/unchecked.
 *
 * @example
 * ```tsx
 * <MenubarCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
 *   Status Bar
 * </MenubarCheckboxItem>
 * ```
 */
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenubarCheckboxItemProps) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        staggeredItemClassName,
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <MenubarPrimitive.ItemIndicator>
          <IconCheck className="nx:size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

/**
 * MenubarRadioItemProps
 *
 * Props for the MenubarRadioItem component.
 */
interface MenubarRadioItemProps extends React.ComponentProps<
  typeof MenubarPrimitive.RadioItem
> {}

/**
 * MenubarRadioItem
 *
 * A radio menu item for exclusive selection.
 *
 * @example
 * ```tsx
 * <MenubarRadioGroup value={position} onValueChange={setPosition}>
 *   <MenubarRadioItem value="top">Top</MenubarRadioItem>
 *   <MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
 * </MenubarRadioGroup>
 * ```
 */
function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarRadioItemProps) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        staggeredItemClassName,
        className
      )}
      {...props}
    >
      <span className="nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <MenubarPrimitive.ItemIndicator>
          <IconCircleFilled className="nx:size-2" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

/**
 * MenubarLabelProps
 *
 * Props for the MenubarLabel component.
 */
interface MenubarLabelProps extends React.ComponentProps<
  typeof MenubarPrimitive.Label
> {
  /**
   * Indents the label to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * MenubarLabel
 *
 * A label for a group of menu items.
 *
 * @example
 * ```tsx
 * <MenubarLabel>Appearance</MenubarLabel>
 * ```
 */
function MenubarLabel({ className, inset, ...props }: MenubarLabelProps) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        'nx:px-2 nx:py-1.5 nx:typography-label-default',
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    />
  );
}

/**
 * MenubarSeparatorProps
 *
 * Props for the MenubarSeparator component.
 */
interface MenubarSeparatorProps extends React.ComponentProps<
  typeof MenubarPrimitive.Separator
> {}

/**
 * MenubarSeparator
 *
 * A visual divider between menu items.
 */
function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

/**
 * MenubarShortcutProps
 *
 * Props for the MenubarShortcut component.
 */
interface MenubarShortcutProps extends React.ComponentProps<'span'> {}

/**
 * MenubarShortcut
 *
 * Displays a keyboard shortcut hint.
 *
 * @example
 * ```tsx
 * <MenubarItem>
 *   New Tab <MenubarShortcut>⌘T</MenubarShortcut>
 * </MenubarItem>
 * ```
 */
function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        'nx:ml-auto nx:typography-shortcut nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarCheckboxItem,
  type MenubarCheckboxItemProps,
  MenubarContent,
  type MenubarContentProps,
  MenubarGroup,
  MenubarItem,
  type MenubarItemProps,
  menubarItemVariants,
  MenubarLabel,
  type MenubarLabelProps,
  MenubarMenu,
  MenubarPortal,
  type MenubarProps,
  MenubarRadioGroup,
  MenubarRadioItem,
  type MenubarRadioItemProps,
  MenubarSeparator,
  type MenubarSeparatorProps,
  MenubarShortcut,
  type MenubarShortcutProps,
  MenubarSub,
  MenubarSubContent,
  type MenubarSubContentProps,
  MenubarSubTrigger,
  type MenubarSubTriggerProps,
  MenubarTrigger,
  type MenubarTriggerProps,
};
