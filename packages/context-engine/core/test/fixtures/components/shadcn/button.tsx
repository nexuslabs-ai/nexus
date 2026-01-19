/**
 * Button Component Fixture
 *
 * Standard shadcn-style button with CVA variants and asChild pattern.
 * Used for testing extraction of:
 * - CVA variants and default values
 * - asChild/Slot composition pattern
 * - Props with JSDoc descriptions
 * - Boolean props (loading, asChild)
 */

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground border',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /**
   * When true, the button will render as its child element (using Radix Slot).
   * Useful for rendering as a link or custom element while keeping button styles.
   * @default false
   */
  asChild?: boolean;

  /**
   * Shows a loading indicator and disables the button.
   * @default false
   */
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={buttonVariants({ variant, size, className })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Button, type ButtonProps, buttonVariants };
