import * as React from 'react';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'nx:inline-flex nx:items-center nx:justify-center nx:rounded-md nx:text-sm nx:font-medium nx:whitespace-nowrap nx:transition-colors nx:outline-none nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:opacity-50 nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error nx:data-[state=on]:bg-control-background nx:data-[state=on]:text-foreground nx:data-[state=on]:hover:bg-control-background-hover nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0 nx:[&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        outline: 'nx:border nx:border-border-default nx:bg-transparent',
      },
      size: {
        default: 'nx:px-control-md nx:py-control-md nx:gap-control-md',
        sm: 'nx:px-control-sm nx:py-control-sm nx:gap-control-sm nx:text-xs',
        lg: 'nx:px-control-lg nx:py-control-lg nx:gap-control-lg',
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
      data-variant={variant}
      data-size={size}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, type ToggleProps, toggleVariants };
