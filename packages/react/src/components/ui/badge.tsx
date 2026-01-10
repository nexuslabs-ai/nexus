import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
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
        className: 'nx:bg-secondary-background nx:text-secondary-text',
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
        className: 'nx:bg-primary-surface nx:text-primary-text',
      },
      {
        variant: 'secondary',
        fill: 'light',
        className: 'nx:bg-secondary-surface nx:text-secondary-text',
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
        className: 'nx:bg-error-surface nx:text-error-text',
      },
      {
        variant: 'warning',
        fill: 'light',
        className: 'nx:bg-warning-surface nx:text-warning-text',
      },
      {
        variant: 'success',
        fill: 'light',
        className: 'nx:bg-success-surface nx:text-success-text',
      },
      {
        variant: 'information',
        fill: 'light',
        className: 'nx:bg-information-surface nx:text-information-text',
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
   * Use with `value` prop to display a number.
   * @default false
   * @example
   * ```tsx
   * <Badge isNumber value={8} />
   * <Badge isNumber value="99+" variant="error" />
   * ```
   */
  isNumber?: boolean;

  /**
   * The value to display when `isNumber` is true.
   * Ignored when `isNumber` is false.
   * @example
   * ```tsx
   * <Badge isNumber value={5} />
   * ```
   */
  value?: string | number;

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

function Badge({
  className,
  variant,
  fill,
  isCaps = true,
  asChild = false,
  isNumber = false,
  value,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  // Number badges don't support icons
  const showLeftIcon = leftIcon && !isNumber;
  const showRightIcon = rightIcon && !isNumber;

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-fill={fill}
      data-caps={isCaps}
      data-number={isNumber || undefined}
      className={cn(
        badgeVariants({ variant, fill }),
        // Typography: caps vs sentence case
        isCaps ? 'nx:typography-label-caps nx:uppercase' : 'nx:typography-label-default',
        isNumber
          ? // Circular number badge: fixed size, no padding, fully rounded
            'nx:size-5 nx:rounded-full nx:p-0 nx:typography-label-caps'
          : // Text badge: padding based on isCaps
            isCaps
            ? 'nx:px-2 nx:py-0.5'
            : 'nx:px-2.5 nx:py-0.5',
        className
      )}
      {...props}
    >
      {showLeftIcon && (
        <span className="nx:flex nx:items-center nx:justify-center nx:size-3.5">
          {leftIcon}
        </span>
      )}
      {isNumber ? value : children}
      {showRightIcon && (
        <span className="nx:flex nx:items-center nx:justify-center nx:size-3.5">
          {rightIcon}
        </span>
      )}
    </Comp>
  );
}

export { Badge, type BadgeProps, badgeVariants };
