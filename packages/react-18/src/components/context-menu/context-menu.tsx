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
 * Root component for the context menu. Opens when the trigger is right-clicked.
 */
const ContextMenu = ContextMenuPrimitive.Root;

/**
 * The area that opens the menu when right-clicked.
 */
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

/**
 * Groups related menu items.
 */
const ContextMenuGroup = ContextMenuPrimitive.Group;

/**
 * Renders the content into `document.body`.
 */
const ContextMenuPortal = ContextMenuPrimitive.Portal;

/**
 * Root of a submenu.
 */
const ContextMenuSub = ContextMenuPrimitive.Sub;

/**
 * Groups radio items so only one is checked.
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
   * Indents the trigger to line up with items that have a leading icon or check.
   */
  inset?: boolean;
}

/**
 * The item that opens a submenu. Shows a trailing chevron.
 */
const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuSubTriggerProps>
>(function ContextMenuSubTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    children,
    ...props
  }: React.PropsWithoutRef<ContextMenuSubTriggerProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuSubContentProps
 *
 * Props for the ContextMenuSubContent component.
 */
type ContextMenuSubContentProps = React.ComponentProps<
  typeof ContextMenuPrimitive.SubContent
>;

/**
 * The panel that holds a submenu's items.
 */
const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuSubContentProps>
>(function ContextMenuSubContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ContextMenuSubContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuContentProps
 *
 * Props for the ContextMenuContent component.
 */
type ContextMenuContentProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Content
>;

/**
 * The menu panel. Opens at the cursor.
 */
const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuContentProps>
>(function ContextMenuContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ContextMenuContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
   * Indents the item to line up with items that have a leading icon or check.
   */
  inset?: boolean;
}

/**
 * A single menu action.
 */
const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuItemProps>
>(function ContextMenuItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<ContextMenuItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuCheckboxItemProps
 *
 * Props for the ContextMenuCheckboxItem component.
 */
type ContextMenuCheckboxItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.CheckboxItem
>;

/**
 * A menu item that toggles on and off.
 */
const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuCheckboxItemProps>
>(function ContextMenuCheckboxItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    checked,
    ...props
  }: React.PropsWithoutRef<ContextMenuCheckboxItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuRadioItemProps
 *
 * Props for the ContextMenuRadioItem component.
 */
type ContextMenuRadioItemProps = React.ComponentProps<
  typeof ContextMenuPrimitive.RadioItem
>;

/**
 * A menu item for picking one option from a ContextMenuRadioGroup.
 */
const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuRadioItemProps>
>(function ContextMenuRadioItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<ContextMenuRadioItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuLabelProps
 *
 * Props for the ContextMenuLabel component.
 */
interface ContextMenuLabelProps extends React.ComponentProps<
  typeof ContextMenuPrimitive.Label
> {
  /**
   * Indents the label to line up with items that have a leading icon or check.
   */
  inset?: boolean;
}

/**
 * A heading for a group of menu items.
 */
const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuLabelProps>
>(function ContextMenuLabel(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    ...props
  }: React.PropsWithoutRef<ContextMenuLabelProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuSeparatorProps
 *
 * Props for the ContextMenuSeparator component.
 */
type ContextMenuSeparatorProps = React.ComponentProps<
  typeof ContextMenuPrimitive.Separator
>;

/**
 * A divider between menu items.
 */
const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ContextMenuSeparatorProps>
>(function ContextMenuSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ContextMenuSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * ContextMenuShortcutProps
 *
 * Props for the ContextMenuShortcut component.
 */
type ContextMenuShortcutProps = React.ComponentProps<'span'>;

/**
 * A keyboard shortcut hint, right-aligned in a ContextMenuItem.
 */
const ContextMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<ContextMenuShortcutProps>
>(function ContextMenuShortcut(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ContextMenuShortcutProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
