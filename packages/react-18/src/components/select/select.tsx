import * as React from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { cva, type VariantProps } from 'class-variance-authority';

import { fieldSizeVariants } from '../../lib/field-size';
import { IconCheck, IconChevronDown, IconChevronUp } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

/**
 * Root of the select. Holds the open state and the selected value.
 */
const Select = SelectPrimitive.Root;

/**
 * Groups related items.
 */
const SelectGroup = SelectPrimitive.Group;

/**
 * Shows the selected value. Set `placeholder` for the empty state.
 */
const SelectValue = SelectPrimitive.Value;

const selectTriggerVariants = cva(
  [
    'nx:group/select-trigger nx:flex nx:box-border nx:w-full nx:items-center nx:justify-between nx:gap-2',
    'nx:rounded-md nx:border-default nx:transition-field',
    'nx:whitespace-nowrap nx:text-inherit',
    'nx:data-[placeholder]:text-muted-foreground',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
    'nx:[&>span]:line-clamp-1',
  ],
  {
    variants: {
      size: fieldSizeVariants,
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:enabled:hover:bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'bordered',
    },
  }
);

/**
 * Props for SelectTrigger.
 */
type SelectTriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants>;

/**
 * Button that opens the dropdown. Set `variant="borderless"` to drop the border
 * and keep a tinted fill.
 */
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SelectTriggerProps>
>(function SelectTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    size,
    variant,
    ...props
  }: React.PropsWithoutRef<SelectTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size ?? 'default'}
      data-variant={variant ?? 'bordered'}
      className={cn(selectTriggerVariants({ size, variant, className }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <IconChevronDown className="nx:size-4 nx:text-muted-foreground nx:group-disabled/select-trigger:text-disabled-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

/**
 * Scrolls the list up.
 */
const SelectScrollUpButton = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<
    React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
  >
>(function SelectScrollUpButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<
    React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
  > & { ref?: React.ForwardedRef<HTMLDivElement> } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Scrolls the list down.
 */
const SelectScrollDownButton = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<
    React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
  >
>(function SelectScrollDownButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<
    React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
  > & { ref?: React.ForwardedRef<HTMLDivElement> } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SelectContent.
 */
type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Content>;

/**
 * Dropdown that holds the items.
 */
const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SelectContentProps>
>(function SelectContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    position = 'popper',
    ...props
  }: React.PropsWithoutRef<SelectContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * Props for SelectLabel.
 */
type SelectLabelProps = React.ComponentProps<typeof SelectPrimitive.Label>;

/**
 * Label for a group of items.
 */
const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SelectLabelProps>
>(function SelectLabel(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SelectLabelProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('nx:px-2 nx:py-1.5 nx:typography-label-default', className)}
      {...props}
    />
  );
});

/**
 * Props for SelectItem.
 */
type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item>;

/**
 * One option in the dropdown.
 */
const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SelectItemProps>
>(function SelectItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<SelectItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'nx:group nx:relative nx:flex nx:w-full nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
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
});

/**
 * Props for SelectSeparator.
 */
type SelectSeparatorProps = React.ComponentProps<
  typeof SelectPrimitive.Separator
>;

/**
 * Divider between items or groups.
 */
const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<SelectSeparatorProps>
>(function SelectSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<SelectSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
