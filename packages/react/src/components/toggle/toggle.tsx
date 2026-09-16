import * as React from 'react';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const toggleVariants = cva(
  'nx:inline-flex nx:items-center nx:justify-center nx:rounded-md nx:whitespace-nowrap nx:transition-colors nx:outline-none nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset) nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error nx:data-[state=on]:bg-control-background nx:data-[state=on]:text-foreground nx:data-[state=on]:hover:bg-control-background-hover nx:data-[state=on]:disabled:bg-disabled nx:data-[state=on]:disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0 nx:[&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        outline:
          'nx:border-default nx:border-border-default nx:bg-transparent nx:disabled:border-border-disabled nx:aria-invalid:disabled:border-border-disabled',
        accentOutline: [
          'nx:relative nx:border-0 nx:bg-transparent nx:hover:bg-transparent nx:data-[state=on]:bg-transparent nx:data-[state=on]:hover:bg-transparent nx:data-[state=on]:disabled:bg-transparent',
          'nx:before:pointer-events-none nx:before:absolute nx:before:inset-0 nx:before:rounded-[inherit] nx:before:content-[""] nx:before:inset-ring-(length:--nx-borderwidth-default) nx:before:inset-ring-border-default',
          'nx:enabled:hover:before:inset-ring-border-primary-active nx:data-[state=on]:enabled:before:inset-ring-focus-default nx:data-[state=on]:enabled:hover:before:inset-ring-focus-default nx:data-[state=on]:enabled:before:ring-(length:--nx-borderwidth-default) nx:data-[state=on]:enabled:before:ring-focus-default',
          'nx:aria-invalid:enabled:before:inset-ring-border-error nx:aria-invalid:enabled:hover:before:inset-ring-border-error nx:aria-invalid:data-[state=on]:enabled:before:inset-ring-border-error nx:aria-invalid:data-[state=on]:enabled:hover:before:inset-ring-border-error nx:aria-invalid:data-[state=on]:enabled:before:ring-focus-error nx:disabled:before:inset-ring-border-disabled',
          'nx:forced-colors:before:outline nx:forced-colors:before:outline-1 nx:forced-colors:before:-outline-offset-1 nx:forced-colors:before:outline-[ButtonText] nx:forced-colors:data-[state=on]:before:outline-2 nx:forced-colors:data-[state=on]:before:-outline-offset-2 nx:forced-colors:data-[state=on]:enabled:before:outline-[Highlight] nx:forced-colors:disabled:before:outline-[GrayText]',
        ],
      },
      size: {
        default: 'nx:px-4 nx:py-2 nx:gap-2 nx:typography-label-default',
        sm: 'nx:px-3 nx:py-1.5 nx:gap-1.5 nx:typography-label-small',
        lg: 'nx:px-8 nx:py-3 nx:gap-2.5 nx:typography-label-default',
      },
    },
    compoundVariants: [
      {
        variant: 'accentOutline',
        size: 'sm',
        className:
          'nx:px-[calc(var(--nx-spacing-3)+var(--nx-borderwidth-default))] nx:py-[calc(var(--nx-spacing-1_5)+var(--nx-borderwidth-default))]',
      },
      {
        variant: 'accentOutline',
        size: 'default',
        className:
          'nx:px-[calc(var(--nx-spacing-4)+var(--nx-borderwidth-default))] nx:py-[calc(var(--nx-spacing-2)+var(--nx-borderwidth-default))]',
      },
      {
        variant: 'accentOutline',
        size: 'lg',
        className:
          'nx:px-[calc(var(--nx-spacing-8)+var(--nx-borderwidth-default))] nx:py-[calc(var(--nx-spacing-3)+var(--nx-borderwidth-default))]',
      },
    ],
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
