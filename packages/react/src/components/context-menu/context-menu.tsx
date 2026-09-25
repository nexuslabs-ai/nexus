import * as React from 'react';

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronRight, IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * ContextMenu
 *
 * Root component for the context menu. Opens on right-click of its trigger.
 *
 * @example
 * ```tsx
 * <ContextMenu>
 *   <ContextMenuTrigger>Right click here</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Item 1</ContextMenuItem>
 *     <ContextMenuItem>Item 2</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 * ```
 */
const ContextMenu = ContextMenuPrimitive.Root;

/**
 * ContextMenuTrigger
 *
 * The area that opens the context menu when right-clicked.
 */
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

/**
 * ContextMenuGroup
 *
 * Groups related menu items together.
 */
const ContextMenuGroup = ContextMenuPrimitive.Group;

/**
 * ContextMenuPortal
 *
 * Portals the content to the body.
 */
const ContextMenuPortal = ContextMenuPrimitive.Portal;

/**
 * ContextMenuSub
 *
 * Contains a submenu.
 */
const ContextMenuSub = ContextMenuPrimitive.Sub;

/**
 * ContextMenuRadioGroup
 *
 * Groups radio items together.
 */
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

/**
 * ContextMenuSubTriggerProps
 *
 * Props for the ContextMenuSubTrigger component.
 */
interface ContextMenuSubTriggerProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.SubTrigger
> {
  /**
   * Indents the trigger to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * ContextMenuSubTrigger
 *
 * The trigger for a submenu. Renders a chevron to indicate a submenu.
 */
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
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
    </ContextMenuPrimitive.SubTrigger>
  );
}

/**
 * ContextMenuSubContentProps
 *
 * Props for the ContextMenuSubContent component.
 */
interface ContextMenuSubContentProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.SubContent
> {}

/**
 * ContextMenuSubContent
 *
 * The content container for a submenu.
 */
function ContextMenuSubContent({
  className,
  ...props
}: ContextMenuSubContentProps) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
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
}

/**
 * ContextMenuContentProps
 *
 * Props for the ContextMenuContent component.
 */
interface ContextMenuContentProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.Content
> {}

/**
 * ContextMenuContent
 *
 * The context menu content container. Positions at the cursor.
 *
 * @example
 * ```tsx
 * <ContextMenuContent>
 *   <ContextMenuItem>Back</ContextMenuItem>
 *   <ContextMenuItem>Reload</ContextMenuItem>
 * </ContextMenuContent>
 * ```
 */
function ContextMenuContent({ className, ...props }: ContextMenuContentProps) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          'nx:z-popover nx:max-h-(--radix-context-menu-content-available-height)',
          'nx:min-w-32 nx:overflow-x-hidden nx:overflow-y-auto',
          popoverSurfaceClassName,
          'nx:p-1',
          overlayFloatingTransitionClassName,
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

const contextMenuItemVariants = cva(
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
 * ContextMenuItemProps
 *
 * Props for the ContextMenuItem component.
 */
interface ContextMenuItemProps
  extends
    React.ComponentProps<typeof ContextMenuPrimitive.Item>,
    VariantProps<typeof contextMenuItemVariants> {
  /**
   * Indents the item to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * ContextMenuItem
 *
 * An individual menu item.
 *
 * @example
 * ```tsx
 * <ContextMenuItem>Back</ContextMenuItem>
 * <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
 * ```
 */
function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: ContextMenuItemProps) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        contextMenuItemVariants({ variant }),
        inset && 'nx:pl-8',
        className
      )}
      {...props}
    />
  );
}

/**
 * ContextMenuCheckboxItemProps
 *
 * Props for the ContextMenuCheckboxItem component.
 */
interface ContextMenuCheckboxItemProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.CheckboxItem
> {}

/**
 * ContextMenuCheckboxItem
 *
 * A menu item that can be checked/unchecked.
 *
 * @example
 * ```tsx
 * <ContextMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
 *   Show Panel
 * </ContextMenuCheckboxItem>
 * ```
 */
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
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
        <ContextMenuPrimitive.ItemIndicator
          forceMount
          data-slot="context-menu-checkbox-indicator"
        >
          <IconCheck
            data-slot="context-menu-checkbox-indicator-icon"
            aria-hidden="true"
            className={cn(
              'nx:size-4',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100',
              'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
            )}
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

/**
 * ContextMenuRadioItemProps
 *
 * Props for the ContextMenuRadioItem component.
 */
interface ContextMenuRadioItemProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.RadioItem
> {}

/**
 * ContextMenuRadioItem
 *
 * A radio menu item for exclusive selection.
 *
 * @example
 * ```tsx
 * <ContextMenuRadioGroup value={position} onValueChange={setPosition}>
 *   <ContextMenuRadioItem value="top">Top</ContextMenuRadioItem>
 *   <ContextMenuRadioItem value="bottom">Bottom</ContextMenuRadioItem>
 * </ContextMenuRadioGroup>
 * ```
 */
function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
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
        <ContextMenuPrimitive.ItemIndicator
          forceMount
          data-slot="context-menu-radio-indicator"
        >
          <IconCircleFilled
            data-slot="context-menu-radio-indicator-icon"
            aria-hidden="true"
            className={cn(
              'nx:size-2',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
            )}
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

/**
 * ContextMenuLabelProps
 *
 * Props for the ContextMenuLabel component.
 */
interface ContextMenuLabelProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.Label
> {
  /**
   * Indents the label to align with items that have a leading icon or checkbox.
   * @default false
   */
  inset?: boolean;
}

/**
 * ContextMenuLabel
 *
 * A label for a group of menu items.
 *
 * @example
 * ```tsx
 * <ContextMenuLabel>Actions</ContextMenuLabel>
 * ```
 */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuLabelProps) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
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
 * ContextMenuSeparatorProps
 *
 * Props for the ContextMenuSeparator component.
 */
interface ContextMenuSeparatorProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.Separator
> {}

/**
 * ContextMenuSeparator
 *
 * A visual divider between menu items.
 */
function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

/**
 * ContextMenuShortcutProps
 *
 * Props for the ContextMenuShortcut component.
 */
interface ContextMenuShortcutProps extends React.ComponentProps<'span'> {}

/**
 * ContextMenuShortcut
 *
 * Displays a keyboard shortcut hint.
 *
 * @example
 * ```tsx
 * <ContextMenuItem>
 *   Reload <ContextMenuShortcut>⌘R</ContextMenuShortcut>
 * </ContextMenuItem>
 * ```
 */
function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'nx:ml-auto nx:typography-shortcut nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  type ContextMenuCheckboxItemProps,
  ContextMenuContent,
  type ContextMenuContentProps,
  ContextMenuGroup,
  ContextMenuItem,
  type ContextMenuItemProps,
  contextMenuItemVariants,
  ContextMenuLabel,
  type ContextMenuLabelProps,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  type ContextMenuRadioItemProps,
  ContextMenuSeparator,
  type ContextMenuSeparatorProps,
  ContextMenuShortcut,
  type ContextMenuShortcutProps,
  ContextMenuSub,
  ContextMenuSubContent,
  type ContextMenuSubContentProps,
  ContextMenuSubTrigger,
  type ContextMenuSubTriggerProps,
  ContextMenuTrigger,
};
