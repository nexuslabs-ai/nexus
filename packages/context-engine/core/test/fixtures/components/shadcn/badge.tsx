/**
 * Badge Component Fixture
 *
 * Simple status indicator with CVA variants.
 * Used for testing extraction of:
 * - Simple CVA patterns
 * - Compound variants
 * - Multiple variant dimensions (variant, fill)
 */

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border-input text-foreground border bg-transparent',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  /**
   * When true, renders as child element using Radix Slot.
   * @default false
   */
  asChild?: boolean;
}

function Badge({
  className,
  variant,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={badgeVariants({ variant, className })}
      {...props}
    >
      {children}
    </Comp>
  );
}

export { Badge, type BadgeProps, badgeVariants };
