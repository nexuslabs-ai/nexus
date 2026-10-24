import * as React from 'react';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronRight, IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Root component for the dropdown menu. Holds the open state.
 */
const DropdownMenu = DropdownMenuPrimitive.Root;

/**
 * The button that opens and closes the menu.
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/**
 * Groups related menu items.
 */
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

/**
 * Renders the content into `document.body`.
 */
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

/**
 * Root of a submenu.
 */
const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/**
 * Groups radio items so only one is checked.
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
   * Indents the trigger to line up with items that have a leading icon or check.
   */
  inset?: boolean;
}

/**
 * The item that opens a submenu. Shows a trailing chevron.
 */
const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuSubTriggerProps>
>(function DropdownMenuSubTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    children,
    ...props
  }: React.PropsWithoutRef<DropdownMenuSubTriggerProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
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
    </DropdownMenuPrimitive.SubTrigger>
  );
});

/**
 * DropdownMenuSubContentProps
 *
 * Props for the DropdownMenuSubContent component.
 */
type DropdownMenuSubContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
>;

/**
 * The panel that holds a submenu's items.
 */
const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuSubContentProps>
>(function DropdownMenuSubContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DropdownMenuSubContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
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
 * DropdownMenuContentProps
 *
 * Props for the DropdownMenuContent component.
 */
type DropdownMenuContentProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
>;

/**
 * The menu panel. Opens next to the trigger in a portal.
 */
const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuContentProps>
>(function DropdownMenuContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    sideOffset = 4,
    ...props
  }: React.PropsWithoutRef<DropdownMenuContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'nx:z-popover nx:max-h-(--radix-dropdown-menu-content-available-height)',
          'nx:min-w-32 nx:overflow-x-hidden nx:overflow-y-auto',
          popoverSurfaceClassName,
          'nx:p-1',
          overlayFloatingTransitionClassName,
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

const dropdownMenuItemVariants = cva(
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
 * DropdownMenuItemProps
 *
 * Props for the DropdownMenuItem component.
 */
interface DropdownMenuItemProps
  extends
    React.ComponentProps<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {
  /**
   * Indents the item to line up with items that have a leading icon or check.
   */
  inset?: boolean;
}

/**
 * A single menu action.
 */
const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuItemProps>
>(function DropdownMenuItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<DropdownMenuItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * DropdownMenuCheckboxItemProps
 *
 * Props for the DropdownMenuCheckboxItem component.
 */
type DropdownMenuCheckboxItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>;

/**
 * A menu item that toggles on and off.
 */
const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuCheckboxItemProps>
>(function DropdownMenuCheckboxItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    checked,
    ...props
  }: React.PropsWithoutRef<DropdownMenuCheckboxItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
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
        <DropdownMenuPrimitive.ItemIndicator
          forceMount
          data-slot="dropdown-menu-checkbox-indicator"
        >
          <IconCheck
            data-slot="dropdown-menu-checkbox-indicator-icon"
            aria-hidden="true"
            className={cn(
              'nx:size-4',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100',
              'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
            )}
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

/**
 * DropdownMenuRadioItemProps
 *
 * Props for the DropdownMenuRadioItem component.
 */
type DropdownMenuRadioItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>;

/**
 * A menu item for picking one option from a DropdownMenuRadioGroup.
 */
const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuRadioItemProps>
>(function DropdownMenuRadioItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<DropdownMenuRadioItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
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
        <DropdownMenuPrimitive.ItemIndicator
          forceMount
          data-slot="dropdown-menu-radio-indicator"
        >
          <IconCircleFilled
            data-slot="dropdown-menu-radio-indicator-icon"
            aria-hidden="true"
            className={cn(
              'nx:size-2',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
            )}
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

/**
 * DropdownMenuLabelProps
 *
 * Props for the DropdownMenuLabel component.
 */
interface DropdownMenuLabelProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Label
> {
  /**
   * Indents the label to line up with items that have a leading icon or check.
   */
  inset?: boolean;
}

/**
 * A heading for a group of menu items.
 */
const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuLabelProps>
>(function DropdownMenuLabel(propsWithoutRef, forwardedRef) {
  const {
    className,
    inset,
    ...props
  }: React.PropsWithoutRef<DropdownMenuLabelProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
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
 * DropdownMenuSeparatorProps
 *
 * Props for the DropdownMenuSeparator component.
 */
type DropdownMenuSeparatorProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>;

/**
 * A divider between menu items.
 */
const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DropdownMenuSeparatorProps>
>(function DropdownMenuSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DropdownMenuSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * DropdownMenuShortcutProps
 *
 * Props for the DropdownMenuShortcut component.
 */
type DropdownMenuShortcutProps = React.ComponentProps<'span'>;

/**
 * A keyboard shortcut hint, right-aligned in a DropdownMenuItem.
 */
const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<DropdownMenuShortcutProps>
>(function DropdownMenuShortcut(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DropdownMenuShortcutProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'nx:ml-auto nx:typography-shortcut nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

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
