import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'nx:flex nx:w-full nx:rounded-md nx:border nx:border-border-default',
    'nx:bg-background nx:text-foreground nx:transition-colors',
    'nx:file:border-0 nx:file:bg-transparent nx:file:text-sm nx:file:font-medium nx:file:text-foreground',
    'nx:placeholder:text-muted-foreground',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        // nexus-allow-numeric: Input px stays numeric
        default: 'nx:px-3 nx:py-control-md nx:text-sm',
        // nexus-allow-numeric: Input px stays numeric
        sm: 'nx:px-2.5 nx:py-control-sm nx:text-xs',
        // nexus-allow-numeric: Input px stays numeric
        lg: 'nx:px-4 nx:py-control-lg nx:text-base',
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
