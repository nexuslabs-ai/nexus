import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconLoader2 } from '@/lib/icons';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'nx:inline-flex nx:items-center nx:justify-center nx:rounded-md nx:text-sm nx:font-medium nx:whitespace-nowrap nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:opacity-50 nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover',
        outline:
          'nx:border nx:border-border-default nx:bg-background nx:hover:bg-background-hover nx:hover:text-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover',
        ghost: 'nx:hover:bg-background-hover nx:hover:text-foreground',
        link: 'nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline',
      },
      size: {
        default: 'nx:px-control-md nx:py-control-md nx:gap-control-md',
        sm: 'nx:px-control-sm nx:py-control-sm nx:gap-control-sm nx:text-xs',
        lg: 'nx:px-control-lg nx:py-control-lg nx:gap-control-lg',
        // nexus-allow-numeric: density-stable square hit-target
        icon: 'nx:p-2.5',
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
   * @example
   * ```tsx
   * <Button asChild>
   *   <a href="/page">Link styled as button</a>
   * </Button>
   * ```
   */
  asChild?: boolean;

  /**
   * Shows a loading indicator and disables the button.
   * When loading, the button is non-interactive and shows aria-busy for accessibility.
   * @default false
   * @example
   * ```tsx
   * <Button loading>Submitting...</Button>
   * ```
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
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      type={type}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading ? (
        <>
          {children}
          <IconLoader2 className="nx:animate-spin" aria-hidden="true" />
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, type ButtonProps, buttonVariants };
