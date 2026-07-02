import * as React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const switchVariants = cva(
  [
    'nx:peer nx:relative nx:inline-flex nx:shrink-0 nx:cursor-pointer nx:items-center',
    'nx:pointer-coarse:after:absolute nx:pointer-coarse:after:-inset-3',
    'nx:rounded-full nx:border-thick nx:border-border-default',
    'nx:transition-colors',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
    'nx:aria-invalid:border-border-error nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:aria-invalid:data-[state=checked]:border-primary-background',
    'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled',
    'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:enabled:data-[state=checked]:hover:bg-primary-background-hover nx:data-[state=checked]:disabled:border-primary-disabled nx:data-[state=checked]:disabled:bg-primary-disabled',
    'nx:data-[state=unchecked]:bg-control-background nx:enabled:data-[state=unchecked]:hover:bg-control-background-hover nx:data-[state=unchecked]:disabled:bg-disabled',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-5 nx:w-9',
        sm: 'nx:h-[18px] nx:w-[32px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const switchThumbVariants = cva(
  [
    'nx:pointer-events-none nx:block nx:rounded-full',
    'nx:bg-control-thumb nx:transition-[background-color,transform]',
    'nx:data-[state=checked]:bg-primary-foreground',
    'nx:data-[state=unchecked]:translate-x-0',
  ],
  {
    variants: {
      size: {
        default: 'nx:size-4 nx:data-[state=checked]:translate-x-4',
        sm: 'nx:size-[14px] nx:data-[state=checked]:translate-x-[14px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * SwitchProps
 *
 * Props for the Switch component.
 */
interface SwitchProps
  extends
    React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

/**
 * Switch
 *
 * A toggle switch for binary on/off states. Use for settings that take
 * effect immediately without requiring a save action. Pair the switch with a
 * wired label row so the label text carries the touch target; use `size="sm"`
 * for dense rows.
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * ```
 *
 * @example
 * ```tsx
 * <div className="nx:flex nx:items-center nx:gap-2">
 *   <Switch id="airplane-mode" />
 *   <label htmlFor="airplane-mode">Airplane Mode</label>
 * </div>
 * ```
 */
function Switch({ className, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? 'default'}
      className={cn(switchVariants({ size, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={switchThumbVariants({ size })}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, type SwitchProps, switchVariants };
