import * as React from 'react';

import { Command as CommandPrimitive } from 'cmdk';

import { IconSearch } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../dialog/dialog';

/**
 * CommandProps
 *
 * Props for the Command component.
 */
type CommandProps = React.ComponentProps<typeof CommandPrimitive>;

/**
 * A searchable command palette with keyboard navigation. Pass a `label` or
 * `aria-label` so the search input has an accessible name.
 */
const Command = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandProps>
>(function Command(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * CommandDialogProps
 *
 * Props for the CommandDialog component. Accepts the Dialog root props, such as
 * `open` and `onOpenChange`.
 */
interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  /**
   * Visually hidden dialog title. Also labels the search input.
   */
  title?: string;
  /**
   * Visually hidden dialog description.
   */
  description?: string;
  /**
   * Class names for the DialogContent.
   */
  className?: string;
  /**
   * Shows the dialog's close button. Escape and clicking outside close it either way.
   */
  showCloseButton?: boolean;
}

/**
 * A command palette inside a modal Dialog, often opened with ⌘K. Control its
 * `open` state and bind it to a keyboard shortcut.
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
type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input>;

/**
 * The search field, with a leading search icon.
 */
const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.PropsWithoutRef<CommandInputProps>
>(function CommandInput(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandInputProps> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="command-input-wrapper"
      className="nx:flex nx:items-center nx:border-b-default nx:border-border-default nx:px-3 nx:focus-within:border-border-focus"
    >
      <IconSearch className="nx:mr-2 nx:size-4 nx:shrink-0 nx:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'nx:flex nx:w-full nx:border-0 nx:bg-transparent nx:px-0 nx:py-2 nx:text-inherit nx:typography-body-default nx:outline-none',
          'nx:placeholder:text-muted-foreground',
          'nx:disabled:cursor-not-allowed nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
          className
        )}
        {...props}
      />
    </div>
  );
});

/**
 * CommandListProps
 *
 * Props for the CommandList component.
 */
type CommandListProps = React.ComponentProps<typeof CommandPrimitive.List>;

/**
 * Scrollable container for command groups and items.
 */
const CommandList = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandListProps>
>(function CommandList(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandListProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'nx:max-h-[300px] nx:overflow-y-auto nx:overflow-x-hidden nx:scroll-py-2',
        className
      )}
      {...props}
    />
  );
});

/**
 * CommandEmptyProps
 *
 * Props for the CommandEmpty component.
 */
type CommandEmptyProps = React.ComponentProps<typeof CommandPrimitive.Empty>;

/**
 * Shown when the search matches no items.
 */
const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandEmptyProps>
>(function CommandEmpty(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandEmptyProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        'nx:py-6 nx:text-center nx:typography-body-default',
        className
      )}
      {...props}
    />
  );
});

/**
 * CommandLoadingProps
 *
 * Props for the CommandLoading component.
 */
type CommandLoadingProps = React.ComponentProps<
  typeof CommandPrimitive.Loading
>;

/**
 * Shown while async results load. Place it outside CommandList, and pass
 * `progress` and `label` when progress is known.
 */
const CommandLoading = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandLoadingProps>
>(function CommandLoading(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandLoadingProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandPrimitive.Loading
      data-slot="command-loading"
      className={cn(
        'nx:px-3 nx:py-2.5',
        // cmdk nests Loading's children in an inner aria-hidden div — target it to lay the spinner + label out as a row.
        'nx:*:aria-hidden:flex nx:*:aria-hidden:items-center nx:*:aria-hidden:gap-3',
        'nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * CommandGroupProps
 *
 * Props for the CommandGroup component.
 */
type CommandGroupProps = React.ComponentProps<typeof CommandPrimitive.Group>;

/**
 * Groups related items under an optional `heading`.
 */
const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandGroupProps>
>(function CommandGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'nx:overflow-hidden nx:text-popover-foreground',
        'nx:p-2',
        'nx:**:[[cmdk-group-heading]]:px-2 nx:**:[[cmdk-group-heading]]:py-1.5',
        'nx:**:[[cmdk-group-heading]]:typography-label-small nx:**:[[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

/**
 * CommandSeparatorProps
 *
 * Props for the CommandSeparator component.
 */
type CommandSeparatorProps = React.ComponentProps<
  typeof CommandPrimitive.Separator
>;

/**
 * A decorative divider between groups or items. Screen readers skip it.
 */
const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandSeparatorProps>
>(function CommandSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * CommandItemProps
 *
 * Props for the CommandItem component.
 */
type CommandItemProps = React.ComponentProps<typeof CommandPrimitive.Item>;

/**
 * A selectable command. The highlighted item gets `data-selected`, and a
 * disabled item gets `data-disabled`.
 */
const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CommandItemProps>
>(function CommandItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:rounded-sm nx:typography-body-default nx:outline-none',
        'nx:gap-3 nx:px-3 nx:py-2.5',
        'nx:data-[selected=true]:bg-popover-hover nx:data-[selected=true]:text-popover-foreground',
        'nx:data-[disabled=true]:pointer-events-none nx:data-[disabled=true]:text-disabled-foreground',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
});

/**
 * CommandShortcutProps
 *
 * Props for the CommandShortcut component.
 */
type CommandShortcutProps = React.ComponentProps<'span'>;

/**
 * A keyboard shortcut hint, right-aligned in a CommandItem.
 */
const CommandShortcut = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<CommandShortcutProps>
>(function CommandShortcut(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<CommandShortcutProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        'nx:ml-auto nx:typography-shortcut nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

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
  CommandLoading,
  type CommandLoadingProps,
  type CommandProps,
  CommandSeparator,
  type CommandSeparatorProps,
  CommandShortcut,
  type CommandShortcutProps,
};
