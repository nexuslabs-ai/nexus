'use client';

import * as React from 'react';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button/button';
import {
  defaultOverlayLayout,
  overlayBodyClassName,
  overlayContentVariants,
  overlayFooterVariants,
  overlayHeaderVariants,
  type OverlayLayoutContextValue,
  overlayScrimVariants,
  type OverlayVariant,
  resolveOverlayButtonOrientation,
} from '../overlay-layout/overlay-layout';

type AlertDialogVariant = OverlayVariant;
type AlertDialogLayoutContextValue = OverlayLayoutContextValue;

const AlertDialogLayoutContext =
  React.createContext<AlertDialogLayoutContextValue>(defaultOverlayLayout);

/**
 * Modal that makes the user confirm or cancel before continuing.
 * Clicking the overlay doesn't close it, and it has no close (X) button.
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
 * Opens the alert dialog. Pass `asChild` to render your own button.
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/**
 * Renders the alert dialog into `document.body`.
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
 * Dimmed backdrop behind the alert dialog. Clicking it doesn't close the dialog.
 */
function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(overlayScrimVariants(), className)}
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
   * Layout. `default` left-aligns the header and puts actions in a row.
   * `center` centers the header and stacks full-width actions.
   * @default "default"
   */
  variant?: AlertDialogVariant;
}

/**
 * Dialog panel, rendered in a portal over the overlay.
 * It has no close button. AlertDialogAction and AlertDialogCancel close it.
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
  children,
  variant = 'default',
  ...props
}: AlertDialogContentProps) {
  const buttonOrientation = resolveOverlayButtonOrientation(variant);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
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
      >
        <AlertDialogLayoutContext.Provider
          value={{ variant, buttonOrientation }}
        >
          {children}
        </AlertDialogLayoutContext.Provider>
      </AlertDialogPrimitive.Content>
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
 * Holds the title and description.
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
 * Holds the main content, aligned with the header and footer. Scrolls when it overflows.
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
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
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
 * Holds the action buttons. They stack on narrow screens and sit in a row from `sm` up.
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
 * Dialog title. Place it inside AlertDialogHeader.
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
      className={cn('nx:m-0 nx:typography-heading-small', className)}
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
 * Explains the result of the action.
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
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertDialogActionProps
 *
 * Props for AlertDialogAction. Takes Button's `variant` and `size`.
 */
interface AlertDialogActionProps
  extends
    React.ComponentProps<typeof AlertDialogPrimitive.Action>,
    VariantProps<typeof buttonVariants> {}

/**
 * Confirm button. Closes the dialog on click.
 * Renders a primary Button. Pass `variant="destructive"` for a destructive action.
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
 * Props for AlertDialogCancel. Takes Button's `variant` and `size`.
 */
interface AlertDialogCancelProps
  extends
    React.ComponentProps<typeof AlertDialogPrimitive.Cancel>,
    VariantProps<typeof buttonVariants> {}

/**
 * Cancel button, styled as an `outline` Button. Closes the dialog on click.
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
