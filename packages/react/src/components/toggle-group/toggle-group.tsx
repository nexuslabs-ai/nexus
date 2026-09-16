import * as React from 'react';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { toggleVariants } from '../toggle';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: 'horizontal' | 'vertical';
  }
>({
  spacing: 0,
  orientation: 'horizontal',
});

/**
 * ToggleGroupProps
 *
 * Props for the ToggleGroup component.
 */
// A `type` intersection (not an `interface extends`) because Radix's
// ToggleGroup.Root props are a discriminated union (single | multiple) —
// extending a union from an interface drops `children`.
type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /**
     * Gap between items, in spacing-scale units. `0` (default) joins the items
     * into a segmented control — shared borders, only the ends rounded; a
     * positive value separates them into individual pills.
     *
     * @default 0
     */
    spacing?: number;
  };

/**
 * ToggleGroup
 *
 * A set of related `ToggleGroupItem`s sharing `variant` / `size` via context.
 * `type="single"` behaves like a radio group; `type="multiple"` allows several
 * items pressed at once.
 *
 * @example
 * ```tsx
 * <ToggleGroup type="single" defaultValue="left">
 *   <ToggleGroupItem value="left" aria-label="Align left">
 *     <IconAlignLeft />
 *   </ToggleGroupItem>
 *   <ToggleGroupItem value="center" aria-label="Align center">
 *     <IconAlignCenter />
 *   </ToggleGroupItem>
 * </ToggleGroup>
 * ```
 */
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation,
  children,
  ...props
}: ToggleGroupProps) {
  const visualOrientation = orientation ?? 'horizontal';

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      data-spacing={spacing}
      data-orientation={visualOrientation}
      orientation={orientation}
      // Spacing-scale gap via the runtime spacing var (Nexus resets the base
      // --spacing, so Tailwind's --spacing() function is unavailable here).
      style={spacing ? { gap: `var(--nx-spacing-${spacing})` } : undefined}
      className={cn(
        'nx:isolate nx:flex nx:w-fit nx:items-center nx:rounded-md nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation: visualOrientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

/**
 * ToggleGroupItemProps
 *
 * Props for the ToggleGroupItem component.
 */
interface ToggleGroupItemProps
  extends
    React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {}

/**
 * ToggleGroupItem
 *
 * A single item within a `ToggleGroup`. Inherits `variant` / `size` from the
 * group unless overridden.
 */
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context.variant ?? 'default';
  const resolvedSize = size ?? context.size ?? 'default';

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      data-orientation={context.orientation}
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'nx:min-w-0 nx:shrink-0',
        'nx:data-[spacing=0]:rounded-none nx:data-[spacing=0]:data-[orientation=horizontal]:first:rounded-s-md nx:data-[spacing=0]:data-[orientation=horizontal]:last:rounded-e-md nx:data-[spacing=0]:data-[orientation=vertical]:first:rounded-t-md nx:data-[spacing=0]:data-[orientation=vertical]:last:rounded-b-md',
        'nx:data-[spacing=0]:data-[variant=outline]:data-[orientation=horizontal]:not-first:border-s-0 nx:data-[spacing=0]:data-[variant=outline]:data-[orientation=vertical]:not-first:border-t-0 nx:data-[spacing=0]:data-[variant=outline]:data-[orientation=horizontal]:[[data-toggle-group-item][data-variant=accentOutline]+&]:border-s-default nx:data-[spacing=0]:data-[variant=outline]:data-[orientation=vertical]:[[data-toggle-group-item][data-variant=accentOutline]+&]:border-t-default',
        'nx:data-[spacing=0]:data-[variant=accentOutline]:data-[orientation=horizontal]:[[data-toggle-group-item][data-variant=accentOutline]+&]:-ms-(--nx-borderwidth-default) nx:data-[spacing=0]:data-[variant=accentOutline]:data-[orientation=vertical]:[[data-toggle-group-item][data-variant=accentOutline]+&]:-mt-(--nx-borderwidth-default)',
        'nx:data-[spacing=0]:relative nx:data-[spacing=0]:enabled:hover:not-focus-visible:z-10 nx:data-[spacing=0]:data-[state=on]:enabled:not-focus-visible:z-20 nx:data-[spacing=0]:aria-invalid:enabled:not-focus-visible:z-20 nx:data-[spacing=0]:focus-visible:z-30',
        className
      )}
      {...props}
      data-toggle-group-item=""
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
  type ToggleGroupProps,
};
