import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '@/lib/icons';
import { cn } from '@/lib/utils';

const alertStatusTextClassName =
  'nx:group-data-[variant=destructive]/alert:text-error-subtle-foreground nx:group-data-[variant=success]/alert:text-success-subtle-foreground nx:group-data-[variant=information]/alert:text-information-subtle-foreground nx:group-data-[variant=warning]/alert:text-warning-subtle-foreground';

const alertVariants = cva(
  'nx:group/alert nx:relative nx:w-full nx:p-4 nx:[&>svg~*]:pl-6 nx:[&>svg]:absolute nx:[&>svg]:top-[calc(var(--nx-spacing-4)+(var(--nx-typography-line-height-sm)/2))] nx:[&>svg]:left-4 nx:[&>svg]:translate-y-[-50%] nx:[&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'nx:border-border-default nx:bg-container',
        destructive:
          'nx:border-border-error nx:bg-error-subtle nx:[&>svg]:text-error-subtle-foreground',
        success:
          'nx:border-border-success nx:bg-success-subtle nx:[&>svg]:text-success-subtle-foreground',
        information:
          'nx:border-border-information nx:bg-information-subtle nx:[&>svg]:text-information-subtle-foreground',
        warning:
          'nx:border-border-warning nx:bg-warning-subtle nx:[&>svg]:text-warning-subtle-foreground',
      },
      presentation: {
        card: 'nx:rounded-md nx:border',
        banner: 'nx:rounded-none nx:border-b',
      },
      layout: {
        stack: '',
        inline:
          'nx:grid nx:grid-cols-[minmax(0,1fr)_auto] nx:items-center nx:gap-x-4 nx:gap-y-1 nx:[&>[data-slot=alert-content]]:col-start-1 nx:[&>[data-slot=alert-title]]:col-start-1 nx:[&>[data-slot=alert-description]]:col-start-1 nx:[&>[data-slot=alert-actions]]:col-start-2 nx:[&>[data-slot=alert-actions]]:row-start-1 nx:[&>[data-slot=alert-actions]]:justify-self-end',
        dense:
          'nx:grid nx:grid-cols-[minmax(0,1fr)_auto] nx:items-center nx:gap-x-3 nx:gap-y-1 nx:py-3 nx:[&>svg]:top-1/2! nx:[&>[data-slot=alert-content]]:col-start-1 nx:[&>[data-slot=alert-title]]:col-start-1 nx:[&>[data-slot=alert-description]]:col-start-1 nx:[&>[data-slot=alert-actions]]:col-start-2 nx:[&>[data-slot=alert-actions]]:row-start-1 nx:[&>[data-slot=alert-actions]]:justify-self-end',
      },
    },
    defaultVariants: {
      variant: 'default',
      presentation: 'card',
      layout: 'stack',
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
 * Use `presentation="banner"` for the edge-to-edge banner treatment from
 * Figma's `isBanner=False` variants.
 * Use `layout="inline"` or `layout="dense"` with `AlertContent` and
 * `AlertActions` when the alert includes trailing controls.
 * Alerts are passive by default; pass `role="alert"` for urgent dynamic
 * messages or `role="status"` for polite status updates.
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
 *   <IconAlertCircle aria-hidden="true" className="nx:size-4" />
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>
 *     Your session has expired. Please log in again.
 *   </AlertDescription>
 * </Alert>
 * ```
 */
function Alert({
  className,
  variant,
  presentation,
  layout,
  ...props
}: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? 'default'}
      data-presentation={presentation ?? 'card'}
      data-layout={layout ?? 'stack'}
      className={cn(
        alertVariants({ variant, presentation, layout }),
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertContentProps
 *
 * Props for the AlertContent component.
 */
interface AlertContentProps extends React.ComponentProps<'div'> {}

/**
 * AlertContent
 *
 * Wraps alert title and description when the alert includes actions.
 *
 * @example
 * ```tsx
 * <AlertContent>
 *   <AlertTitle>Storage almost full</AlertTitle>
 *   <AlertDescription>Uploads may fail soon.</AlertDescription>
 * </AlertContent>
 * ```
 */
function AlertContent({ className, ...props }: AlertContentProps) {
  return (
    <div
      data-slot="alert-content"
      className={cn('nx:flex nx:min-w-0 nx:flex-1 nx:flex-col', className)}
      {...props}
    />
  );
}

/**
 * AlertTitleProps
 *
 * Props for the AlertTitle component.
 */
interface AlertTitleProps extends React.ComponentProps<'div'> {
  /**
   * Render the title styles on a child element. Use this when the alert title
   * needs real heading semantics in the page outline.
   *
   * @default false
   * @example
   * ```tsx
   * <AlertTitle asChild>
   *   <h2>Important Notice</h2>
   * </AlertTitle>
   * ```
   */
  asChild?: boolean;
}

/**
 * AlertTitle
 *
 * The title of an alert. Renders as a div by default; use `asChild` to apply
 * alert title styling to a semantic heading when the page outline needs one.
 *
 * @example
 * ```tsx
 * <AlertTitle>Important Notice</AlertTitle>
 * ```
 */
function AlertTitle({
  asChild = false,
  className,
  children,
  ...props
}: AlertTitleProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="alert-title"
      className={cn(
        'nx:mb-1 nx:typography-label-large nx:text-foreground',
        alertStatusTextClassName,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
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
        'nx:typography-body-small nx:text-muted-foreground nx:[&_p]:leading-relaxed',
        alertStatusTextClassName,
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertActionsProps
 *
 * Props for the AlertActions component.
 */
interface AlertActionsProps extends React.ComponentProps<'div'> {}

/**
 * AlertActions
 *
 * Holds one or two alert CTAs. Use the existing Button component for actions.
 *
 * @example
 * ```tsx
 * <AlertActions>
 *   <Button variant="outline">Manage</Button>
 *   <AlertClose onClick={() => setShow(false)} />
 * </AlertActions>
 * ```
 */
function AlertActions({ className, ...props }: AlertActionsProps) {
  return (
    <div
      data-slot="alert-actions"
      className={cn(
        'nx:mt-3 nx:flex nx:flex-wrap nx:items-center nx:gap-2',
        'nx:group-data-[layout=inline]/alert:mt-0 nx:group-data-[layout=inline]/alert:self-center nx:group-data-[layout=inline]/alert:pl-0!',
        'nx:group-data-[layout=dense]/alert:mt-0 nx:group-data-[layout=dense]/alert:self-center nx:group-data-[layout=dense]/alert:pl-0!',
        className
      )}
      {...props}
    />
  );
}

/**
 * AlertCloseProps
 *
 * Props for the AlertClose component.
 */
interface AlertCloseProps extends React.ComponentProps<'button'> {}

/**
 * AlertClose
 *
 * A styled close control for alerts. Dismissal is consumer-controlled: wire
 * `onClick` to app state when the alert should be removed. Custom children get
 * a fallback `aria-label="Dismiss alert"` unless you provide `aria-label` or
 * `aria-labelledby`.
 *
 * @example
 * ```tsx
 * <AlertClose onClick={() => setShow(false)} />
 * ```
 */
function AlertClose({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className,
  children,
  type = 'button',
  ...props
}: AlertCloseProps) {
  const hasCustomChildren = children !== undefined && children !== null;
  const fallbackAriaLabel =
    hasCustomChildren && !ariaLabel && !ariaLabelledBy
      ? 'Dismiss alert'
      : ariaLabel;

  return (
    <button
      data-slot="alert-close"
      className={cn(
        'nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:text-muted-foreground',
        'nx:transition-colors nx:hover:bg-background-hover nx:hover:text-foreground',
        'nx:focus-visible:bg-background-hover nx:focus-visible:text-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:disabled:pointer-events-none nx:disabled:opacity-50',
        'nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      type={type}
      aria-label={fallbackAriaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    >
      {children ?? (
        <>
          <IconX aria-hidden="true" />
          <span className="nx:sr-only">Dismiss alert</span>
        </>
      )}
    </button>
  );
}

export {
  Alert,
  AlertActions,
  type AlertActionsProps,
  AlertClose,
  type AlertCloseProps,
  AlertContent,
  type AlertContentProps,
  AlertDescription,
  type AlertDescriptionProps,
  type AlertProps,
  AlertTitle,
  type AlertTitleProps,
  alertVariants,
};
