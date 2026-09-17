import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'nx:flex nx:box-border nx:w-full nx:rounded-md nx:border-0',
    'nx:text-foreground nx:transition-colors nx:[--input-autofill-foreground:var(--nx-color-foreground,var(--color-foreground))]',
    'nx:file:border-0 nx:file:bg-transparent nx:file:typography-label-default nx:file:text-foreground nx:disabled:file:text-disabled-foreground',
    'nx:placeholder:text-muted-foreground',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground nx:disabled:[--input-autofill-background:var(--nx-color-disabled,var(--color-disabled))] nx:disabled:[--input-autofill-foreground:var(--nx-color-disabled-foreground,var(--color-disabled-foreground))]',
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
          'nx:border-border-default nx:bg-container nx:enabled:hover:bg-container-hover nx:disabled:border-border-disabled nx:[--input-autofill-background:var(--nx-color-container,var(--color-container))] nx:enabled:hover:[--input-autofill-background:var(--nx-color-container-hover,var(--color-container-hover))]',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover nx:[--input-autofill-background:var(--nx-color-control-background,var(--color-control-background))] nx:enabled:hover:[--input-autofill-background:var(--nx-color-control-background-hover,var(--color-control-background-hover))]',
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
 * Browser autofill repaints the field with a UA-owned surface. Nexus overrides
 * that paint from `--input-autofill-background` and `--input-autofill-foreground`;
 * re-point either variable to opt a field out of the default surface.
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
 * // Opt a field out of the default autofill surface
 * <Input className="nx:[--input-autofill-background:var(--nx-color-control-background,var(--color-control-background))]" />
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
