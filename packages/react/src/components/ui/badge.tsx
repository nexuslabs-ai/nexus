import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // nexus-allow-numeric: chip rhythm
  'nx:inline-flex nx:items-center nx:justify-center nx:gap-1 nx:rounded-md nx:whitespace-nowrap nx:transition-colors nx:w-fit',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        outline: '',
        error: '',
        warning: '',
        success: '',
        information: '',
      },
      fill: {
        solid: '',
        light: '',
      },
    },
    compoundVariants: [
      // Solid fill variants
      {
        variant: 'default',
        fill: 'solid',
        className: 'nx:bg-primary-background nx:text-primary-foreground',
      },
      {
        variant: 'secondary',
        fill: 'solid',
        className: 'nx:bg-secondary-background nx:text-secondary-foreground',
      },
      {
        variant: 'outline',
        fill: 'solid',
        className:
          'nx:border nx:border-border-default nx:bg-transparent nx:text-foreground',
      },
      {
        variant: 'error',
        fill: 'solid',
        className: 'nx:bg-error-background nx:text-error-foreground',
      },
      {
        variant: 'warning',
        fill: 'solid',
        className: 'nx:bg-warning-background nx:text-warning-foreground',
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
      // Light fill variants
      {
        variant: 'default',
        fill: 'light',
        className: 'nx:bg-primary-subtle nx:text-primary-subtle-foreground',
      },
      {
        variant: 'secondary',
        fill: 'light',
        className: 'nx:bg-secondary-subtle nx:text-secondary-subtle-foreground',
      },
      {
        variant: 'outline',
        fill: 'light',
        className:
          'nx:border nx:border-border-default nx:bg-transparent nx:text-foreground',
      },
      {
        variant: 'error',
        fill: 'light',
        className: 'nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      {
        variant: 'warning',
        fill: 'light',
        className: 'nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      {
        variant: 'success',
        fill: 'light',
        className: 'nx:bg-success-subtle nx:text-success-subtle-foreground',
      },
      {
        variant: 'information',
        fill: 'light',
        className:
          'nx:bg-information-subtle nx:text-information-subtle-foreground',
      },
    ],
    defaultVariants: {
      variant: 'default',
      fill: 'solid',
    },
  }
);

interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  /**
   * When true, uses uppercase text with wider letter-spacing.
   * @default true
   */
  isCaps?: boolean;

  /**
   * When true, renders as child element using Radix Slot.
   * Useful for composition with links or custom elements.
   * @default false
   * @example
   * ```tsx
   * <Badge asChild>
   *   <a href="/status">Active</a>
   * </Badge>
   * ```
   */
  asChild?: boolean;

  /**
   * When true, renders as a circular number badge.
   * Pass the number as children.
   * @default false
   * @example
   * ```tsx
   * <Badge isNumber>8</Badge>
   * <Badge isNumber variant="error">99+</Badge>
   * ```
   */
  isNumber?: boolean;

  /**
   * Icon to display before the label.
   * Icon is automatically sized to 14px (3.5 spacing units).
   * Ignored when `isNumber` is true.
   * @example
   * ```tsx
   * <Badge leftIcon={<IconCheck />}>Verified</Badge>
   * ```
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after the label.
   * Icon is automatically sized to 14px (3.5 spacing units).
   * Ignored when `isNumber` is true.
   * @example
   * ```tsx
   * <Badge rightIcon={<IconX />}>Dismiss</Badge>
   * ```
   */
  rightIcon?: React.ReactNode;
}

interface BadgeActionProps extends React.ComponentProps<'button'> {
  /**
   * When true, renders as child element using Radix Slot.
   * Useful for rendering a custom control while keeping badge action styles.
   * @default false
   * @example
   * ```tsx
   * <BadgeAction asChild>
   *   <a href="/dismiss">Dismiss</a>
   * </BadgeAction>
   * ```
   */
  asChild?: boolean;
}

type BadgeDotProps = React.ComponentProps<'span'>;

function Badge({
  className,
  variant,
  fill,
  isCaps = true,
  asChild = false,
  isNumber = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  // Number badges don't support icons
  const showLeftIcon = leftIcon && !isNumber;
  const showRightIcon = rightIcon && !isNumber;

  const classes = cn(
    badgeVariants({ variant, fill }),
    isCaps
      ? 'nx:typography-label-caps nx:uppercase'
      : 'nx:typography-label-default',
    isNumber
      ? 'nx:size-5 nx:rounded-full nx:p-0 nx:typography-label-caps'
      : isCaps
        ? // nexus-allow-numeric: chip rhythm
          'nx:px-2 nx:py-0.5'
        : // nexus-allow-numeric: chip rhythm
          'nx:px-2.5 nx:py-0.5',
    className
  );

  // Slot requires exactly one child element
  if (asChild) {
    return (
      <Slot
        data-slot="badge"
        data-variant={variant}
        data-fill={fill}
        data-caps={isCaps}
        data-number={isNumber || undefined}
        className={classes}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-fill={fill}
      data-caps={isCaps}
      data-number={isNumber || undefined}
      className={classes}
      {...props}
    >
      {showLeftIcon && (
        <span className="nx:flex nx:items-center nx:justify-center nx:size-3.5">
          {leftIcon}
        </span>
      )}
      {children}
      {showRightIcon && (
        <span className="nx:flex nx:items-center nx:justify-center nx:size-3.5">
          {rightIcon}
        </span>
      )}
    </span>
  );
}

function BadgeAction({
  className,
  asChild = false,
  type = 'button',
  ...props
}: BadgeActionProps) {
  const classes = cn(
    // nexus-allow-numeric: chip action affordance
    'nx:inline-flex nx:size-3.5 nx:items-center nx:justify-center nx:rounded-sm nx:p-0 nx:text-current nx:opacity-70 nx:transition-opacity nx:hover:opacity-100 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:opacity-40 nx:[&_svg]:size-3.5',
    className
  );

  if (asChild) {
    return <Slot data-slot="badge-action" className={classes} {...props} />;
  }

  return (
    <button
      type={type}
      data-slot="badge-action"
      className={classes}
      {...props}
    />
  );
}

function BadgeDot({ className, ...props }: BadgeDotProps) {
  return (
    <span
      data-slot="badge-dot"
      aria-hidden="true"
      className={cn(
        // nexus-allow-numeric: chip dot affordance
        'nx:size-1.5 nx:rounded-full nx:bg-current nx:opacity-75',
        className
      )}
      {...props}
    />
  );
}

export {
  Badge,
  BadgeAction,
  type BadgeActionProps,
  BadgeDot,
  type BadgeDotProps,
  type BadgeProps,
  badgeVariants,
};
