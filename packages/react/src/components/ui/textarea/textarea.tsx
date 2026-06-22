import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * TextareaProps
 *
 * Props for the Textarea component.
 */
interface TextareaProps extends React.ComponentProps<'textarea'> {}

/**
 * Textarea
 *
 * A multi-line text input. Mirrors Input's surface, focus, and `aria-invalid`
 * treatment and accepts all native textarea attributes. Use `rows` (or a
 * `min-height` override via `className`) to set the initial height.
 *
 * @example
 * ```tsx
 * <Textarea placeholder="Tell us about yourself..." />
 * ```
 *
 * @example
 * ```tsx
 * // Invalid state — always-on error border plus an error-coloured focus ring
 * <Textarea aria-invalid defaultValue="too short" />
 * ```
 */
function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'nx:flex nx:min-h-16 nx:w-full nx:rounded-md nx:border nx:border-border-default',
        'nx:bg-background nx:text-foreground nx:transition-colors nx:enabled:hover:bg-background-hover',
        'nx:placeholder:text-muted-foreground',
        'nx:px-3 nx:py-2 nx:typography-body-default',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea, type TextareaProps };
