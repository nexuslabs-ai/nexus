import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';

const alertVariants = cva('nx:group/alert nx:grid nx:w-full nx:p-4', {
  variants: {
    variant: {
      default: 'nx:border-border-default nx:bg-container nx:text-foreground',
      destructive:
        'nx:border-border-error nx:bg-error-subtle nx:text-error-subtle-foreground',
      success:
        'nx:border-border-success nx:bg-success-subtle nx:text-success-subtle-foreground',
      information:
        'nx:border-border-information nx:bg-information-subtle nx:text-information-subtle-foreground',
      warning:
        'nx:border-border-warning nx:bg-warning-subtle nx:text-warning-subtle-foreground',
    },
    presentation: {
      card: 'nx:rounded-md nx:border-default',
      banner: 'nx:rounded-none nx:border-b-default',
    },
    layout: {
      stack:
        'nx:grid-cols-[auto_minmax(0,1fr)] nx:items-start nx:has-[>[data-slot=alert-icon]]:gap-x-2 nx:*:data-[slot=alert-title]:col-start-2 nx:*:data-[slot=alert-description]:col-start-2 nx:*:data-[slot=alert-content]:col-start-2 nx:*:data-[slot=alert-actions]:col-start-2',
      inline:
        'nx:grid-cols-[minmax(0,1fr)_auto] nx:items-center nx:gap-x-4 nx:gap-y-1 nx:has-[>[data-slot=alert-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]',
    },
  },
  defaultVariants: {
    variant: 'default',
    presentation: 'card',
    layout: 'stack',
  },
});

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
 * Use `presentation="banner"` for the edge-to-edge banner treatment (squared
 * corners, bottom border only).
 * Use `layout="inline"` with `AlertContent` and `AlertActions` when the alert
 * has trailing controls.
 * In the default stack layout, use no actions or button actions only; avoid
 * rendering `AlertClose` below the message. Use `layout="inline"` for
 * dismissal controls.
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
 *   <AlertIcon>
 *     <IconAlertCircle />
 *   </AlertIcon>
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
 * AlertIconProps
 *
 * Props for the AlertIcon component.
 */
interface AlertIconProps extends React.ComponentProps<'span'> {}

/**
 * AlertIcon
 *
 * The leading status icon. Owns the icon's size, its status color (matched to
 * the Alert `variant`, mirroring the title), and the decorative `aria-hidden`.
 * Place it as the first child of `Alert` and pass any icon as its child.
 *
 * @example
 * ```tsx
 * <Alert variant="success">
 *   <AlertIcon>
 *     <IconCircleCheck />
 *   </AlertIcon>
 *   <AlertTitle>Saved</AlertTitle>
 * </Alert>
 * ```
 */
function AlertIcon({ className, ...props }: AlertIconProps) {
  return (
    <span
      data-slot="alert-icon"
      aria-hidden="true"
      className={cn(
        'nx:flex nx:[&>svg]:size-4',
        'nx:group-data-[layout=stack]/alert:translate-y-0.5',
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
 * Wraps alert title and description. Required in `layout="inline"` so the
 * content fills the first grid column beside `AlertActions`.
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
      className={cn('nx:flex nx:min-w-0 nx:flex-col', className)}
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
        'nx:mb-1 nx:last:mb-0 nx:typography-label-default',
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
        'nx:typography-body-default nx:group-data-[variant=default]/alert:text-muted-foreground',
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
 * In stack layout, use button actions only. For dismissal controls, use
 * `layout="inline"` so `AlertClose` sits in the trailing action area.
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
        'nx:group-data-[layout=inline]/alert:mt-0 nx:group-data-[layout=inline]/alert:self-center',
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
 * `onClick` to app state when the alert should be removed. The default renders a
 * close icon with a visually-hidden "Dismiss alert" label. If you pass custom
 * children, give them their own accessible name — visible text self-labels;
 * supply `aria-label` for an icon-only child.
 *
 * @example
 * ```tsx
 * <AlertClose onClick={() => setShow(false)} />
 * ```
 */
function AlertClose({
  className,
  children,
  type = 'button',
  ...props
}: AlertCloseProps) {
  return (
    <button
      data-slot="alert-close"
      className={cn(
        'nx:relative nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:text-muted-foreground',
        'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-1.5',
        'nx:transition-colors nx:hover:bg-background-hover nx:hover:text-foreground',
        'nx:focus-visible:bg-background-hover nx:focus-visible:text-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground',
        'nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
        className
      )}
      type={type}
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
  AlertIcon,
  type AlertIconProps,
  type AlertProps,
  AlertTitle,
  type AlertTitleProps,
  alertVariants,
};
