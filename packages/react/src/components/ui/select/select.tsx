import * as React from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';

import { IconCheck, IconChevronDown, IconChevronUp } from '@/lib/icons';
import { cn } from '@/lib/utils';

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

/**
 * SelectTriggerProps
 *
 * Props for the SelectTrigger component.
 */
interface SelectTriggerProps extends React.ComponentProps<
  typeof SelectPrimitive.Trigger
> {}

/**
 * SelectTrigger
 *
 * Button that opens the select dropdown.
 *
 * @example
 * ```tsx
 * <SelectTrigger className="w-[180px]">
 *   <SelectValue placeholder="Select a theme" />
 * </SelectTrigger>
 * ```
 */
function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'nx:group/select-trigger nx:flex nx:w-full nx:items-center nx:justify-between nx:gap-2',
        'nx:rounded-md nx:border nx:border-border-default nx:bg-background nx:transition-colors nx:enabled:hover:bg-background-hover',
        'nx:px-3 nx:py-2 nx:typography-body-default',
        'nx:whitespace-nowrap',
        'nx:data-[placeholder]:text-muted-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
        'nx:[&>span]:line-clamp-1',
        className
      )}
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
          'nx:rounded-md nx:border nx:border-border-default nx:bg-popover nx:text-popover-foreground nx:shadow-lg',
          'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
          'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
          'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
          'nx:data-[state=open]:duration-default nx:data-[state=open]:ease-enter',
          'nx:data-[state=closed]:duration-fast nx:data-[state=closed]:ease-exit',
          'nx:data-[side=bottom]:slide-in-from-top-2 nx:data-[side=left]:slide-in-from-right-2',
          'nx:data-[side=right]:slide-in-from-left-2 nx:data-[side=top]:slide-in-from-bottom-2',
          'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
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
        'nx:relative nx:flex nx:w-full nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        className
      )}
      {...props}
    >
      <span className="nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center">
        <SelectPrimitive.ItemIndicator>
          <IconCheck className="nx:size-4" />
        </SelectPrimitive.ItemIndicator>
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
  SelectValue,
};
