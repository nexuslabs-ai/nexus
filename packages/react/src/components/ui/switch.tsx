import * as React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

/**
 * SwitchProps
 *
 * Props for the Switch component.
 */
type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root>;

/**
 * Switch
 *
 * A toggle switch for binary on/off states. Use for settings that take
 * effect immediately without requiring a save action.
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * ```
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <Switch id="airplane-mode" />
 *   <label htmlFor="airplane-mode">Airplane Mode</label>
 * </div>
 * ```
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'nx:peer nx:inline-flex nx:h-5 nx:w-9 nx:shrink-0 nx:cursor-pointer nx:items-center',
        'nx:rounded-full nx:border-2 nx:border-transparent',
        'nx:shadow-sm nx:transition-colors',
        'nx:focus-visible:outline-none nx:focus-visible:ring-2 nx:focus-visible:ring-primary-background nx:focus-visible:ring-offset-2 nx:focus-visible:ring-offset-background',
        'nx:disabled:cursor-not-allowed nx:disabled:opacity-50',
        'nx:data-[state=checked]:bg-primary-background nx:data-[state=unchecked]:bg-muted',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'nx:pointer-events-none nx:block nx:size-4 nx:rounded-full',
          'nx:bg-background nx:shadow-lg nx:ring-0 nx:transition-transform',
          'nx:data-[state=checked]:translate-x-4 nx:data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, type SwitchProps };
