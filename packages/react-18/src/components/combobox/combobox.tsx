'use client';

import * as React from 'react';

import { IconCheck, IconSelector } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command/command';
import {
  Popover,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
} from '../popover/popover';

/**
 * ComboboxProps
 *
 * Props for the Combobox root. Accepts the Popover root props, such as `open`
 * and `onOpenChange`.
 */
type ComboboxProps = React.ComponentProps<typeof Popover>;

/**
 * A searchable single-select field built from a Popover and a Command list.
 * Hold the selected value and the `open` state in your own component.
 */
function Combobox(props: ComboboxProps) {
  return <Popover {...props} />;
}

/**
 * ComboboxTriggerProps
 *
 * Props for the ComboboxTrigger. Accepts Button props, such as `size`,
 * `disabled` and `aria-invalid`.
 */
type ComboboxTriggerProps = ButtonProps;

/**
 * The button that opens the popover and shows the current selection. Renders an
 * outline Button with a trailing selector icon.
 */
const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<ComboboxTriggerProps>
>(function ComboboxTrigger(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    variant = 'outline',
    ...props
  }: React.PropsWithoutRef<ComboboxTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <PopoverTrigger asChild>
      <Button
        data-slot="combobox-trigger"
        variant={variant}
        className={cn(
          'nx:w-full nx:justify-between',
          'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
          className
        )}
        {...props}
      >
        {children}
        <IconSelector
          aria-hidden="true"
          data-slot="combobox-trigger-icon"
          className="nx:shrink-0 nx:text-muted-foreground"
        />
      </Button>
    </PopoverTrigger>
  );
});

/**
 * ComboboxContentProps
 *
 * Props for the ComboboxContent. Accepts PopoverContent props.
 */
interface ComboboxContentProps extends PopoverContentProps {
  /**
   * Accessible name for the search field and popover. Use the field's label text.
   */
  label?: string;
}

/**
 * The floating panel that holds the search field and options. Matches the
 * trigger width by default.
 */
const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ComboboxContentProps>
>(function ComboboxContent(propsWithoutRef, forwardedRef) {
  const {
    align = 'start',
    children,
    className,
    label = 'Options',
    sideOffset = 4,
    ...props
  }: React.PropsWithoutRef<ComboboxContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <PopoverContent
      data-slot="combobox-content"
      aria-label={label}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'nx:w-(--radix-popover-trigger-width) nx:min-w-48 nx:p-0',
        className
      )}
      {...props}
    >
      <Command data-slot="combobox" label={label} className="nx:bg-transparent">
        {children}
      </Command>
    </PopoverContent>
  );
});

/**
 * ComboboxInputProps
 *
 * Props for the ComboboxInput.
 */
type ComboboxInputProps = React.ComponentProps<typeof CommandInput>;

/**
 * The search field. It is the element with `role="combobox"`.
 */
const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.PropsWithoutRef<ComboboxInputProps>
>(function ComboboxInput(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ComboboxInputProps> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandInput data-slot="combobox-input" className={className} {...props} />
  );
});

/**
 * ComboboxListProps
 *
 * Props for the ComboboxList.
 */
type ComboboxListProps = React.ComponentProps<typeof CommandList>;

/**
 * The scrollable list that holds options, groups and the empty state.
 */
const ComboboxList = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ComboboxListProps>
>(function ComboboxList(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ComboboxListProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandList data-slot="combobox-list" className={className} {...props} />
  );
});

/**
 * ComboboxEmptyProps
 *
 * Props for the ComboboxEmpty.
 */
type ComboboxEmptyProps = React.ComponentProps<typeof CommandEmpty>;

/**
 * Shown when the search matches no options.
 */
const ComboboxEmpty = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ComboboxEmptyProps>
>(function ComboboxEmpty(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ComboboxEmptyProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandEmpty
      data-slot="combobox-empty"
      className={cn('nx:text-muted-foreground', className)}
      {...props}
    />
  );
});

/**
 * ComboboxGroupProps
 *
 * Props for the ComboboxGroup.
 */
type ComboboxGroupProps = React.ComponentProps<typeof CommandGroup>;

/**
 * Groups related options under an optional `heading`.
 */
const ComboboxGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ComboboxGroupProps>
>(function ComboboxGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ComboboxGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandGroup data-slot="combobox-group" className={className} {...props} />
  );
});

/**
 * ComboboxSeparatorProps
 *
 * Props for the ComboboxSeparator.
 */
type ComboboxSeparatorProps = React.ComponentProps<typeof CommandSeparator>;

/**
 * A decorative divider between groups or options.
 */
const ComboboxSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ComboboxSeparatorProps>
>(function ComboboxSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ComboboxSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandSeparator
      data-slot="combobox-separator"
      className={className}
      {...props}
    />
  );
});

/**
 * ComboboxItemProps
 *
 * Props for the ComboboxItem.
 */
interface ComboboxItemProps extends React.ComponentProps<typeof CommandItem> {
  /**
   * Marks the option as the current selection with a check.
   */
  selected?: boolean;
}

/**
 * A selectable option. Search matches `value` and `keywords`, not the visible
 * text, so pass the label in `keywords`.
 *
 * `onSelect` receives the trimmed `value` with its case kept. The highlighted
 * option gets `data-selected`, and `selected` adds the check.
 */
const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ComboboxItemProps>
>(function ComboboxItem(propsWithoutRef, forwardedRef) {
  const {
    children,
    className,
    selected = false,
    ...props
  }: React.PropsWithoutRef<ComboboxItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandItem data-slot="combobox-item" className={className} {...props}>
      {children}
      <IconCheck
        aria-hidden="true"
        data-slot="combobox-item-indicator"
        className={cn(
          'nx:ml-auto nx:transition-opacity',
          selected ? 'nx:opacity-100' : 'nx:opacity-0'
        )}
      />
    </CommandItem>
  );
});

export {
  Combobox,
  ComboboxContent,
  type ComboboxContentProps,
  ComboboxEmpty,
  type ComboboxEmptyProps,
  ComboboxGroup,
  type ComboboxGroupProps,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxItem,
  type ComboboxItemProps,
  ComboboxList,
  type ComboboxListProps,
  type ComboboxProps,
  ComboboxSeparator,
  type ComboboxSeparatorProps,
  ComboboxTrigger,
  type ComboboxTriggerProps,
};
