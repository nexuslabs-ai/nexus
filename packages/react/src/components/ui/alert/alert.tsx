import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'nx:relative nx:w-full nx:rounded-lg nx:border nx:p-4 nx:[&>svg~*]:pl-7 nx:[&>svg+div]:translate-y-[-3px] nx:[&>svg]:absolute nx:[&>svg]:left-4 nx:[&>svg]:top-4 nx:[&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'nx:bg-background nx:text-foreground nx:border-border-default',
        destructive:
          'nx:border-border-error nx:text-error-subtle-foreground nx:bg-error-subtle nx:[&>svg]:text-error-subtle-foreground',
        success:
          'nx:border-border-success nx:text-success-subtle-foreground nx:bg-success-subtle nx:[&>svg]:text-success-subtle-foreground',
        information:
          'nx:border-border-information nx:text-information-subtle-foreground nx:bg-information-subtle nx:[&>svg]:text-information-subtle-foreground',
        warning:
          'nx:border-border-warning nx:text-warning-subtle-foreground nx:bg-warning-subtle nx:[&>svg]:text-warning-subtle-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * AlertProps
 *
 * Props for the Alert component.
 */
interface AlertProps
  extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {}

/**
 * Alert
 *
 * Displays a callout for user attention with optional icon support.
 * Use for important messages, warnings, errors, or success confirmations.
 *
 * @example
 * ```tsx
 * <Alert>
 *   <AlertTitle>Heads up!</AlertTitle>
 *   <AlertDescription>
 *     You can add components and dependencies to your app using the CLI.
 *   </AlertDescription>
 * </Alert>
 * ```
 *
 * @example
 * ```tsx
 * // With icon
 * <Alert variant="destructive">
 *   <IconAlertCircle className="nx:size-4" />
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>
 *     Your session has expired. Please log in again.
 *   </AlertDescription>
 * </Alert>
 * ```
 */
function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? 'default'}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * AlertTitleProps
 *
 * Props for the AlertTitle component.
 */
interface AlertTitleProps extends React.ComponentProps<'h5'> {}

/**
 * AlertTitle
 *
 * The title of an alert. Renders as an h5 element.
 *
 * @example
 * ```tsx
 * <AlertTitle>Important Notice</AlertTitle>
 * ```
 */
function AlertTitle({ className, children, ...props }: AlertTitleProps) {
  return (
    <h5
      data-slot="alert-title"
      className={cn('nx:mb-1 nx:typography-label-default', className)}
      {...props}
    >
      {children}
    </h5>
  );
}

/**
 * AlertDescriptionProps
 *
 * Props for the AlertDescription component.
 */
interface AlertDescriptionProps extends React.ComponentProps<'div'> {}

/**
 * AlertDescription
 *
 * The description text of an alert. Supports multiple paragraphs.
 *
 * @example
 * ```tsx
 * <AlertDescription>
 *   This is a detailed description of the alert message.
 * </AlertDescription>
 * ```
 */
function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'nx:typography-body-small nx:[&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export {
  Alert,
  AlertDescription,
  type AlertDescriptionProps,
  type AlertProps,
  AlertTitle,
  type AlertTitleProps,
  alertVariants,
};
