import * as React from 'react';

import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cva, type VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const alertDialogContentVariants = cva(
  [
    'nx:fixed nx:left-1/2 nx:top-1/2 nx:z-modal nx:grid nx:w-full nx:max-w-lg',
    'nx:-translate-x-1/2 nx:-translate-y-1/2',
    'nx:gap-4 nx:border nx:border-border-default nx:bg-container nx:p-6 nx:shadow-lg',
    'nx:data-[state=open]:duration-300 nx:data-[state=closed]:duration-150',
    'nx:data-[state=open]:ease-out nx:data-[state=closed]:ease-in',
    'nx:data-[state=open]:animate-in nx:data-[state=closed]:animate-out',
    'nx:data-[state=closed]:fade-out-0 nx:data-[state=open]:fade-in-0',
    'nx:data-[state=closed]:zoom-out-95 nx:data-[state=open]:zoom-in-95',
    'nx:motion-reduce:duration-0 nx:motion-reduce:data-[state=open]:animate-none nx:motion-reduce:data-[state=closed]:animate-none',
    'nx:sm:rounded-lg',
  ].join(' ')
);

const alertDialogHeaderVariants = cva('nx:flex nx:flex-col nx:gap-1', {
  variants: {
    variant: {
      default: 'nx:text-center nx:sm:text-left',
      center: 'nx:items-center nx:text-center',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const alertDialogFooterVariants = cva('nx:flex nx:gap-2', {
  variants: {
    orientation: {
      horizontal:
        'nx:flex-col nx:sm:flex-row nx:sm:items-center nx:sm:justify-end',
      vertical: 'nx:flex-col nx:items-stretch nx:[&>*]:w-full',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

type AlertDialogVariant = NonNullable<
  VariantProps<typeof alertDialogHeaderVariants>['variant']
>;
type AlertDialogButtonOrientation = NonNullable<
  VariantProps<typeof alertDialogFooterVariants>['orientation']
>;

type AlertDialogLayoutContextValue = {
  variant: AlertDialogVariant;
  buttonOrientation: AlertDialogButtonOrientation;
};

const defaultAlertDialogLayout: AlertDialogLayoutContextValue = {
  variant: 'default',
  buttonOrientation: 'horizontal',
};

const AlertDialogLayoutContext =
  React.createContext<AlertDialogLayoutContextValue>(defaultAlertDialogLayout);

function resolveButtonOrientation(
  variant: AlertDialogVariant,
  buttonOrientation?: AlertDialogButtonOrientation | null
): AlertDialogButtonOrientation {
  if (variant === 'center') return 'vertical';
  return buttonOrientation ?? 'horizontal';
}

function containsComposedHeader(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    if (child.type === AlertDialogHeader) return true;
    if (child.type === React.Fragment) {
      const fragment = child as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      return containsComposedHeader(fragment.props.children);
    }
    return false;
  });
}

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
interface AlertDialogContentProps extends Omit<
  React.ComponentProps<typeof AlertDialogPrimitive.Content>,
  'title'
> {
  /**
   * Layout variant for the alert dialog content.
   *
   * `default` keeps the header left-aligned and footer actions horizontal.
   * `center` centers the header and stacks full-width footer actions.
   * @default "default"
   */
  variant?: AlertDialogVariant;

  /**
   * Optional title for a prop-driven header, rendered before `children`.
   * Ignored when a composed `AlertDialogHeader` child is present — composed
   * children take precedence, so only one header (one Radix `Title`) renders.
   */
  title?: React.ReactNode;

  /**
   * Optional description for a prop-driven header, rendered before `children`.
   * Ignored when a composed `AlertDialogHeader` child is present.
   */
  description?: React.ReactNode;

  /**
   * Optional body content rendered between the generated header and `children`.
   */
  body?: React.ReactNode;

  /**
   * Footer button orientation inherited by `AlertDialogFooter`.
   * Center variant always resolves to vertical.
   * @default "horizontal"
   */
  buttonOrientation?: AlertDialogButtonOrientation;
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
  children,
  variant = 'default',
  title,
  description,
  body,
  buttonOrientation,
  ...props
}: AlertDialogContentProps) {
  const resolvedButtonOrientation = resolveButtonOrientation(
    variant,
    buttonOrientation
  );
  const showGeneratedHeader =
    !containsComposedHeader(children) && (title != null || description != null);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogLayoutContext.Provider
        value={{ variant, buttonOrientation: resolvedButtonOrientation }}
      >
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          data-variant={variant}
          data-button-orientation={resolvedButtonOrientation}
          className={cn(alertDialogContentVariants(), className)}
          {...props}
        >
          {showGeneratedHeader && (
            <AlertDialogHeader title={title} description={description} />
          )}
          {body != null && (
            <div data-slot="alert-dialog-body" className="nx:grid nx:gap-2">
              {body}
            </div>
          )}
          {children}
        </AlertDialogPrimitive.Content>
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
    Omit<React.ComponentProps<'div'>, 'title'>,
    VariantProps<typeof alertDialogHeaderVariants> {
  /**
   * Optional title text rendered when `children` are not supplied.
   */
  title?: React.ReactNode;

  /**
   * Optional description text rendered when `children` are not supplied.
   */
  description?: React.ReactNode;
}

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
  children,
  variant,
  title,
  description,
  ...props
}: AlertDialogHeaderProps) {
  const layout = React.useContext(AlertDialogLayoutContext);
  const resolvedVariant = variant ?? layout.variant;
  const generatedChildren =
    children ??
    (title != null || description != null ? (
      <>
        {title != null && <AlertDialogTitle>{title}</AlertDialogTitle>}
        {description != null && (
          <AlertDialogDescription>{description}</AlertDialogDescription>
        )}
      </>
    ) : null);

  return (
    <div
      data-slot="alert-dialog-header"
      data-variant={resolvedVariant}
      className={cn(
        alertDialogHeaderVariants({ variant: resolvedVariant }),
        className
      )}
      {...props}
    >
      {generatedChildren}
    </div>
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
        alertDialogFooterVariants({ orientation: layout.buttonOrientation }),
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
        'nx:typography-body-small nx:text-muted-foreground',
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
  type AlertDialogButtonOrientation,
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
