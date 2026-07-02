import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'nx:inline-flex nx:items-center nx:justify-center nx:gap-1 nx:rounded-md nx:whitespace-nowrap nx:transition-colors nx:w-fit',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        error: '',
        warning: '',
        success: '',
        information: '',
      },
      fill: {
        solid: '',
        light: '',
        outline: '',
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
      // Outline fill variants
      {
        variant: 'default',
        fill: 'outline',
        className:
          'nx:border-default nx:border-border-primary nx:bg-primary-subtle nx:text-primary-subtle-foreground',
      },
      {
        variant: 'secondary',
        fill: 'outline',
        className:
          'nx:border-default nx:border-border-default nx:bg-secondary-subtle nx:text-secondary-subtle-foreground',
      },
      {
        variant: 'error',
        fill: 'outline',
        className:
          'nx:border-default nx:border-border-error nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      {
        variant: 'warning',
        fill: 'outline',
        className:
          'nx:border-default nx:border-border-warning nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      {
        variant: 'success',
        fill: 'outline',
        className:
          'nx:border-default nx:border-border-success nx:bg-success-subtle nx:text-success-subtle-foreground',
      },
      {
        variant: 'information',
        fill: 'outline',
        className:
          'nx:border-default nx:border-border-information nx:bg-information-subtle nx:text-information-subtle-foreground',
      },
    ],
    defaultVariants: {
      variant: 'default',
      fill: 'solid',
    },
  }
);

const badgeIconClasses =
  'nx:flex nx:items-center nx:justify-center nx:size-3.5 nx:[&>svg]:size-3.5';

function badgeShapeClasses(
  isNumber: boolean,
  isIconOnly: boolean,
  isCaps: boolean
) {
  if (isNumber)
    return 'nx:min-h-6 nx:min-w-6 nx:rounded-full nx:px-1.5 nx:py-0 nx:typography-label-caps nx:tabular-nums';
  if (isIconOnly) return 'nx:h-6 nx:min-w-6 nx:p-0';
  if (isCaps) return 'nx:typography-label-caps nx:uppercase nx:px-2 nx:py-1';
  return 'nx:typography-label-default nx:px-2.5 nx:py-1';
}

interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  /**
   * When true, uses uppercase text with wider letter-spacing.
   * @default true
   */
  isCaps?: boolean;

  /**
   * When true, renders as a circular number badge.
   * Pass the number as children. A bare count is ambiguous to assistive tech —
   * pass an `aria-label` for context (e.g. `aria-label="8 unread"`).
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
   * If the badge has no children, this renders as an icon-only badge.
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
   * If the badge has no children and no `leftIcon`, this renders as an icon-only badge.
   * Ignored when `isNumber` is true.
   * @example
   * ```tsx
   * <Badge rightIcon={<IconX />}>Dismiss</Badge>
   * ```
   */
  rightIcon?: React.ReactNode;
}

/**
 * Status / label chip — a non-interactive `<span>`.
 *
 * Accessibility: status is conveyed by color, so don't rely on color alone —
 * pair a status `variant` with text or a leading icon. Icon-only badges set
 * `role="img"`, so pass `aria-label`, `aria-labelledby`, or `title` to name
 * them. The badge is not a live region; if its status or count updates, wrap it
 * in `aria-live="polite"`.
 */
function Badge({
  className,
  variant,
  fill,
  isCaps = true,
  isNumber = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  const hasChildren = React.Children.count(children) > 0;
  const isIconOnly =
    !isNumber && !hasChildren && Boolean(leftIcon || rightIcon);
  const iconOnlyIcon = leftIcon ?? rightIcon;
  const showLeftIcon = leftIcon && !isNumber && !isIconOnly;
  const showRightIcon = rightIcon && !isNumber && !isIconOnly;

  const classes = cn(
    badgeVariants({ variant, fill }),
    badgeShapeClasses(isNumber, isIconOnly, isCaps),
    className
  );

  return (
    <span
      data-slot="badge"
      data-variant={variant ?? 'default'}
      data-fill={fill ?? 'solid'}
      data-caps={isCaps}
      data-number={isNumber || undefined}
      data-icon-only={isIconOnly || undefined}
      role={isIconOnly ? 'img' : undefined}
      className={classes}
      {...props}
    >
      {isIconOnly && <span className={badgeIconClasses}>{iconOnlyIcon}</span>}
      {showLeftIcon && (
        <span aria-hidden className={badgeIconClasses}>
          {leftIcon}
        </span>
      )}
      {children}
      {showRightIcon && (
        <span aria-hidden className={badgeIconClasses}>
          {rightIcon}
        </span>
      )}
    </span>
  );
}

export { Badge, type BadgeProps, badgeVariants };
