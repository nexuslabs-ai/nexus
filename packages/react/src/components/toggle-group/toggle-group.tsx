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
 * `type="single"` behaves like a radio group, except that the selected item can
 * be cleared back to an empty value; `type="multiple"` allows several items
 * pressed at once.
 *
 * `aria-invalid` on the group does not style its items — mark the individual
 * `ToggleGroupItem`s invalid and describe the error with your own text.
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
  orientation = 'horizontal',
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      orientation={orientation}
      // Spacing-scale gap via the runtime spacing var (Nexus resets the base
      // --spacing, so Tailwind's --spacing() function is unavailable here).
      style={spacing ? { gap: `var(--nx-spacing-${spacing})` } : undefined}
      className={cn(
        'nx:isolate nx:flex nx:w-fit nx:items-center nx:rounded-md nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      data-spacing={spacing}
      data-orientation={orientation}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
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
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'nx:min-w-0 nx:shrink-0',
        'nx:data-[spacing=0]:rounded-none nx:data-[spacing=0]:data-[orientation=horizontal]:first:rounded-s-md nx:data-[spacing=0]:data-[orientation=horizontal]:last:rounded-e-md nx:data-[spacing=0]:data-[orientation=vertical]:first:rounded-t-md nx:data-[spacing=0]:data-[orientation=vertical]:last:rounded-b-md',
        'nx:data-[spacing=0]:data-[variant=outline]:data-[orientation=horizontal]:[[data-slot=toggle-group-item][data-variant=outline]+&]:border-s-0 nx:data-[spacing=0]:data-[variant=outline]:data-[orientation=vertical]:[[data-slot=toggle-group-item][data-variant=outline]+&]:border-t-0',
        'nx:data-[spacing=0]:data-[variant=outline-primary]:data-[orientation=horizontal]:[[data-slot=toggle-group-item][data-variant=outline-primary]+&]:-ms-(--nx-borderwidth-default) nx:data-[spacing=0]:data-[variant=outline-primary]:data-[orientation=vertical]:[[data-slot=toggle-group-item][data-variant=outline-primary]+&]:-mt-(--nx-borderwidth-default)',
        'nx:data-[spacing=0]:relative nx:data-[spacing=0]:not-disabled:hover:not-focus-visible:z-10 nx:data-[spacing=0]:data-[state=on]:not-disabled:not-focus-visible:z-20 nx:data-[spacing=0]:aria-invalid:not-disabled:not-focus-visible:z-20 nx:data-[spacing=0]:focus-visible:z-30',
        className
      )}
      {...props}
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      data-orientation={context.orientation}
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
