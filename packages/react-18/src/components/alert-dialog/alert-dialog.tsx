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
type AlertDialogOverlayProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Overlay
>;

/**
 * Dimmed backdrop behind the alert dialog. Clicking it doesn't close the dialog.
 */
const AlertDialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertDialogOverlayProps>
>(function AlertDialogOverlay(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertDialogOverlayProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(overlayScrimVariants(), className)}
      {...props}
    />
  );
});

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
   */
  variant?: AlertDialogVariant;
}

/**
 * Dialog panel, rendered in a portal over the overlay.
 * It has no close button. AlertDialogAction and AlertDialogCancel close it.
 */
const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertDialogContentProps>
>(function AlertDialogContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<AlertDialogContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertDialogHeaderProps
 *
 * Props for the AlertDialogHeader component.
 */
type AlertDialogHeaderProps = React.ComponentProps<'div'> &
  VariantProps<typeof overlayHeaderVariants>;

/**
 * Holds the title and description.
 */
const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertDialogHeaderProps>
>(function AlertDialogHeader(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant,
    ...props
  }: React.PropsWithoutRef<AlertDialogHeaderProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertDialogBodyProps
 *
 * Props for the AlertDialogBody component.
 */
type AlertDialogBodyProps = React.ComponentProps<'div'>;

/**
 * Holds the main content, aligned with the header and footer. Scrolls when it overflows.
 */
const AlertDialogBody = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertDialogBodyProps>
>(function AlertDialogBody(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertDialogBodyProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="alert-dialog-body"
      className={cn(overlayBodyClassName, className)}
      // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
      tabIndex={0}
      {...props}
    />
  );
});

/**
 * AlertDialogFooterProps
 *
 * Props for the AlertDialogFooter component.
 */
type AlertDialogFooterProps = React.ComponentProps<'div'>;

/**
 * Holds the action buttons. They stack on narrow screens and sit in a row from `sm` up.
 */
const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertDialogFooterProps>
>(function AlertDialogFooter(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertDialogFooterProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertDialogTitleProps
 *
 * Props for the AlertDialogTitle component.
 */
type AlertDialogTitleProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Title
>;

/**
 * Dialog title. Place it inside AlertDialogHeader.
 */
const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.PropsWithoutRef<AlertDialogTitleProps>
>(function AlertDialogTitle(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertDialogTitleProps> & {
    ref?: React.ForwardedRef<HTMLHeadingElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('nx:m-0 nx:typography-heading-small', className)}
      {...props}
    />
  );
});

/**
 * AlertDialogDescriptionProps
 *
 * Props for the AlertDialogDescription component.
 */
type AlertDialogDescriptionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Description
>;

/**
 * Explains the result of the action.
 */
const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.PropsWithoutRef<AlertDialogDescriptionProps>
>(function AlertDialogDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertDialogDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLParagraphElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertDialogActionProps
 *
 * Props for AlertDialogAction. Takes Button's `variant` and `size`.
 */
type AlertDialogActionProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Action
> &
  VariantProps<typeof buttonVariants>;

/**
 * Confirm button. Closes the dialog on click.
 * Renders a primary Button. Pass `variant="destructive"` for a destructive action.
 */
const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<AlertDialogActionProps>
>(function AlertDialogAction(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    size,
    ...props
  }: React.PropsWithoutRef<AlertDialogActionProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

/**
 * AlertDialogCancelProps
 *
 * Props for AlertDialogCancel. Takes Button's `variant` and `size`.
 */
type AlertDialogCancelProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Cancel
> &
  VariantProps<typeof buttonVariants>;

/**
 * Cancel button, styled as an `outline` Button. Closes the dialog on click.
 */
const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<AlertDialogCancelProps>
>(function AlertDialogCancel(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'outline',
    size,
    ...props
  }: React.PropsWithoutRef<AlertDialogCancelProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

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
