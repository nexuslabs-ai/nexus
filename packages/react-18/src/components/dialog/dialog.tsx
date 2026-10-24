'use client';

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
 * Root component for the dialog. Holds the open state.
 */
const Dialog = DialogPrimitive.Root;

/**
 * Opens the dialog. Use `asChild` to render your own button.
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Renders the dialog content into `document.body`.
 */
const DialogPortal = DialogPrimitive.Portal;

/**
 * Closes the dialog. Use `asChild` to render your own button.
 */
const DialogClose = DialogPrimitive.Close;

/**
 * DialogOverlayProps
 *
 * Props for the DialogOverlay component.
 */
type DialogOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>;

/**
 * Semi-transparent backdrop behind the dialog.
 */
const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DialogOverlayProps>
>(function DialogOverlay(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DialogOverlayProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(overlayScrimVariants(), className)}
      {...props}
    />
  );
});

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
   * Shows the close button in the top-right corner.
   */
  showCloseButton?: boolean;

  /**
   * Title for a generated header. Ignored when `DialogHeader` is a direct
   * child or inside a Fragment.
   */
  title?: React.ReactNode;

  /**
   * Description for a generated header. Ignored when a `DialogHeader` child is
   * present.
   */
  description?: React.ReactNode;

  /**
   * Content for a generated `DialogBody`, rendered before `children`. Ignored
   * when a `DialogBody` child is present.
   */
  body?: React.ReactNode;
}

/**
 * The dialog panel. Renders in a portal above an overlay.
 */
const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DialogContentProps>
>(function DialogContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    title,
    description,
    body,
    showCloseButton = true,
    ...props
  }: React.PropsWithoutRef<DialogContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const showGeneratedHeader =
    !containsComposedSlot(children, DialogHeader) &&
    (title != null || description != null);
  const showGeneratedBody =
    !containsComposedSlot(children, DialogBody) && body != null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-variant={defaultOverlayLayout.variant}
        data-orientation={defaultOverlayLayout.buttonOrientation}
        className={cn(overlayContentVariants(), className)}
        {...props}
      >
        <DialogLayoutContext.Provider value={defaultOverlayLayout}>
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
        </DialogLayoutContext.Provider>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

/**
 * DialogHeaderProps
 *
 * Props for the DialogHeader component.
 */
type DialogHeaderProps = React.ComponentProps<'div'>;

/**
 * Holds the dialog title and description. If `DialogContent` also gets a
 * `title`, keep DialogHeader a direct child so only one header renders.
 */
const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DialogHeaderProps>
>(function DialogHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DialogHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * DialogBodyProps
 *
 * Props for the DialogBody component.
 */
type DialogBodyProps = React.ComponentProps<'div'>;

/**
 * Holds the dialog's main content. Scrolls when the content overflows.
 */
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DialogBodyProps>
>(function DialogBody(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DialogBodyProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="dialog-body"
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      tabIndex={0}
      {...props}
    />
  );
});

/**
 * DialogFooterProps
 *
 * Props for the DialogFooter component.
 */
type DialogFooterProps = React.ComponentProps<'div'>;

/**
 * Holds the dialog's action buttons. Stacks them on narrow screens and lines
 * them up in a row from the `sm` breakpoint.
 */
const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<DialogFooterProps>
>(function DialogFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DialogFooterProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * DialogTitleProps
 *
 * Props for the DialogTitle component.
 */
type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;

/**
 * The dialog's title. Place it inside DialogHeader.
 */
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.PropsWithoutRef<DialogTitleProps>
>(function DialogTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DialogTitleProps> & {
    ref?: React.ForwardedRef<HTMLHeadingElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('nx:m-0 nx:typography-heading-xsmall', className)}
      {...props}
    />
  );
});

/**
 * DialogDescriptionProps
 *
 * Props for the DialogDescription component.
 */
type DialogDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>;

/**
 * Supporting text that explains the dialog.
 */
const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<DialogDescriptionProps>
>(function DialogDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<DialogDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});

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
