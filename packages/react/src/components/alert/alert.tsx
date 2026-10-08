'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { ButtonVariantContext } from '../button/button-variant-context';
import { ButtonGroupSizeContext } from '../button-group/button-group-context';

const alertVariants = cva(
  'nx:group/alert nx:grid nx:w-full nx:grid-cols-[auto_minmax(0,1fr)_auto_auto] nx:px-5 nx:py-4',
  {
    variants: {
      variant: {
        default: 'nx:border-border-default nx:bg-container nx:text-foreground',
        destructive:
          'nx:border-error-border nx:bg-error-subtle nx:text-error-subtle-foreground',
        success:
          'nx:border-success-border nx:bg-success-subtle nx:text-success-subtle-foreground',
        information:
          'nx:border-information-border nx:bg-information-subtle nx:text-information-subtle-foreground',
        warning:
          'nx:border-warning-border nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      fill: {
        light: '',
        none: 'nx:bg-container',
        solid: 'nx:border-transparent',
      },
      presentation: {
        card: 'nx:rounded-md nx:border-default',
        banner: 'nx:rounded-none nx:border-b-default',
      },
      layout: {
        stack: 'nx:items-start',
        inline: 'nx:@container/alert nx:items-center nx:gap-y-1',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        fill: 'solid',
        className: 'nx:bg-secondary-background nx:text-secondary-foreground',
      },
      {
        variant: 'destructive',
        fill: 'solid',
        className: 'nx:bg-error-background nx:text-error-foreground',
      },
      {
        variant: 'success',
        fill: 'solid',
        className: 'nx:bg-success-background nx:text-success-foreground',
      },
      {
        variant: 'information',
        fill: 'solid',
        className:
          'nx:bg-information-background nx:text-information-foreground',
      },
      {
        variant: 'warning',
        fill: 'solid',
        className: 'nx:bg-warning-background nx:text-warning-foreground',
      },
    ],
    defaultVariants: {
      fill: 'light',
      variant: 'default',
      presentation: 'card',
      layout: 'stack',
    },
  }
);

type AlertFill = NonNullable<VariantProps<typeof alertVariants>['fill']>;

/**
 * AlertProps
 *
 * Props for the Alert component.
 */
type AlertProps = React.ComponentProps<'div'> &
  Omit<VariantProps<typeof alertVariants>, 'fill'> &
  (
    | {
        fill?: Exclude<AlertFill, 'solid'> | null;
        /** Neutral title and description text on light and none fills. */
        textTone?: 'status' | 'neutral';
      }
    | { fill: 'solid'; textTone?: never }
  );

const AlertFillContext = React.createContext<AlertFill>('light');

/**
 * Alert
 *
 * Displays a callout for user attention with optional icon support.
 * Use for important messages, warnings, errors, or success confirmations.
 *
 * `fill` sets the surface independently of status: `light` (default) tints it
 * with the status colour, `none` keeps the neutral container surface with a
 * status border and text, and `solid` uses the status background with its
 * paired foreground. The `default` variant has no tint, so its `light` and
 * `none` fills match. `textTone="neutral"` keeps title and description in the
 * normal foreground on light and none fills; solid takes no `textTone`.
 *
 * Use `presentation="banner"` for the edge-to-edge banner treatment (squared
 * corners, bottom border only).
 *
 * Use `layout="inline"` with `AlertContent` and `AlertActions` when the alert
 * has trailing controls. Below 32rem of its own width, inline actions move
 * below the message. The inline alert measures its own width, so give it a
 * definite one: it fills a block parent, but inside a shrink-to-fit parent
 * (`inline-block`, `w-fit`, a non-growing flex item) set its width.
 *
 * `AlertClose` is a direct child of Alert and sits at the top end in either
 * layout. Alerts are passive by default; pass `role="alert"` for urgent
 * dynamic messages or `role="status"` for polite status updates.
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
  fill,
  textTone = 'status',
  presentation,
  layout,
  ...props
}: AlertProps) {
  const resolvedFill = fill ?? 'light';

  return (
    <AlertFillContext.Provider value={resolvedFill}>
      <div
        data-slot="alert"
        data-variant={variant ?? 'default'}
        data-fill={resolvedFill}
        data-text-tone={resolvedFill === 'solid' ? 'status' : textTone}
        data-presentation={presentation ?? 'card'}
        data-layout={layout ?? 'stack'}
        className={cn(
          alertVariants({ variant, fill: resolvedFill, presentation, layout }),
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
        'nx:me-3 nx:flex nx:[&>svg]:size-icon-glyph-default',
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
 * title and description share one grid cell beside `AlertActions`.
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
        'nx:col-start-2 nx:flex nx:min-w-0 nx:flex-col nx:wrap-anywhere',
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
        'nx:col-start-2 nx:mb-0.5 nx:last:mb-0 nx:typography-label-default nx:group-data-[text-tone=neutral]/alert:text-foreground',
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
        'nx:col-start-2 nx:typography-body-default nx:group-data-[text-tone=status]/alert:group-data-[variant=default]/alert:not-group-data-[fill=solid]/alert:text-muted-foreground nx:group-data-[text-tone=neutral]/alert:text-foreground',
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
 * Holds one or two alert CTAs. Buttons inside default to size `sm`, matching
 * AlertClose, and to the opaque `outline` variant on solid alerts; an explicit
 * `size` or `variant` on a Button wins.
 *
 * @example
 * ```tsx
 * <AlertActions>
 *   <Button variant="outline">Manage</Button>
 * </AlertActions>
 * ```
 */
function AlertActions({ className, children, ...props }: AlertActionsProps) {
  const fill = React.useContext(AlertFillContext);

  return (
    <div
      data-slot="alert-actions"
      className={cn(
        'nx:col-start-2 nx:col-end-[-1] nx:mt-3 nx:flex nx:flex-wrap nx:items-center nx:gap-2',
        'nx:group-data-[layout=inline]/alert:@lg/alert:col-start-3 nx:group-data-[layout=inline]/alert:@lg/alert:col-end-auto nx:group-data-[layout=inline]/alert:@lg/alert:ms-3 nx:group-data-[layout=inline]/alert:@lg/alert:mt-0',
        className
      )}
      {...props}
    >
      <ButtonGroupSizeContext.Provider value="sm">
        <ButtonVariantContext.Provider
          value={fill === 'solid' ? 'outline' : undefined}
        >
          {children}
        </ButtonVariantContext.Provider>
      </ButtonGroupSizeContext.Provider>
    </div>
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
 * A styled close control for alerts. Render it as a direct child of `Alert`,
 * after `AlertActions`; it sits at the top end of the alert in either layout.
 * Dismissal is consumer-controlled: wire `onClick` to app state when the alert
 * should be removed. The application also chooses a logical focus destination
 * if removing the focused control. The default renders a close icon with a
 * visually-hidden "Dismiss alert" label. If you pass custom children, give
 * them their own accessible name — visible text self-labels; supply
 * `aria-label` for an icon-only child.
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
        'nx:col-start-4 nx:row-start-1 nx:ms-2 nx:-my-[calc((var(--nx-spacing-8)-var(--nx-typography-line-height-sm))/2)] nx:self-start nx:group-data-[layout=inline]/alert:@lg/alert:self-center',
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
