import * as React from 'react';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronRight, IconCircleFilled } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * DropdownMenu
 *
 * Root component for the dropdown menu. Controls open/close state.
 *
 * @example
 * ```tsx
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Open</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Item 1</DropdownMenuItem>
 *     <DropdownMenuItem>Item 2</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */
const DropdownMenu = DropdownMenuPrimitive.Root;

/**
 * DropdownMenuTrigger
 *
 * The button that toggles the dropdown menu.
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/**
 * DropdownMenuGroup
 *
 * Groups related menu items together.
 */
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

/**
 * DropdownMenuPortal
 *
 * Portals the content to the body.
 */
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

/**
 * DropdownMenuSub
 *
 * Contains a submenu.
 */
const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/**
 * DropdownMenuRadioGroup
 *
 * Groups radio items together.
 */
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * DropdownMenuSubTriggerProps
 *
 * Props for the DropdownMenuSubTrigger component.
 */
interface DropdownMenuSubTriggerProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.SubTrigger
> {
  /**
   * Indents the trigger to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * DropdownMenuSubTrigger
 *
 * The trigger for a submenu. Renders a chevron to indicate a submenu.
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2',
        'nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-small nx:outline-none',
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
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/**
 * DropdownMenuSubContentProps
 *
 * Props for the DropdownMenuSubContent component.
 */
interface DropdownMenuSubContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
> {}

/**
 * DropdownMenuSubContent
 *
 * The content container for a submenu.
 */
function DropdownMenuSubContent({
  className,
  ...props
}: DropdownMenuSubContentProps) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'nx:z-popover nx:min-w-32 nx:overflow-hidden',
        'nx:rounded-md nx:border nx:border-border-default',
        'nx:bg-popover nx:p-1 nx:text-popover-foreground nx:shadow-lg',
        'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
        'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
        'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
        'nx:data-[side=bottom]:slide-in-from-top-2',
        'nx:data-[side=left]:slide-in-from-right-2',
        'nx:data-[side=right]:slide-in-from-left-2',
        'nx:data-[side=top]:slide-in-from-bottom-2',
        'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * DropdownMenuContentProps
 *
 * Props for the DropdownMenuContent component.
 */
interface DropdownMenuContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
> {}

/**
 * DropdownMenuContent
 *
 * The dropdown content container.
 *
 * @example
 * ```tsx
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Profile</DropdownMenuItem>
 *   <DropdownMenuItem>Settings</DropdownMenuItem>
 * </DropdownMenuContent>
 * ```
 */
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'nx:z-popover nx:max-h-(--radix-dropdown-menu-content-available-height)',
          'nx:min-w-32 nx:overflow-x-hidden nx:overflow-y-auto',
          'nx:rounded-md nx:border nx:border-border-default',
          'nx:bg-popover nx:p-1 nx:text-popover-foreground nx:shadow-lg',
          'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
          'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
          'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
          'nx:data-[side=bottom]:slide-in-from-top-2',
          'nx:data-[side=left]:slide-in-from-right-2',
          'nx:data-[side=right]:slide-in-from-left-2',
          'nx:data-[side=top]:slide-in-from-bottom-2',
          'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

const dropdownMenuItemVariants = cva(
  'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-small nx:outline-none nx:transition-colors nx:focus:bg-popover-hover nx:focus:text-popover-foreground nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
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
 * DropdownMenuItemProps
 *
 * Props for the DropdownMenuItem component.
 */
interface DropdownMenuItemProps
  extends
    React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {
  /**
   * Indents the item to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * DropdownMenuItem
 *
 * An individual menu item.
 *
 * @example
 * ```tsx
 * <DropdownMenuItem>Profile</DropdownMenuItem>
 * <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
 * ```
 */
function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        dropdownMenuItemVariants({ variant }),
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    />
  );
}

/**
 * DropdownMenuCheckboxItemProps
 *
 * Props for the DropdownMenuCheckboxItem component.
 */
interface DropdownMenuCheckboxItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
> {}

/**
 * DropdownMenuCheckboxItem
 *
 * A menu item that can be checked/unchecked.
 *
 * @example
 * ```tsx
 * <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
 *   Show Panel
 * </DropdownMenuCheckboxItem>
 * ```
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-small nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <IconCheck className="nx:size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

/**
 * DropdownMenuRadioItemProps
 *
 * Props for the DropdownMenuRadioItem component.
 */
interface DropdownMenuRadioItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
> {}

/**
 * DropdownMenuRadioItem
 *
 * A radio menu item for exclusive selection.
 *
 * @example
 * ```tsx
 * <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
 *   <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
 *   <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
 * </DropdownMenuRadioGroup>
 * ```
 */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-small nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        className
      )}
      {...props}
    >
      <span className="nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <IconCircleFilled className="nx:size-2" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

/**
 * DropdownMenuLabelProps
 *
 * Props for the DropdownMenuLabel component.
 */
interface DropdownMenuLabelProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Label
> {
  /**
   * Indents the label to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * DropdownMenuLabel
 *
 * A label for a group of menu items.
 *
 * @example
 * ```tsx
 * <DropdownMenuLabel>My Account</DropdownMenuLabel>
 * ```
 */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'nx:px-2 nx:py-1.5 nx:typography-label-large',
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    />
  );
}

/**
 * DropdownMenuSeparatorProps
 *
 * Props for the DropdownMenuSeparator component.
 */
interface DropdownMenuSeparatorProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
> {}

/**
 * DropdownMenuSeparator
 *
 * A visual divider between menu items.
 */
function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuSeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

/**
 * DropdownMenuShortcutProps
 *
 * Props for the DropdownMenuShortcut component.
 */
interface DropdownMenuShortcutProps extends React.ComponentProps<'span'> {}

/**
 * DropdownMenuShortcut
 *
 * Displays a keyboard shortcut hint.
 *
 * @example
 * ```tsx
 * <DropdownMenuItem>
 *   New Tab <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
 * </DropdownMenuItem>
 * ```
 */
function DropdownMenuShortcut({
  className,
  ...props
}: DropdownMenuShortcutProps) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'nx:ml-auto nx:text-xs nx:tracking-widest nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  type DropdownMenuItemProps,
  dropdownMenuItemVariants,
  DropdownMenuLabel,
  type DropdownMenuLabelProps,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemProps,
  DropdownMenuSeparator,
  type DropdownMenuSeparatorProps,
  DropdownMenuShortcut,
  type DropdownMenuShortcutProps,
  DropdownMenuSub,
  DropdownMenuSubContent,
  type DropdownMenuSubContentProps,
  DropdownMenuSubTrigger,
  type DropdownMenuSubTriggerProps,
  DropdownMenuTrigger,
};
