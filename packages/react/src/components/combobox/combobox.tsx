import * as React from 'react';

import { IconCheck, IconSelector } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../command';
import {
  Popover,
  PopoverContent,
  type PopoverContentProps,
  PopoverTrigger,
} from '../popover';

/**
 * ComboboxProps
 *
 * Props for the Combobox root. Inherits the Popover root props (`open`,
 * `onOpenChange`, `defaultOpen`, `modal`, …).
 */
interface ComboboxProps extends React.ComponentProps<typeof Popover> {}

/**
 * Combobox
 *
 * A searchable single-select field: a Popover trigger paired with the cmdk-powered
 * Command list. cmdk owns filtering, keyboard navigation, active-descendant
 * tracking, and ARIA — the combobox only composes the pieces. The selected
 * `value` and the popover `open` state are controlled at the call site; the
 * root owns no internal value, matching the composition (shadcn) model.
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
 * Props for the ComboboxTrigger. Inherits Button props, so `size`, `disabled`,
 * and `aria-invalid` flow through to the underlying control.
 */
interface ComboboxTriggerProps extends ButtonProps {}

/**
 * ComboboxTrigger
 *
 * The button that opens the popover, showing the current selection. Renders an
 * outline Button by default with a trailing selector affordance. Radix supplies
 * `aria-expanded` and focus return; the real combobox semantics live on the
 * ComboboxInput inside the popover.
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
          'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
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
 * Props for the ComboboxContent. Inherits PopoverContent props.
 */
interface ComboboxContentProps extends PopoverContentProps {
  /**
   * Accessible name for the search field and its popup. cmdk applies it to the
   * combobox input (via `aria-labelledby`), and it names the popover dialog. Set
   * it to the field's purpose, e.g. the associated label text.
   * @default 'Options'
   */
  label?: string;
}

/**
 * ComboboxContent
 *
 * The floating panel: a PopoverContent that hosts the Command. Matches the
 * trigger width by default and drops the popover's inner padding so the Command's
 * input bar and list own the spacing.
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
 * ComboboxInput
 *
 * The search field. cmdk wires it as the actual `role="combobox"` control that
 * owns `aria-activedescendant`, `aria-controls`, and `aria-expanded`.
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
 * ComboboxList
 *
 * The scrollable `role="listbox"` container for options, empty state, and groups.
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
 * ComboboxEmpty
 *
 * Rendered by cmdk when the query matches no options.
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
 * ComboboxGroup
 *
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
 * ComboboxSeparator
 *
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
   * Marks this option as the current selection, showing the check indicator.
   * @default false
   */
  selected?: boolean;
}

/**
 * ComboboxItem
 *
 * A selectable option. cmdk marks the pointer/keyboard-active item with
 * `data-selected`; `selected` marks the chosen value with a trailing check.
 *
 * cmdk filters on each item's `value` + `keywords`, never its rendered children
 * — pass the visible label as a `keyword` so typing it matches. `onSelect`
 * receives the trimmed `value` (case preserved); compare it against the
 * option's `value` directly at the call site.
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
