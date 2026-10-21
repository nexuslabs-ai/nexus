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
interface ComboboxProps extends React.ComponentProps<typeof Popover> {}

/**
 * A searchable single-select field built from a Popover and a Command list.
 * Hold the selected value and the `open` state in your own component.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = React.useState(false);
 * const [value, setValue] = React.useState('');
 *
 * <Combobox open={open} onOpenChange={setOpen}>
 *   <ComboboxTrigger>
 *     {frameworks.find((f) => f.value === value)?.label ?? 'Select framework'}
 *   </ComboboxTrigger>
 *   <ComboboxContent>
 *     <ComboboxInput placeholder="Search framework..." />
 *     <ComboboxList>
 *       <ComboboxEmpty>No framework found.</ComboboxEmpty>
 *       {frameworks.map((framework) => (
 *         <ComboboxItem
 *           key={framework.value}
 *           value={framework.value}
 *           keywords={[framework.label]}
 *           selected={value === framework.value}
 *           onSelect={(next) => {
 *             setValue(next === value ? '' : next);
 *             setOpen(false);
 *           }}
 *         >
 *           {framework.label}
 *         </ComboboxItem>
 *       ))}
 *     </ComboboxList>
 *   </ComboboxContent>
 * </Combobox>
 * ```
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
interface ComboboxTriggerProps extends ButtonProps {}

/**
 * The button that opens the popover and shows the current selection. Renders an
 * outline Button with a trailing selector icon.
 */
function ComboboxTrigger({
  children,
  className,
  variant = 'outline',
  ...props
}: ComboboxTriggerProps) {
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
}

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
function ComboboxContent({
  align = 'start',
  children,
  className,
  label = 'Options',
  sideOffset = 4,
  ...props
}: ComboboxContentProps) {
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
}

/**
 * ComboboxInputProps
 *
 * Props for the ComboboxInput.
 */
interface ComboboxInputProps extends React.ComponentProps<
  typeof CommandInput
> {}

/**
 * The search field. It is the element with `role="combobox"`.
 */
function ComboboxInput({ className, ...props }: ComboboxInputProps) {
  return (
    <CommandInput data-slot="combobox-input" className={className} {...props} />
  );
}

/**
 * ComboboxListProps
 *
 * Props for the ComboboxList.
 */
interface ComboboxListProps extends React.ComponentProps<typeof CommandList> {}

/**
 * The scrollable list that holds options, groups and the empty state.
 */
function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <CommandList data-slot="combobox-list" className={className} {...props} />
  );
}

/**
 * ComboboxEmptyProps
 *
 * Props for the ComboboxEmpty.
 */
interface ComboboxEmptyProps extends React.ComponentProps<
  typeof CommandEmpty
> {}

/**
 * Shown when the search matches no options.
 */
function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <CommandEmpty
      data-slot="combobox-empty"
      className={cn('nx:text-muted-foreground', className)}
      {...props}
    />
  );
}

/**
 * ComboboxGroupProps
 *
 * Props for the ComboboxGroup.
 */
interface ComboboxGroupProps extends React.ComponentProps<
  typeof CommandGroup
> {}

/**
 * Groups related options under an optional `heading`.
 */
function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return (
    <CommandGroup data-slot="combobox-group" className={className} {...props} />
  );
}

/**
 * ComboboxSeparatorProps
 *
 * Props for the ComboboxSeparator.
 */
interface ComboboxSeparatorProps extends React.ComponentProps<
  typeof CommandSeparator
> {}

/**
 * A decorative divider between groups or options.
 */
function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <CommandSeparator
      data-slot="combobox-separator"
      className={className}
      {...props}
    />
  );
}

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
function ComboboxItem({
  children,
  className,
  selected = false,
  ...props
}: ComboboxItemProps) {
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
}

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
