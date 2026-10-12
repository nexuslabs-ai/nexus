import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'nx:flex nx:box-border nx:w-full nx:rounded-md nx:border-default',
    'nx:text-foreground nx:autofill-text-foreground nx:transition-field',
    'nx:file:border-0 nx:file:bg-transparent nx:file:typography-label-default nx:file:text-foreground nx:disabled:file:text-disabled-foreground',
    'nx:placeholder:text-muted-foreground',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:autofill-bg-disabled nx:disabled:text-disabled-foreground nx:disabled:autofill-text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-10 nx:px-3 nx:py-0 nx:typography-body-default',
        sm: 'nx:h-8 nx:px-2.5 nx:py-0 nx:typography-body-small',
        lg: 'nx:h-12 nx:px-3.5 nx:py-0 nx:typography-body-default',
      },
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:autofill-bg-container nx:enabled:hover:bg-container-hover nx:enabled:hover:autofill-bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:autofill-bg-control-background nx:enabled:hover:bg-control-background-hover nx:enabled:hover:autofill-bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'bordered',
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
 * Supports different sizes and all native input attributes. The
 * `variant="bordered"` treatment is the default; use `variant="borderless"` to
 * remove the resting field stroke while keeping a tonal control fill for
 * resting affordance.
 *
 * Browsers repaint an autofilled field with their own surface and text colour,
 * so each `bg-*` / `text-*` class is paired with an `autofill-bg-*` /
 * `autofill-text-*` class of the same token. A field on a custom surface pairs
 * its own the same way.
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
 *
 * @example
 * ```tsx
 * // Custom field surface: pair the autofill fill with it
 * <Input className="nx:bg-background nx:autofill-bg-background" />
 * ```
 */
function Input({ className, type, size, variant, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size ?? 'default'}
      data-variant={variant ?? 'bordered'}
      className={cn(inputVariants({ size, variant, className }))}
      {...props}
    />
  );
}

export { Input, type InputProps, inputVariants };
