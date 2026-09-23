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
        'nx:flex nx:w-fit nx:items-center nx:rounded-md nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
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

const joinedOutlinePrimaryEdge = {
  horizontal: [
    'nx:[&:not([aria-invalid=true]:not(:disabled)):has(+[data-variant=outline-primary]:not(:disabled)[data-state=on])]:border-e-border-primary-active',
    'nx:[&:not([aria-invalid=true]:not(:disabled)):has(+[data-variant=outline-primary]:not(:disabled)[aria-invalid=true])]:border-e-border-error',
    'nx:[&:not([aria-invalid=true]:not(:disabled)):has(+[data-variant=outline-primary]:not(:disabled)[aria-invalid=true][data-state=on])]:border-e-border-error-active',
  ],
  vertical: [
    'nx:[&:not([aria-invalid=true]:not(:disabled)):has(+[data-variant=outline-primary]:not(:disabled)[data-state=on])]:border-b-border-primary-active',
    'nx:[&:not([aria-invalid=true]:not(:disabled)):has(+[data-variant=outline-primary]:not(:disabled)[aria-invalid=true])]:border-b-border-error',
    'nx:[&:not([aria-invalid=true]:not(:disabled)):has(+[data-variant=outline-primary]:not(:disabled)[aria-invalid=true][data-state=on])]:border-b-border-error-active',
  ],
} as const;

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
  const joinedOutlinePrimary =
    context.spacing === 0 && resolvedVariant === 'outline-primary';

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'nx:min-w-0 nx:shrink-0',
        'nx:data-[spacing=0]:rounded-none nx:data-[spacing=0]:data-[orientation=horizontal]:first:rounded-s-md nx:data-[spacing=0]:data-[orientation=horizontal]:last:rounded-e-md nx:data-[spacing=0]:data-[orientation=vertical]:first:rounded-t-md nx:data-[spacing=0]:data-[orientation=vertical]:last:rounded-b-md',
        // A bordered item following another bordered item drops its leading
        // border so the pair shares one edge.
        'nx:data-[spacing=0]:data-[orientation=horizontal]:[[data-slot=toggle-group-item]:not([data-variant=default])+&]:border-s-0 nx:data-[spacing=0]:data-[orientation=vertical]:[[data-slot=toggle-group-item]:not([data-variant=default])+&]:border-t-0',
        'nx:data-[spacing=0]:focus-visible:relative nx:data-[spacing=0]:focus-visible:z-10',
        joinedOutlinePrimary &&
          joinedOutlinePrimaryEdge[context.orientation ?? 'horizontal'],
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
