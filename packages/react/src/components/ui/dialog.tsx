import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { IconX } from '@/lib/icons';
import { cn } from '@/lib/utils';

/**
 * Dialog
 *
 * Root component for the dialog. Controls open/close state.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog description here.</DialogDescription>
 *     </DialogHeader>
 *     <p>Dialog content goes here.</p>
 *     <DialogFooter>
 *       <Button>Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
const Dialog = DialogPrimitive.Root;

/**
 * DialogTrigger
 *
 * Button that opens the dialog. Use `asChild` to render as your own component.
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * DialogPortal
 *
 * Portals the dialog content to document.body.
 */
const DialogPortal = DialogPrimitive.Portal;

/**
 * DialogClose
 *
 * Button that closes the dialog. Use `asChild` to render as your own component.
 */
const DialogClose = DialogPrimitive.Close;

/**
 * DialogOverlayProps
 *
 * Props for the DialogOverlay component.
 */
interface DialogOverlayProps extends React.ComponentProps<
  typeof DialogPrimitive.Overlay
> {}

/**
 * DialogOverlay
 *
 * Semi-transparent overlay behind the dialog content.
 */
function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
        'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
        'nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogContentProps
 *
 * Props for the DialogContent component.
 */
interface DialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  /**
   * Whether to show the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * DialogContent
 *
 * The main content container for the dialog. Renders inside a portal with an overlay.
 *
 * @example
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Title</DialogTitle>
 *   </DialogHeader>
 *   <p>Content here</p>
 * </DialogContent>
 * ```
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'nx:fixed nx:left-1/2 nx:top-1/2 nx:z-modal nx:grid nx:w-full nx:max-w-lg',
          'nx:-translate-x-1/2 nx:-translate-y-1/2',
          'nx:gap-container nx:border nx:border-border-default nx:bg-container nx:p-container nx:shadow-lg',
          'nx:duration-200',
          'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
          'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
          'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
          'nx:data-[state=closed]:slide-out-to-left-1/2 nx:data-[state=closed]:slide-out-to-top-[48%]',
          'nx:data-[state=open]:slide-in-from-left-1/2 nx:data-[state=open]:slide-in-from-top-[48%]',
          'nx:motion-reduce:duration-0 nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
          'nx:sm:rounded-lg',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            className={cn(
              'nx:absolute nx:right-4 nx:top-4 nx:rounded-sm nx:opacity-70',
              'nx:transition-opacity',
              'nx:motion-reduce:transition-none',
              'nx:hover:bg-background-hover nx:hover:text-foreground nx:hover:opacity-100',
              'nx:focus-visible:bg-background-hover nx:focus-visible:text-foreground nx:focus-visible:opacity-100',
              'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
              'nx:disabled:pointer-events-none'
            )}
          >
            <IconX className="nx:size-4" />
            <span className="nx:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * DialogHeaderProps
 *
 * Props for the DialogHeader component.
 */
interface DialogHeaderProps extends React.ComponentProps<'div'> {}

/**
 * DialogHeader
 *
 * Container for dialog title and description. Provides consistent spacing.
 *
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Title</DialogTitle>
 *   <DialogDescription>Description</DialogDescription>
 * </DialogHeader>
 * ```
 */
function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        // nexus-allow-numeric: DialogHeader sub-element rhythm
        'nx:flex nx:flex-col nx:gap-1.5 nx:text-center nx:sm:text-left',
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogFooterProps
 *
 * Props for the DialogFooter component.
 */
interface DialogFooterProps extends React.ComponentProps<'div'> {}

/**
 * DialogFooter
 *
 * Container for dialog action buttons. Stacks on mobile, inline on desktop.
 *
 * @example
 * ```tsx
 * <DialogFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save</Button>
 * </DialogFooter>
 * ```
 */
function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // nexus-allow-numeric: DialogFooter sub-element rhythm at sm
        'nx:flex nx:flex-col-reverse nx:sm:flex-row nx:sm:justify-end nx:sm:gap-2',
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogTitleProps
 *
 * Props for the DialogTitle component.
 */
interface DialogTitleProps extends React.ComponentProps<
  typeof DialogPrimitive.Title
> {}

/**
 * DialogTitle
 *
 * The title of the dialog. Should be used within DialogHeader.
 *
 * @example
 * ```tsx
 * <DialogTitle>Edit Profile</DialogTitle>
 * ```
 */
function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'nx:text-lg nx:font-semibold nx:leading-none nx:tracking-tight',
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogDescriptionProps
 *
 * Props for the DialogDescription component.
 */
interface DialogDescriptionProps extends React.ComponentProps<
  typeof DialogPrimitive.Description
> {}

/**
 * DialogDescription
 *
 * Supporting text that provides additional context for the dialog.
 *
 * @example
 * ```tsx
 * <DialogDescription>
 *   Make changes to your profile here. Click save when you're done.
 * </DialogDescription>
 * ```
 */
function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('nx:text-sm nx:text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  type DialogDescriptionProps,
  DialogFooter,
  type DialogFooterProps,
  DialogHeader,
  type DialogHeaderProps,
  DialogOverlay,
  type DialogOverlayProps,
  DialogPortal,
  DialogTitle,
  type DialogTitleProps,
  DialogTrigger,
};
