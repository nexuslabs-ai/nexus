import * as React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import {
  containsComposedSlot,
  defaultOverlayLayout,
  overlayBodyClassName,
  overlayCloseButtonClassName,
  overlayContentVariants,
  overlayHeaderVariants,
  type OverlayLayoutContextValue,
  overlayScrimVariants,
} from '../overlay-layout/overlay-layout';

type DialogLayoutContextValue = Pick<
  OverlayLayoutContextValue,
  'variant' | 'buttonOrientation'
>;

const DialogLayoutContext =
  React.createContext<DialogLayoutContextValue>(defaultOverlayLayout);

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
 *     <DialogBody>
 *       <p>Dialog content goes here.</p>
 *     </DialogBody>
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
      className={cn(overlayScrimVariants(), className)}
      {...props}
    />
  );
}

/**
 * DialogContentProps
 *
 * Props for the DialogContent component.
 */
interface DialogContentProps extends Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  'title'
> {
  /**
   * Whether to show the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Optional title for a prop-driven header, rendered before `children`.
   * Ignored when a composed `DialogHeader` child is present. Detection covers
   * a direct child or a Fragment-wrapped header; a header nested inside another
   * element is not detected.
   */
  title?: React.ReactNode;

  /**
   * Optional description for a prop-driven header, rendered before `children`.
   * Ignored when a composed `DialogHeader` child is present.
   */
  description?: React.ReactNode;

  /**
   * Optional body content rendered in a generated `DialogBody` before
   * `children`. Ignored when a composed `DialogBody` child is present.
   */
  body?: React.ReactNode;
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
 *   <DialogBody>
 *     <p>Content here</p>
 *   </DialogBody>
 * </DialogContent>
 * ```
 */
function DialogContent({
  className,
  children,
  title,
  description,
  body,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  const showGeneratedHeader =
    !containsComposedSlot(children, DialogHeader) &&
    (title != null || description != null);
  const showGeneratedBody =
    !containsComposedSlot(children, DialogBody) && body != null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogLayoutContext.Provider value={defaultOverlayLayout}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          data-variant={defaultOverlayLayout.variant}
          data-orientation={defaultOverlayLayout.buttonOrientation}
          className={cn(overlayContentVariants(), className)}
          {...props}
        >
          {showGeneratedHeader && (
            <DialogHeader>
              {title != null && <DialogTitle>{title}</DialogTitle>}
              {description != null && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {showGeneratedBody && <DialogBody>{body}</DialogBody>}
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close-button"
              className={overlayCloseButtonClassName}
            >
              <IconX className="nx:size-4" />
              <span className="nx:sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogLayoutContext.Provider>
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
  const layout = React.useContext(DialogLayoutContext);

  return (
    <div
      data-slot="dialog-header"
      data-variant={layout.variant}
      className={cn(
        overlayHeaderVariants({ variant: layout.variant }),
        className
      )}
      {...props}
    />
  );
}

/**
 * DialogBodyProps
 *
 * Props for the DialogBody component.
 */
interface DialogBodyProps extends React.ComponentProps<'div'> {}

/**
 * DialogBody
 *
 * Container for the dialog's body content. Insets content horizontally to align
 * with the header and footer.
 *
 * @example
 * ```tsx
 * <DialogBody>
 *   <p>Main dialog content.</p>
 * </DialogBody>
 * ```
 */
function DialogBody({ className, ...props }: DialogBodyProps) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
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
  const layout = React.useContext(DialogLayoutContext);

  return (
    <div
      data-slot="dialog-footer"
      data-orientation={layout.buttonOrientation}
      className={cn(
        'nx:flex nx:shrink-0 nx:flex-col-reverse nx:px-6 nx:sm:flex-row nx:sm:justify-end nx:sm:gap-2',
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
      className={cn('nx:typography-heading-xsmall', className)}
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
      className={cn(
        'nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  type DialogBodyProps,
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
