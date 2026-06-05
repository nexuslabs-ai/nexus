import * as React from 'react';

import { Command as CommandPrimitive } from 'cmdk';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { IconSearch } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * CommandProps
 *
 * Props for the Command component.
 */
interface CommandProps extends React.ComponentProps<typeof CommandPrimitive> {}

/**
 * Command
 *
 * Root component for a searchable command palette, built on cmdk. cmdk owns the
 * filtering and keyboard navigation. Pass a `label` (or `aria-label`) so the
 * search input has an accessible name — a bare `<Command>` leaves the combobox
 * unnamed.
 *
 * @example
 * ```tsx
 * <Command label="Command menu">
 *   <CommandInput placeholder="Type a command or search..." />
 *   <CommandList>
 *     <CommandEmpty>No results found.</CommandEmpty>
 *     <CommandGroup heading="Suggestions">
 *       <CommandItem>Calendar</CommandItem>
 *       <CommandItem>Search Emoji</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 * ```
 */
function Command({ className, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'nx:flex nx:h-full nx:w-full nx:flex-col nx:overflow-hidden nx:rounded-md',
        'nx:bg-popover nx:text-popover-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * CommandDialogProps
 *
 * Props for the CommandDialog component. Inherits the Dialog root props
 * (`open`, `onOpenChange`, `defaultOpen`, `modal`, …).
 */
interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  /**
   * Accessible title for the dialog, rendered visually hidden. Also labels the
   * command input.
   * @default 'Command Palette'
   */
  title?: string;
  /**
   * Accessible description for the dialog, rendered visually hidden.
   * @default 'Search for a command to run...'
   */
  description?: string;
  /**
   * Class names forwarded to the underlying DialogContent.
   */
  className?: string;
  /**
   * Whether to show the dialog's close button. Command palettes conventionally
   * rely on Escape / click-outside, so this is off by default.
   * @default false
   */
  showCloseButton?: boolean;
}

/**
 * CommandDialog
 *
 * A command palette rendered inside a modal Dialog (the ⌘K pattern). Wire it to
 * a keyboard shortcut and control its open state.
 *
 * @example
 * ```tsx
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput placeholder="Type a command or search..." />
 *   <CommandList>
 *     <CommandEmpty>No results found.</CommandEmpty>
 *     <CommandGroup heading="Suggestions">
 *       <CommandItem onSelect={() => setOpen(false)}>Calendar</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </CommandDialog>
 * ```
 */
function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn('nx:overflow-hidden nx:p-0', className)}
      >
        <DialogTitle className="nx:sr-only">{title}</DialogTitle>
        <DialogDescription className="nx:sr-only">
          {description}
        </DialogDescription>
        <Command label={title}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * CommandInputProps
 *
 * Props for the CommandInput component.
 */
interface CommandInputProps extends React.ComponentProps<
  typeof CommandPrimitive.Input
> {}

/**
 * CommandInput
 *
 * The search field. A leading search icon sits in a bottom-bordered bar.
 */
function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <div
      data-slot="command-input-wrapper"
      // nexus-allow-numeric: command input bar px stays numeric
      className="nx:flex nx:items-center nx:border-b nx:border-border-default nx:px-3 nx:focus-within:border-border-active"
    >
      <IconSearch className="nx:mr-2 nx:size-4 nx:shrink-0 nx:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'nx:flex nx:w-full nx:bg-transparent nx:py-control-md nx:text-sm nx:outline-none',
          'nx:placeholder:text-muted-foreground',
          'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * CommandListProps
 *
 * Props for the CommandList component.
 */
interface CommandListProps extends React.ComponentProps<
  typeof CommandPrimitive.List
> {}

/**
 * CommandList
 *
 * Scrollable container for command groups and items.
 */
function CommandList({ className, ...props }: CommandListProps) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'nx:max-h-[300px] nx:overflow-y-auto nx:overflow-x-hidden',
        className
      )}
      {...props}
    />
  );
}

/**
 * CommandEmptyProps
 *
 * Props for the CommandEmpty component.
 */
interface CommandEmptyProps extends React.ComponentProps<
  typeof CommandPrimitive.Empty
> {}

/**
 * CommandEmpty
 *
 * Rendered by cmdk when the query matches no items.
 */
function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        // nexus-allow-numeric: empty-state vertical rhythm
        'nx:py-6 nx:text-center nx:text-sm',
        className
      )}
      {...props}
    />
  );
}

/**
 * CommandGroupProps
 *
 * Props for the CommandGroup component.
 */
interface CommandGroupProps extends React.ComponentProps<
  typeof CommandPrimitive.Group
> {}

/**
 * CommandGroup
 *
 * Groups related items under an optional `heading`.
 *
 * @example
 * ```tsx
 * <CommandGroup heading="Settings">
 *   <CommandItem>Profile</CommandItem>
 *   <CommandItem>Billing</CommandItem>
 * </CommandGroup>
 * ```
 */
function CommandGroup({ className, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'nx:overflow-hidden nx:text-popover-foreground',
        // nexus-allow-numeric: popover chrome (sub-canonical inner padding)
        'nx:p-1',
        'nx:[&_[cmdk-group-heading]]:px-2 nx:[&_[cmdk-group-heading]]:py-1.5',
        'nx:[&_[cmdk-group-heading]]:text-xs nx:[&_[cmdk-group-heading]]:font-medium nx:[&_[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * CommandSeparatorProps
 *
 * Props for the CommandSeparator component.
 */
interface CommandSeparatorProps extends React.ComponentProps<
  typeof CommandPrimitive.Separator
> {}

/**
 * CommandSeparator
 *
 * A purely visual divider between groups or items. Marked `aria-hidden` because
 * the listbox role only owns options and groups — the groups carry the semantic
 * boundary, so the rule is decorative.
 */
function CommandSeparator({ className, ...props }: CommandSeparatorProps) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      aria-hidden="true"
      className={cn(
        'nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha',
        className
      )}
      {...props}
    />
  );
}

/**
 * CommandItemProps
 *
 * Props for the CommandItem component.
 */
interface CommandItemProps extends React.ComponentProps<
  typeof CommandPrimitive.Item
> {}

/**
 * CommandItem
 *
 * A selectable command. The active item (pointer or keyboard) is marked by cmdk
 * with `data-selected`; disabled items carry `data-disabled`.
 *
 * @example
 * ```tsx
 * <CommandItem onSelect={() => run('new-file')}>New File</CommandItem>
 * ```
 */
function CommandItem({ className, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:rounded-sm nx:text-sm nx:outline-none',
        // nexus-allow-numeric: command item-tier rhythm
        'nx:gap-2 nx:px-2 nx:py-control-sm',
        'nx:data-[selected=true]:bg-popover-hover nx:data-[selected=true]:text-popover-foreground',
        'nx:data-[disabled=true]:pointer-events-none nx:data-[disabled=true]:opacity-50',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
}

/**
 * CommandShortcutProps
 *
 * Props for the CommandShortcut component.
 */
interface CommandShortcutProps extends React.ComponentProps<'span'> {}

/**
 * CommandShortcut
 *
 * Displays a keyboard shortcut hint, right-aligned within a CommandItem.
 *
 * @example
 * ```tsx
 * <CommandItem>
 *   New File <CommandShortcut>⌘N</CommandShortcut>
 * </CommandItem>
 * ```
 */
function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'nx:ml-auto nx:text-xs nx:tracking-widest nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  type CommandDialogProps,
  CommandEmpty,
  type CommandEmptyProps,
  CommandGroup,
  type CommandGroupProps,
  CommandInput,
  type CommandInputProps,
  CommandItem,
  type CommandItemProps,
  CommandList,
  type CommandListProps,
  type CommandProps,
  CommandSeparator,
  type CommandSeparatorProps,
  CommandShortcut,
  type CommandShortcutProps,
};
