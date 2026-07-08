import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const textareaVariants = cva(
  [
    'nx:flex nx:box-border nx:min-h-16 nx:w-full nx:rounded-md nx:border-0',
    'nx:text-foreground nx:transition-colors',
    'nx:placeholder:text-muted-foreground',
    'nx:px-3 nx:py-2 nx:typography-body-default',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        bordered:
          'nx:border-border-default nx:bg-background nx:enabled:hover:bg-background-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  }
);

/**
 * TextareaProps
 *
 * Props for the Textarea component.
 */
interface TextareaProps
  extends
    React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

/**
 * Textarea
 *
 * A multi-line text input. Mirrors Input's surface, focus, and `aria-invalid`
 * treatment and accepts all native textarea attributes. Use `rows` (or a
 * `min-height` override via `className`) to set the initial height. The
 * `variant="bordered"` treatment is the default; use `variant="borderless"` to
 * remove the resting field stroke while keeping a tonal control fill for
 * resting affordance.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Tell us about yourself..." />
 * ```
 *
 * @example
 * ```tsx
 * // Invalid state — always-on error boundary plus an error-coloured focus ring
 * <Textarea aria-invalid defaultValue="too short" />
 * ```
 */
function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant ?? 'bordered'}
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Textarea, type TextareaProps, textareaVariants };
