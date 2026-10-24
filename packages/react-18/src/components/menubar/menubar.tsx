import * as React from 'react';

import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronRight, IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Props for the Menubar component.
 */
type MenubarProps = React.ComponentProps<typeof MenubarPrimitive.Root>;

/**
 * Horizontal bar of menus, like the menu bar in a desktop app.
 */
const Menubar = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarProps>
>(function Menubar(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MenubarProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        'nx:flex nx:items-center nx:gap-1 nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:p-1 nx:shadow-xs',
        className
      )}
      {...props}
    />
  );
});

/**
 * Groups a trigger with its content. One per top-level menu.
 */
const MenubarMenu = MenubarPrimitive.Menu;

/**
 * Groups related menu items together.
 */
const MenubarGroup = MenubarPrimitive.Group;

/**
 * Renders menu content in a portal on `document.body`.
 */
const MenubarPortal = MenubarPrimitive.Portal;

/**
 * Groups radio items together.
 */
const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

/**
 * Contains a submenu.
 */
const MenubarSub = MenubarPrimitive.Sub;

/**
 * Props for the MenubarTrigger component.
 */
type MenubarTriggerProps = React.ComponentProps<
  typeof MenubarPrimitive.Trigger
>;

/**
 * Top-level button in the bar. Opens its menu on click.
 */
const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<MenubarTriggerProps>
>(function MenubarTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MenubarTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        'nx:flex nx:select-none nx:items-center nx:rounded-sm nx:border-0 nx:bg-transparent nx:px-2 nx:py-1 nx:text-inherit',
        'nx:typography-label-default nx:outline-none',
        'nx:focus:bg-container-hover nx:focus:text-foreground',
        'nx:data-[state=open]:bg-container-hover nx:data-[state=open]:text-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the MenubarSubTrigger component.
 */
interface MenubarSubTriggerProps extends React.ComponentProps<
  typeof MenubarPrimitive.SubTrigger
> {
  /**
   * Indents the trigger to align with items that have a leading icon or checkbox.
   */
  inset?: boolean;
}

/**
 * Item that opens a submenu. Shows a chevron.
 */
const MenubarSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarSubTriggerProps>
>(function MenubarSubTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    children,
    ...props
  }: React.PropsWithoutRef<MenubarSubTriggerProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    >
      {children}
      <IconChevronRight className="nx:ml-auto nx:size-4" />
    </MenubarPrimitive.SubTrigger>
  );
});

/**
 * Props for the MenubarSubContent component.
 */
type MenubarSubContentProps = React.ComponentProps<
  typeof MenubarPrimitive.SubContent
>;

/**
 * Container for the items of a submenu.
 */
const MenubarSubContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarSubContentProps>
>(function MenubarSubContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MenubarSubContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        'nx:z-popover nx:min-w-32 nx:overflow-hidden',
        popoverSurfaceClassName,
        'nx:p-1',
        overlayFloatingTransitionClassName,
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the MenubarContent component.
 */
type MenubarContentProps = React.ComponentProps<
  typeof MenubarPrimitive.Content
>;

/**
 * Container for the items of a menu. Opens below its trigger.
 */
const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarContentProps>
>(function MenubarContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    align = 'start',
    alignOffset = -4,
    sideOffset = 8,
    ...props
  }: React.PropsWithoutRef<MenubarContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});

const menubarItemVariants = cva(
  'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none nx:transition-colors nx:focus:bg-popover-hover nx:focus:text-popover-foreground nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
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
 * Props for the MenubarItem component.
 */
interface MenubarItemProps
  extends
    React.ComponentProps<typeof MenubarPrimitive.Item>,
    VariantProps<typeof menubarItemVariants> {
  /**
   * Indents the item to align with items that have a leading icon or checkbox.
   */
  inset?: boolean;
}

/**
 * Single action in a menu.
 */
const MenubarItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarItemProps>
>(function MenubarItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<MenubarItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the MenubarCheckboxItem component.
 */
type MenubarCheckboxItemProps = React.ComponentProps<
  typeof MenubarPrimitive.CheckboxItem
>;

/**
 * Menu item that toggles on and off.
 */
const MenubarCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarCheckboxItemProps>
>(function MenubarCheckboxItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    checked,
    ...props
  }: React.PropsWithoutRef<MenubarCheckboxItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        'nx:group nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="nx:pointer-events-none nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <MenubarPrimitive.ItemIndicator
          forceMount
          data-slot="menubar-checkbox-indicator"
        >
          <IconCheck
            data-slot="menubar-checkbox-indicator-icon"
            aria-hidden="true"
            className={cn(
              'nx:size-4',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100',
              'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
            )}
          />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
});

/**
 * Props for the MenubarRadioItem component.
 */
type MenubarRadioItemProps = React.ComponentProps<
  typeof MenubarPrimitive.RadioItem
>;

/**
 * Menu item for picking one option from a `MenubarRadioGroup`.
 */
const MenubarRadioItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarRadioItemProps>
>(function MenubarRadioItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<MenubarRadioItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        'nx:group nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        className
      )}
      {...props}
    >
      <span className="nx:pointer-events-none nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <MenubarPrimitive.ItemIndicator
          forceMount
          data-slot="menubar-radio-indicator"
        >
          <IconCircleFilled
            data-slot="menubar-radio-indicator-icon"
            aria-hidden="true"
            className={cn(
              'nx:size-2',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
            )}
          />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
});

/**
 * Props for the MenubarLabel component.
 */
interface MenubarLabelProps extends React.ComponentProps<
  typeof MenubarPrimitive.Label
> {
  /**
   * Indents the label to align with items that have a leading icon or checkbox.
   */
  inset?: boolean;
}

/**
 * Heading for a group of menu items.
 */
const MenubarLabel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarLabelProps>
>(function MenubarLabel(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    ...props
  }: React.PropsWithoutRef<MenubarLabelProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the MenubarSeparator component.
 */
type MenubarSeparatorProps = React.ComponentProps<
  typeof MenubarPrimitive.Separator
>;

/**
 * Divider between menu items.
 */
const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MenubarSeparatorProps>
>(function MenubarSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MenubarSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for the MenubarShortcut component.
 */
type MenubarShortcutProps = React.ComponentProps<'span'>;

/**
 * Keyboard shortcut hint at the end of an item.
 */
const MenubarShortcut = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<MenubarShortcutProps>
>(function MenubarShortcut(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MenubarShortcutProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
