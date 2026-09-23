import * as React from 'react';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const toggleVariants = cva(
  'nx:inline-flex nx:items-center nx:justify-center nx:rounded-md nx:whitespace-nowrap nx:transition-control nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error nx:data-[state=on]:bg-control-background nx:data-[state=on]:text-foreground nx:data-[state=on]:hover:bg-control-background-hover nx:data-[state=on]:disabled:bg-disabled nx:data-[state=on]:disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0 nx:[&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        outline:
          'nx:border-default nx:border-border-default nx:bg-transparent nx:disabled:border-border-disabled nx:aria-invalid:disabled:border-border-disabled',
        'outline-primary': [
          'nx:border-default nx:border-border-default nx:bg-transparent nx:hover:bg-transparent nx:data-[state=on]:bg-transparent nx:data-[state=on]:hover:bg-transparent nx:data-[state=on]:disabled:bg-transparent',
          'nx:data-[state=off]:not-aria-invalid:hover:border-border-primary nx:not-disabled:data-[state=on]:border-border-primary-active nx:not-disabled:aria-invalid:data-[state=on]:border-border-error-active',
          'nx:disabled:border-border-disabled nx:aria-invalid:disabled:border-border-disabled',
        ],
      },
      size: {
        default: 'nx:px-4 nx:py-2 nx:gap-2 nx:typography-label-default',
        sm: 'nx:px-3 nx:py-1.5 nx:gap-1.5 nx:typography-label-small',
        lg: 'nx:px-8 nx:py-3 nx:gap-2.5 nx:typography-label-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * ToggleProps
 *
 * Props for the Toggle component.
 */
interface ToggleProps
  extends
    React.ComponentProps<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

/**
 * Toggle
 *
 * A two-state button that is either on or off — e.g. a formatting control
 * (Bold / Italic). For a set of related toggles, use `ToggleGroup`.
 *
 * @example
 * ```tsx
 * <Toggle aria-label="Bold">
 *   <IconBold />
 * </Toggle>
 * ```
 */
function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, type ToggleProps, toggleVariants };
