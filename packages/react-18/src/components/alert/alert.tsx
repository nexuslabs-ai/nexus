import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';

const alertVariants = cva('nx:group/alert nx:grid nx:w-full nx:px-6 nx:py-4', {
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
    presentation: {
      card: 'nx:rounded-md nx:border-default',
      banner: 'nx:rounded-none nx:border-b-default',
    },
    layout: {
      stack:
        'nx:grid-cols-[auto_minmax(0,1fr)] nx:items-start nx:has-[>[data-slot=alert-icon]]:gap-x-4 nx:*:data-[slot=alert-title]:col-start-2 nx:*:data-[slot=alert-description]:col-start-2 nx:*:data-[slot=alert-content]:col-start-2 nx:*:data-[slot=alert-actions]:col-start-2',
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
type AlertProps = React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants>;

/**
 * Shows a status message inside the page.
 * Set `presentation="banner"` for an edge-to-edge strip with a bottom border only.
 * For trailing controls, use `layout="inline"` with `AlertContent` and `AlertActions`.
 * In the default stack layout, use Button actions only and leave out `AlertClose`.
 * Alert has no live role by default. Pass `role="alert"` for urgent messages or `role="status"` for polite updates.
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertProps>
>(function Alert(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant,
    presentation,
    layout,
    ...props
  }: React.PropsWithoutRef<AlertProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertIconProps
 *
 * Props for the AlertIcon component.
 */
type AlertIconProps = React.ComponentProps<'span'>;

/**
 * Leading icon. Place it first in `Alert` and pass any icon as its child.
 * Sizes the icon, colors it to match `variant` and hides it from screen readers.
 */
const AlertIcon = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<AlertIconProps>
>(function AlertIcon(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertIconProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertContentProps
 *
 * Props for the AlertContent component.
 */
type AlertContentProps = React.ComponentProps<'div'>;

/**
 * Wraps the title and description. Required with `layout="inline"` so the text sits beside `AlertActions`.
 */
const AlertContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertContentProps>
>(function AlertContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="alert-content"
      className={cn('nx:flex nx:min-w-0 nx:flex-col', className)}
      {...props}
    />
  );
});

/**
 * AlertTitleProps
 *
 * Props for the AlertTitle component.
 */
interface AlertTitleProps extends React.ComponentProps<'div'> {
  /**
   * Applies the title styles to the child element, such as a real heading.
   */
  asChild?: boolean;
}

/**
 * Alert heading. Renders a `div`, or a real heading through `asChild`.
 */
const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertTitleProps>
>(function AlertTitle(propsWithoutRef, forwardedRef) {
  const {
    asChild = false,
    className,
    children,
    ...props
  }: React.PropsWithoutRef<AlertTitleProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="alert-title"
      className={cn(
        'nx:mt-0 nx:mb-1 nx:last:mb-0 nx:typography-label-default',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});

/**
 * AlertDescriptionProps
 *
 * Props for the AlertDescription component.
 */
type AlertDescriptionProps = React.ComponentProps<'div'>;

/**
 * Body text of an alert. Holds one or more paragraphs.
 */
const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertDescriptionProps>
>(function AlertDescription(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertDescriptionProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertActionsProps
 *
 * Props for the AlertActions component.
 */
type AlertActionsProps = React.ComponentProps<'div'>;

/**
 * Holds one or two `Button` actions. Add `AlertClose` here only with `layout="inline"`.
 */
const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<AlertActionsProps>
>(function AlertActions(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<AlertActionsProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

/**
 * AlertCloseProps
 *
 * Props for the AlertClose component.
 */
type AlertCloseProps = React.ComponentProps<'button'>;

/**
 * Close button, labelled "Dismiss alert" by default. It doesn't remove the alert, so remove it in `onClick`.
 * Custom children need their own accessible name, such as `aria-label` on an icon-only child.
 */
const AlertClose = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<AlertCloseProps>
>(function AlertClose(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    type = 'button',
    ...props
  }: React.PropsWithoutRef<AlertCloseProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      data-slot="alert-close"
      className={cn(
        'nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-0 nx:bg-transparent nx:p-0 nx:text-muted-foreground',
        'nx:transition-control nx:hover:bg-container-hover nx:hover:text-foreground',
        'nx:focus-visible:bg-container-hover nx:focus-visible:text-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
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
});

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
