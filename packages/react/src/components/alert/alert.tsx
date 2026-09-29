'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button';

const alertVariants = cva('nx:group/alert nx:grid nx:w-full nx:px-5 nx:py-4', {
  variants: {
    variant: {
      default: '',
      destructive: '',
      success: '',
      information: '',
      warning: '',
    },
    fill: { light: '', outline: '', solid: '' },
    presentation: {
      card: 'nx:rounded-md nx:border-default',
      banner: 'nx:rounded-none nx:border-b-default',
    },
    layout: {
      stack:
        'nx:grid-cols-[auto_minmax(0,1fr)] nx:items-start nx:has-[>[data-slot=alert-icon]]:gap-x-3 nx:*:data-[slot=alert-title]:col-start-2 nx:*:data-[slot=alert-description]:col-start-2 nx:*:data-[slot=alert-content]:col-start-2 nx:*:data-[slot=alert-actions]:col-start-2',
      inline:
        'nx:@container/alert nx:relative nx:grid-cols-[minmax(0,1fr)_auto] nx:items-center nx:gap-x-3 nx:gap-y-1 nx:has-[>[data-slot=alert-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]',
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      fill: 'light',
      className: 'nx:border-border-default nx:bg-container nx:text-foreground',
    },
    {
      variant: 'default',
      fill: 'outline',
      className: 'nx:border-border-default nx:bg-container nx:text-foreground',
    },
    {
      variant: 'default',
      fill: 'solid',
      className:
        'nx:border-secondary-background nx:bg-secondary-background nx:text-secondary-foreground',
    },
    {
      variant: 'destructive',
      fill: 'light',
      className:
        'nx:border-error-border nx:bg-error-subtle nx:text-error-subtle-foreground',
    },
    {
      variant: 'destructive',
      fill: 'outline',
      className:
        'nx:border-error-border nx:bg-container nx:text-error-subtle-foreground',
    },
    {
      variant: 'destructive',
      fill: 'solid',
      className:
        'nx:border-error-background nx:bg-error-background nx:text-error-foreground',
    },
    {
      variant: 'success',
      fill: 'light',
      className:
        'nx:border-success-border nx:bg-success-subtle nx:text-success-subtle-foreground',
    },
    {
      variant: 'success',
      fill: 'outline',
      className:
        'nx:border-success-border nx:bg-container nx:text-success-subtle-foreground',
    },
    {
      variant: 'success',
      fill: 'solid',
      className:
        'nx:border-success-background nx:bg-success-background nx:text-success-foreground',
    },
    {
      variant: 'information',
      fill: 'light',
      className:
        'nx:border-information-border nx:bg-information-subtle nx:text-information-subtle-foreground',
    },
    {
      variant: 'information',
      fill: 'outline',
      className:
        'nx:border-information-border nx:bg-container nx:text-information-subtle-foreground',
    },
    {
      variant: 'information',
      fill: 'solid',
      className:
        'nx:border-information-background nx:bg-information-background nx:text-information-foreground',
    },
    {
      variant: 'warning',
      fill: 'light',
      className:
        'nx:border-warning-border nx:bg-warning-subtle nx:text-warning-subtle-foreground',
    },
    {
      variant: 'warning',
      fill: 'outline',
      className:
        'nx:border-warning-border nx:bg-container nx:text-warning-subtle-foreground',
    },
    {
      variant: 'warning',
      fill: 'solid',
      className:
        'nx:border-warning-background nx:bg-warning-background nx:text-warning-foreground',
    },
  ],
  defaultVariants: {
    fill: 'light',
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
  extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {
  /** Neutral message text on light/outline surfaces. Solid always uses its paired foreground. */
  textTone?: 'status' | 'neutral';
}

const AlertFillContext = React.createContext<AlertProps['fill']>('light');

/**
 * Alert
 *
 * Displays a callout for user attention with optional icon support.
 * `fill` chooses light (default), outline, or solid treatment independently of status.
 * `textTone="neutral"` uses normal foreground for title/description on light and
 * outline surfaces; solid always retains the paired status foreground.
 * On solid surfaces, use opaque Nexus Button variants such as outline for actions
 * and links styled as buttons. AlertClose selects outline automatically.
 * Use for important messages, warnings, errors, or success confirmations.
 * Use `presentation="banner"` for the edge-to-edge banner treatment (squared
 * corners, bottom border only).
 * Use `layout="inline"` with `AlertContent` and `AlertActions` when the alert
 * has trailing controls. Below 32rem of content width, inline button actions
 * move below the message while the close control stays at the top end.
 * This responds to the alert container, not the viewport.
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
  fill = 'light',
  textTone = 'status',
  presentation,
  layout,
  ...props
}: AlertProps) {
  return (
    <AlertFillContext.Provider value={fill}>
      <div
        data-slot="alert"
        data-variant={variant ?? 'default'}
        data-fill={fill}
        data-text-tone={fill === 'solid' ? 'status' : textTone}
        data-presentation={presentation ?? 'card'}
        data-layout={layout ?? 'stack'}
        className={cn(
          alertVariants({ variant, fill, presentation, layout }),
          className
        )}
        {...props}
      />
    </AlertFillContext.Provider>
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
        'nx:group-data-[layout=inline]/alert:group-has-[[data-slot=alert-title]]/alert:self-start nx:group-data-[layout=inline]/alert:group-has-[[data-slot=alert-title]]/alert:translate-y-0.5',
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
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-col nx:wrap-anywhere',
        'nx:group-data-[layout=inline]/alert:col-span-2 nx:group-data-[layout=inline]/alert:@lg/alert:col-span-1',
        'nx:group-data-[layout=inline]/alert:group-has-[[data-slot=alert-close]]/alert:pe-10 nx:group-data-[layout=inline]/alert:group-has-[[data-slot=alert-close]]/alert:@lg/alert:pe-0',
        className
      )}
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
        'nx:mb-0.5 nx:last:mb-0 nx:typography-label-default nx:group-data-[text-tone=neutral]/alert:text-foreground',
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
        'nx:typography-body-default nx:group-data-[text-tone=status]/alert:group-data-[fill=light]/alert:group-data-[variant=default]/alert:text-muted-foreground nx:group-data-[text-tone=status]/alert:group-data-[fill=outline]/alert:group-data-[variant=default]/alert:text-muted-foreground nx:group-data-[text-tone=neutral]/alert:text-foreground',
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
 * Holds one or two alert CTAs. Use Button size="sm" to match AlertClose.
 * In stack layout, use button actions only. For dismissal controls, use
 * `layout="inline"` so `AlertClose` sits in the trailing action area.
 *
 * @example
 * ```tsx
 * <AlertActions>
 *   <Button size="sm" variant="outline">Manage</Button>
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
        'nx:group-data-[layout=inline]/alert:col-start-1 nx:group-data-[layout=inline]/alert:col-end-[-1] nx:group-data-[layout=inline]/alert:row-start-2',
        'nx:group-data-[layout=inline]/alert:group-has-[>[data-slot=alert-icon]]/alert:col-start-2 nx:group-data-[layout=inline]/alert:group-has-[>[data-slot=alert-icon]]/alert:@lg/alert:col-auto',
        'nx:group-data-[layout=inline]/alert:@lg/alert:col-auto nx:group-data-[layout=inline]/alert:@lg/alert:row-auto nx:group-data-[layout=inline]/alert:@lg/alert:mt-0',
        'nx:group-data-[layout=inline]/alert:has-[[data-slot=alert-close]:only-child]:mt-0 nx:group-data-[layout=inline]/alert:self-center',
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
 * `onClick` to app state when the alert should be removed. The application
 * also chooses a logical focus destination if removing the focused control. The default renders a
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
  const fill = React.useContext(AlertFillContext);

  return (
    <Button
      variant={fill === 'solid' ? 'outline' : 'ghost'}
      size="icon-sm"
      data-slot="alert-close"
      className={cn(
        'nx:shrink-0 nx:group-data-[layout=inline]/alert:absolute nx:group-data-[layout=inline]/alert:end-5 nx:group-data-[layout=inline]/alert:top-4 nx:group-data-[layout=inline]/alert:@lg/alert:static',
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
    </Button>
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
