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
      caps: {
        true: 'text-label-caps nx:uppercase',
        false: 'text-label-default',
      },
    },
    compoundVariants: [
      // Solid fill variants
      {
        variant: 'default',
        fill: 'solid',
        className:
          'nx:bg-primary-background nx:text-primary-foreground',
      },
      {
        variant: 'secondary',
        fill: 'solid',
        className:
          'nx:bg-secondary-background nx:text-secondary-text',
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
        className:
          'nx:bg-error-background nx:text-error-foreground',
      },
      {
        variant: 'warning',
        fill: 'solid',
        className:
          'nx:bg-warning-background nx:text-warning-foreground',
      },
      {
        variant: 'success',
        fill: 'solid',
        className:
          'nx:bg-success-background nx:text-success-foreground',
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
        className:
          'nx:bg-primary-surface nx:text-primary-text',
      },
      {
        variant: 'secondary',
        fill: 'light',
        className:
          'nx:bg-secondary-surface nx:text-secondary-text',
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
        className:
          'nx:bg-error-surface nx:text-error-text',
      },
      {
        variant: 'warning',
        fill: 'light',
        className:
          'nx:bg-warning-surface nx:text-warning-text',
      },
      {
        variant: 'success',
        fill: 'light',
        className:
          'nx:bg-success-surface nx:text-success-text',
      },
      {
        variant: 'information',
        fill: 'light',
        className:
          'nx:bg-information-surface nx:text-information-text',
      },
    ],
    defaultVariants: {
      variant: 'default',
      fill: 'solid',
      caps: true,
    },
  }
);

interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
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
}

function Badge({
  className,
  variant,
  fill,
  caps,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-fill={fill}
      data-caps={caps}
      className={cn(
        badgeVariants({ variant, fill, caps }),
        // Padding based on caps (uppercase is more compact)
        caps ? 'nx:px-2 nx:py-0.5' : 'nx:px-2.5 nx:py-0.5',
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps, badgeVariants };
