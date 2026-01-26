import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'nx:flex nx:w-full nx:rounded-md nx:border nx:border-border-default',
    'nx:bg-background nx:text-foreground nx:shadow-sm nx:transition-colors',
    'nx:file:border-0 nx:file:bg-transparent nx:file:text-sm nx:file:font-medium nx:file:text-foreground',
    'nx:placeholder:text-muted-foreground',
    'nx:focus-visible:ring-2 nx:focus-visible:ring-primary-background-active nx:focus-visible:ring-offset-2',
    'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-10 nx:px-3 nx:py-2 nx:text-sm',
        sm: 'nx:h-8 nx:px-2.5 nx:py-1.5 nx:text-xs',
        lg: 'nx:h-12 nx:px-4 nx:py-3 nx:text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * InputProps
 *
 * Props for the Input component.
 */
interface InputProps
  extends
    Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {}

/**
 * Input
 *
 * A text input field for collecting user data.
 * Supports different sizes and all native input attributes.
 *
 * @example
 * ```tsx
 * <Input placeholder="Enter your name" />
 * ```
 *
 * @example
 * ```tsx
 * // With size variant
 * <Input size="lg" placeholder="Large input" />
 * ```
 *
 * @example
 * ```tsx
 * // With type
 * <Input type="email" placeholder="Enter email" />
 * ```
 */
function Input({ className, type, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  );
}

export { Input, type InputProps, inputVariants };
