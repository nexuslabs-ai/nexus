import * as React from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconChevronDown, IconChevronUp } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
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
 * Select
 *
 * Root component for the select. Controls open/close state and value.
 *
 * @example
 * ```tsx
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select an option" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">Option 1</SelectItem>
 *     <SelectItem value="option2">Option 2</SelectItem>
 *   </SelectContent>
 * </Select>
 * ```
 */
const Select = SelectPrimitive.Root;

/**
 * SelectGroup
 *
 * Groups related select items together.
 */
const SelectGroup = SelectPrimitive.Group;

/**
 * SelectValue
 *
 * Displays the selected value. Use `placeholder` for empty state.
 */
const SelectValue = SelectPrimitive.Value;

const selectTriggerVariants = cva(
  [
    'nx:group/select-trigger nx:flex nx:box-border nx:w-full nx:items-center nx:justify-between nx:gap-2',
    'nx:rounded-md nx:border-default nx:transition-colors',
    'nx:h-10 nx:px-3 nx:py-0 nx:typography-body-default',
    'nx:whitespace-nowrap',
    'nx:data-[placeholder]:text-muted-foreground',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
    'nx:[&>span]:line-clamp-1',
  ],
  {
    variants: {
      variant: {
        default:
          'nx:border-border-default nx:bg-background nx:enabled:hover:bg-background-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * SelectTriggerProps
 *
 * Props for the SelectTrigger component.
 */
interface SelectTriggerProps
  extends
    React.ComponentProps<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

/**
 * SelectTrigger
 *
 * Button that opens the select dropdown. Use `variant="borderless"` to remove
 * the visible border while keeping a tonal control fill for resting affordance.
 *
 * @example
 * ```tsx
 * <SelectTrigger className="w-[180px]">
 *   <SelectValue placeholder="Select a theme" />
 * </SelectTrigger>
 * ```
 */
function SelectTrigger({
  className,
  children,
  variant,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-variant={variant ?? 'default'}
      className={cn(selectTriggerVariants({ variant, className }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <IconChevronDown className="nx:size-4 nx:text-muted-foreground nx:group-disabled/select-trigger:text-disabled-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * SelectScrollUpButton
 *
 * Button to scroll up in the select content.
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        'nx:flex nx:cursor-default nx:items-center nx:justify-center nx:py-1',
        className
      )}
      {...props}
    >
      <IconChevronUp className="nx:size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * SelectScrollDownButton
 *
 * Button to scroll down in the select content.
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        'nx:flex nx:cursor-default nx:items-center nx:justify-center nx:py-1',
        className
      )}
      {...props}
    >
      <IconChevronDown className="nx:size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

/**
 * SelectContentProps
 *
 * Props for the SelectContent component.
 */
interface SelectContentProps extends React.ComponentProps<
  typeof SelectPrimitive.Content
> {}

/**
 * SelectContent
 *
 * The dropdown content container for select items.
 *
 * @example
 * ```tsx
 * <SelectContent>
 *   <SelectItem value="light">Light</SelectItem>
 *   <SelectItem value="dark">Dark</SelectItem>
 * </SelectContent>
 * ```
 */
function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'nx:relative nx:z-popover nx:max-h-96 nx:min-w-32 nx:overflow-hidden',
          popoverSurfaceClassName,
          // Radix Select renders closed content into a detached DocumentFragment, so the
          // `data-[state=closed]` exit + presence bridge inside this shared class are inert
          // here — only the open-state transition applies.
          overlayFloatingTransitionClassName,
          staggeredItemContainerClassName,
          position === 'popper' &&
            'nx:data-[side=bottom]:translate-y-1 nx:data-[side=left]:-translate-x-1 nx:data-[side=right]:translate-x-1 nx:data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'nx:p-1',
            position === 'popper' &&
              'nx:h-(--radix-select-trigger-height) nx:w-full nx:min-w-(--radix-select-trigger-width)'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/**
 * SelectLabelProps
 *
 * Props for the SelectLabel component.
 */
interface SelectLabelProps extends React.ComponentProps<
  typeof SelectPrimitive.Label
> {}

/**
 * SelectLabel
 *
 * Label for a group of select items.
 *
 * @example
 * ```tsx
 * <SelectGroup>
 *   <SelectLabel>Fruits</SelectLabel>
 *   <SelectItem value="apple">Apple</SelectItem>
 * </SelectGroup>
 * ```
 */
function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('nx:px-2 nx:py-1.5 nx:typography-label-default', className)}
      {...props}
    />
  );
}

/**
 * SelectItemProps
 *
 * Props for the SelectItem component.
 */
interface SelectItemProps extends React.ComponentProps<
  typeof SelectPrimitive.Item
> {}

/**
 * SelectItem
 *
 * Individual selectable option in the select dropdown.
 *
 * @example
 * ```tsx
 * <SelectItem value="light">Light</SelectItem>
 * ```
 */
function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'nx:group nx:relative nx:flex nx:w-full nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        staggeredItemClassName,
        className
      )}
      {...props}
    >
      <span className="nx:pointer-events-none nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        {/* SelectPrimitive.ItemIndicator does not support forceMount and unmounts
            when unchecked, so this icon mirrors item state for the cross-fade. */}
        <IconCheck
          data-slot="select-item-indicator-icon"
          aria-hidden="true"
          className={cn(
            'nx:size-4',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )}
        />
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/**
 * SelectSeparatorProps
 *
 * Props for the SelectSeparator component.
 */
interface SelectSeparatorProps extends React.ComponentProps<
  typeof SelectPrimitive.Separator
> {}

/**
 * SelectSeparator
 *
 * Visual divider between select items or groups.
 *
 * @example
 * ```tsx
 * <SelectItem value="option1">Option 1</SelectItem>
 * <SelectSeparator />
 * <SelectItem value="option2">Option 2</SelectItem>
 * ```
 */
function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  type SelectContentProps,
  SelectGroup,
  SelectItem,
  type SelectItemProps,
  SelectLabel,
  type SelectLabelProps,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  type SelectSeparatorProps,
  SelectTrigger,
  type SelectTriggerProps,
  selectTriggerVariants,
  SelectValue,
};
