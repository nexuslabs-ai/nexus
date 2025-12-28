import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'nx:ring-offset-background focus-visible:nx:ring-ring nx:inline-flex nx:items-center nx:justify-center nx:gap-2 nx:rounded-md nx:text-sm nx:font-medium nx:whitespace-nowrap nx:transition-colors focus-visible:nx:ring-2 focus-visible:nx:ring-offset-2 focus-visible:nx:outline-none disabled:nx:pointer-events-none disabled:nx:opacity-50 [&_svg]:nx:pointer-events-none [&_svg]:nx:size-4 [&_svg]:nx:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary nx:text-primary-foreground hover:nx:bg-primary/90',
        destructive:
          'nx:bg-destructive nx:text-destructive-foreground hover:nx:bg-destructive/90',
        outline:
          'nx:border-input nx:bg-background hover:nx:bg-accent hover:nx:text-accent-foreground nx:border',
        secondary:
          'nx:bg-secondary nx:text-secondary-foreground hover:nx:bg-secondary/80',
        ghost: 'hover:nx:bg-accent hover:nx:text-accent-foreground',
        link: 'nx:text-primary nx:underline-offset-4 hover:nx:underline',
      },
      size: {
        default: 'nx:h-10 nx:px-4 nx:py-2',
        sm: 'nx:h-9 nx:rounded-md nx:px-3',
        lg: 'nx:h-11 nx:rounded-md nx:px-8',
        icon: 'nx:h-10 nx:w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
