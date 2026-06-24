import * as React from 'react';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';

import { toggleVariants } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & { spacing?: number }
>({
  spacing: 0,
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
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      data-spacing={spacing}
      // Spacing-scale gap via the runtime spacing var (Nexus resets the base
      // --spacing, so Tailwind's --spacing() function is unavailable here).
      style={spacing ? { gap: `var(--nx-spacing-${spacing})` } : undefined}
      className={cn(
        'nx:flex nx:w-fit nx:items-center nx:rounded-md',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
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
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'nx:min-w-0 nx:shrink-0',
        // When joined (spacing=0): drop inner rounding/borders so items share
        // edges; round only the group's ends.
        'nx:data-[spacing=0]:rounded-none nx:data-[spacing=0]:first:rounded-l-md nx:data-[spacing=0]:last:rounded-r-md nx:data-[spacing=0]:data-[variant=outline]:border-l-0 nx:data-[spacing=0]:data-[variant=outline]:first:border-l',
        className
      )}
      {...props}
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
