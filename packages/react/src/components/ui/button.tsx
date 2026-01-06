import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'nx:inline-flex nx:items-center nx:justify-center nx:gap-2 nx:rounded-md nx:text-sm nx:font-medium nx:whitespace-nowrap nx:transition-colors nx:ring-offset-background nx:focus-visible:outline-none nx:focus-visible:ring-2 nx:focus-visible:ring-primary-background/50 nx:focus-visible:ring-offset-2 nx:disabled:pointer-events-none nx:disabled:opacity-50 nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-hover',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-hover',
        outline:
          'nx:border nx:border-border-default nx:bg-background nx:hover:bg-accent nx:hover:text-accent-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-hover',
        ghost: 'nx:hover:bg-accent nx:hover:text-accent-foreground',
        link: 'nx:text-primary-text nx:underline-offset-4 nx:hover:underline',
      },
      size: {
        default: 'nx:px-4 nx:py-2',
        sm: 'nx:px-3 nx:py-1.5 nx:text-xs',
        lg: 'nx:px-8 nx:py-3',
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
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, type ButtonProps, buttonVariants };
