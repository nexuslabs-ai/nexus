import * as React from 'react';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/ui/button';
import {
  defaultOverlayLayout,
  overlayContentVariants,
  overlayFooterVariants,
  overlayHeaderVariants,
  type OverlayLayoutContextValue,
  type OverlayVariant,
  resolveOverlayButtonOrientation,
} from '@/components/ui/overlay-layout/overlay-layout';
import { cn } from '@/lib/utils';

type AlertDialogVariant = OverlayVariant;
type AlertDialogLayoutContextValue = OverlayLayoutContextValue;

const AlertDialogLayoutContext =
  React.createContext<AlertDialogLayoutContextValue>(defaultOverlayLayout);

/**
 * AlertDialog
 *
 * Root component for an alert dialog — a modal that interrupts the user and
 * forces an explicit choice. Unlike Dialog, it cannot be dismissed by clicking
 * the overlay and has no close (X) button; the user must pick an action.
 *
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button variant="destructive">Delete</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
 *       <AlertDialogDescription>
 *         This action cannot be undone.
 *       </AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 */
const AlertDialog = AlertDialogPrimitive.Root;

/**
 * AlertDialogTrigger
 *
 * Button that opens the alert dialog. Use `asChild` to render as your own component.
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/**
 * AlertDialogPortal
 *
 * Portals the alert dialog content to document.body.
 */
const AlertDialogPortal = AlertDialogPrimitive.Portal;

/**
 * AlertDialogOverlayProps
 *
 * Props for the AlertDialogOverlay component.
 */
interface AlertDialogOverlayProps extends React.ComponentProps<
  typeof AlertDialogPrimitive.Overlay
> {}

/**
 * AlertDialogOverlay
 *
 * Semi-transparent overlay behind the alert dialog content. Clicking it does
 * not dismiss the dialog — that is the defining behaviour of an alert dialog.
 */
function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
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
 * AlertDialogContentProps
 *
 * Props for the AlertDialogContent component.
 */
interface AlertDialogContentProps extends React.ComponentProps<
  typeof AlertDialogPrimitive.Content
> {
  /**
   * Layout variant for the alert dialog content.
   *
   * `default` keeps the header left-aligned and footer actions horizontal.
   * `center` centers the header and stacks full-width footer actions.
   * @default "default"
   */
  variant?: AlertDialogVariant;
}

/**
 * AlertDialogContent
 *
 * The main content container for the alert dialog. Renders inside a portal with
 * an overlay. There is no close button — close via AlertDialogAction or
 * AlertDialogCancel.
 *
 * @example
 * ```tsx
 * <AlertDialogContent>
 *   <AlertDialogHeader>
 *     <AlertDialogTitle>Title</AlertDialogTitle>
 *   </AlertDialogHeader>
 *   <AlertDialogFooter>
 *     <AlertDialogCancel>Cancel</AlertDialogCancel>
 *     <AlertDialogAction>Continue</AlertDialogAction>
 *   </AlertDialogFooter>
 * </AlertDialogContent>
 * ```
 */
function AlertDialogContent({
  className,
  variant = 'default',
  ...props
}: AlertDialogContentProps) {
  const buttonOrientation = resolveOverlayButtonOrientation(variant);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogLayoutContext.Provider value={{ variant, buttonOrientation }}>
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          data-variant={variant}
          data-orientation={buttonOrientation}
          className={cn(
            overlayContentVariants(),
            variant === 'center' && 'nx:max-w-xs',
            className
          )}
          {...props}
        />
      </AlertDialogLayoutContext.Provider>
    </AlertDialogPortal>
  );
}

/**
 * AlertDialogHeaderProps
 *
 * Props for the AlertDialogHeader component.
 */
interface AlertDialogHeaderProps
  extends
    React.ComponentProps<'div'>,
    VariantProps<typeof overlayHeaderVariants> {}

/**
 * AlertDialogHeader
 *
 * Container for alert dialog title and description. Provides consistent spacing.
 *
 * @example
 * ```tsx
 * <AlertDialogHeader>
 *   <AlertDialogTitle>Title</AlertDialogTitle>
 *   <AlertDialogDescription>Description</AlertDialogDescription>
 * </AlertDialogHeader>
 * ```
 */
function AlertDialogHeader({
  className,
  variant,
  ...props
}: AlertDialogHeaderProps) {
  const layout = React.useContext(AlertDialogLayoutContext);
  const resolvedVariant = variant ?? layout.variant;

  return (
    <div
      data-slot="alert-dialog-header"
      data-variant={resolvedVariant}
      className={cn(
        overlayHeaderVariants({ variant: resolvedVariant }),
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertDialogBodyProps
 *
 * Props for the AlertDialogBody component.
 */
interface AlertDialogBodyProps extends React.ComponentProps<'div'> {}

/**
 * AlertDialogBody
 *
 * Container for the alert dialog's body content. Insets content horizontally to
 * align with the header and footer.
 *
 * @example
 * ```tsx
 * <AlertDialogBody>
 *   <p>Supporting detail.</p>
 * </AlertDialogBody>
 * ```
 */
function AlertDialogBody({ className, ...props }: AlertDialogBodyProps) {
  return (
    <div
      data-slot="alert-dialog-body"
      className={cn('nx:px-6', className)}
      {...props}
    />
  );
}

/**
 * AlertDialogFooterProps
 *
 * Props for the AlertDialogFooter component.
 */
interface AlertDialogFooterProps extends React.ComponentProps<'div'> {}

/**
 * AlertDialogFooter
 *
 * Container for alert dialog action buttons. Stacks on mobile, inline on desktop.
 *
 * @example
 * ```tsx
 * <AlertDialogFooter>
 *   <AlertDialogCancel>Cancel</AlertDialogCancel>
 *   <AlertDialogAction>Continue</AlertDialogAction>
 * </AlertDialogFooter>
 * ```
 */
function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  const layout = React.useContext(AlertDialogLayoutContext);

  return (
    <div
      data-slot="alert-dialog-footer"
      data-orientation={layout.buttonOrientation}
      className={cn(
        overlayFooterVariants({ orientation: layout.buttonOrientation }),
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertDialogTitleProps
 *
 * Props for the AlertDialogTitle component.
 */
interface AlertDialogTitleProps extends React.ComponentProps<
  typeof AlertDialogPrimitive.Title
> {}

/**
 * AlertDialogTitle
 *
 * The title of the alert dialog. Should be used within AlertDialogHeader.
 *
 * @example
 * ```tsx
 * <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
 * ```
 */
function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('nx:typography-heading-xsmall', className)}
      {...props}
    />
  );
}

/**
 * AlertDialogDescriptionProps
 *
 * Props for the AlertDialogDescription component.
 */
interface AlertDialogDescriptionProps extends React.ComponentProps<
  typeof AlertDialogPrimitive.Description
> {}

/**
 * AlertDialogDescription
 *
 * Supporting text that explains the consequence of the action.
 *
 * @example
 * ```tsx
 * <AlertDialogDescription>
 *   This action cannot be undone. This will permanently delete your account.
 * </AlertDialogDescription>
 * ```
 */
function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        'nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertDialogActionProps
 *
 * Props for the AlertDialogAction component. Inherits the `variant` / `size`
 * props from `buttonVariants` so the confirming action can be styled like any
 * Button — typically `default` (primary) or `destructive`.
 */
interface AlertDialogActionProps
  extends
    React.ComponentProps<typeof AlertDialogPrimitive.Action>,
    VariantProps<typeof buttonVariants> {}

/**
 * AlertDialogAction
 *
 * The confirming action. Composes `buttonVariants` and closes the dialog when
 * clicked. Defaults to the primary button; pass `variant="destructive"` for a
 * destructive confirmation.
 *
 * @example
 * ```tsx
 * <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
 * ```
 */
function AlertDialogAction({
  className,
  variant = 'default',
  size,
  ...props
}: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * AlertDialogCancelProps
 *
 * Props for the AlertDialogCancel component. Inherits the `variant` / `size`
 * props from `buttonVariants`; defaults to the `outline` button.
 */
interface AlertDialogCancelProps
  extends
    React.ComponentProps<typeof AlertDialogPrimitive.Cancel>,
    VariantProps<typeof buttonVariants> {}

/**
 * AlertDialogCancel
 *
 * The dismissing action. Composes `buttonVariants` and closes the dialog when
 * clicked. Defaults to the `outline` button.
 *
 * @example
 * ```tsx
 * <AlertDialogCancel>Cancel</AlertDialogCancel>
 * ```
 */
function AlertDialogCancel({
  className,
  variant = 'outline',
  size,
  ...props
}: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  type AlertDialogActionProps,
  AlertDialogBody,
  type AlertDialogBodyProps,
  AlertDialogCancel,
  type AlertDialogCancelProps,
  AlertDialogContent,
  type AlertDialogContentProps,
  AlertDialogDescription,
  type AlertDialogDescriptionProps,
  AlertDialogFooter,
  type AlertDialogFooterProps,
  AlertDialogHeader,
  type AlertDialogHeaderProps,
  AlertDialogOverlay,
  type AlertDialogOverlayProps,
  AlertDialogPortal,
  AlertDialogTitle,
  type AlertDialogTitleProps,
  AlertDialogTrigger,
  type AlertDialogVariant,
};
