import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'nx:flex nx:w-full nx:rounded-md nx:border-width-default nx:border-color-default',
    'nx:bg-background nx:text-foreground nx:transition-colors nx:enabled:hover:bg-background-hover',
    'nx:file:border-0 nx:file:bg-transparent nx:file:typography-label-default nx:file:text-foreground nx:disabled:file:text-disabled-foreground',
    'nx:placeholder:text-muted-foreground',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-color-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:border-color-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-10 nx:px-3 nx:py-0 nx:typography-body-default',
        sm: 'nx:h-8 nx:px-2.5 nx:py-0 nx:typography-body-small',
        lg: 'nx:h-12 nx:px-3.5 nx:py-0 nx:typography-body-default',
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
      data-size={size ?? 'default'}
      className={cn(inputVariants({ size, className }))}
      {...props}
    />
  );
}

export { Input, type InputProps, inputVariants };
