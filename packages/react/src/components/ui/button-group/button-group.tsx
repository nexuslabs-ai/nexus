import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type ButtonGroupSize = 'sm' | 'default' | 'lg';

const buttonGroupVariants = cva(
  'nx:flex nx:w-fit nx:items-stretch nx:has-[>[data-slot=button-group]]:gap-2 nx:*:focus-visible:relative nx:*:focus-visible:z-10 nx:has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md nx:[&>[data-slot=button][data-size=sm]:not([data-icon-only])]:h-8 nx:[&>[data-slot=button][data-size=sm]:not([data-icon-only])]:min-w-16 nx:[&>[data-slot=button][data-size=sm]:not([data-icon-only])]:px-2.5 nx:[&>[data-slot=button][data-size=default]:not([data-icon-only])]:h-10 nx:[&>[data-slot=button][data-size=default]:not([data-icon-only])]:min-w-20 nx:[&>[data-slot=button][data-size=default]:not([data-icon-only])]:px-3 nx:[&>[data-slot=button][data-size=lg]:not([data-icon-only])]:h-12 nx:[&>[data-slot=button][data-size=lg]:not([data-icon-only])]:min-w-24 nx:[&>[data-slot=button][data-size=lg]:not([data-icon-only])]:px-3.5',
  {
    variants: {
      orientation: {
        horizontal:
          'nx:[&>*:not(:first-child)]:rounded-l-none nx:[&>*:not(:first-child)]:border-l-0 nx:[&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'nx:flex-col nx:[&>*:not(:first-child)]:rounded-t-none nx:[&>*:not(:first-child)]:border-t-0 nx:[&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

const buttonGroupTextVariants = cva(
  'nx:flex nx:items-center nx:gap-2 nx:rounded-md nx:border nx:border-border-default nx:bg-control-background nx:shadow-xs nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
  {
    variants: {
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:typography-label-large',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const ButtonGroupSizeContext = React.createContext<ButtonGroupSize>('default');

/**
 * ButtonGroupProps
 *
 * Props for the ButtonGroup component.
 */
interface ButtonGroupProps
  extends
    React.ComponentProps<'div'>,
    VariantProps<typeof buttonGroupVariants> {
  /**
   * Size applied to ButtonGroupText and to direct Button children that do not
   * set their own size.
   * @default "default"
   */
  size?: ButtonGroupSize;
}

function isButtonElement(
  child: React.ReactNode
): child is React.ReactElement<ButtonProps> {
  return React.isValidElement<ButtonProps>(child) && child.type === Button;
}

function applyButtonGroupSizeToChildren(
  children: React.ReactNode,
  size: ButtonGroupSize
) {
  return React.Children.map(children, (child) => {
    if (!isButtonElement(child)) return child;
    if (child.props.size !== undefined) return child;
    return React.cloneElement(child, { size });
  });
}

/**
 * ButtonGroup
 *
 * A visually-joined cluster of button-shaped controls — Buttons, a
 * `DropdownMenu` or `Select` trigger, a link via `<ButtonGroupText asChild>`,
 * plus `ButtonGroupText` and `ButtonGroupSeparator` addons — sharing borders
 * and outer rounding so adjacent children lose their touching corners and the
 * seam between them. Lay out horizontally (default) or vertically with
 * `orientation`.
 *
 * For an input or textarea with leading/trailing addons in one shared-focus
 * field, reach for `InputGroup` instead — composing inputs is its job, not
 * this one's.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button variant="outline">Day</Button>
 *   <Button variant="outline">Week</Button>
 *   <Button variant="outline">Month</Button>
 * </ButtonGroup>
 * ```
 */
function ButtonGroup({
  className,
  orientation = 'horizontal',
  size = 'default',
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <ButtonGroupSizeContext.Provider value={size}>
      <div
        role="group"
        data-slot="button-group"
        data-orientation={orientation}
        data-size={size}
        className={cn(buttonGroupVariants({ orientation }), className)}
        {...props}
      >
        {applyButtonGroupSizeToChildren(children, size)}
      </div>
    </ButtonGroupSizeContext.Provider>
  );
}

/**
 * ButtonGroupTextProps
 *
 * Props for the ButtonGroupText component.
 */
interface ButtonGroupTextProps extends React.ComponentProps<'div'> {
  /**
   * Render as the child element via Radix Slot, keeping the addon styling.
   * @default false
   */
  asChild?: boolean;

  /**
   * Addon size. Inherits from ButtonGroup when omitted.
   * @default "default"
   */
  size?: ButtonGroupSize;
}

/**
 * ButtonGroupText
 *
 * A non-interactive label or addon inside a group — a leading prefix, a unit, a
 * count. Matches the buttons' height, border, and elevation.
 */
function ButtonGroupText({
  className,
  asChild = false,
  size,
  ...props
}: ButtonGroupTextProps) {
  const Comp = asChild ? Slot : 'div';
  const contextSize = React.useContext(ButtonGroupSizeContext);
  const resolvedSize = size ?? contextSize;

  return (
    <Comp
      data-slot="button-group-text"
      data-size={resolvedSize}
      className={cn(buttonGroupTextVariants({ size: resolvedSize }), className)}
      {...props}
    />
  );
}

/**
 * ButtonGroupSeparatorProps
 *
 * Props for the ButtonGroupSeparator component.
 */
interface ButtonGroupSeparatorProps extends React.ComponentProps<
  typeof Separator
> {}

/**
 * ButtonGroupSeparator
 *
 * A divider between sub-clusters in a group; stretches to the group's full
 * cross-axis. Defaults to a vertical rule for the common horizontal group.
 */
function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'nx:relative nx:self-stretch nx:data-[orientation=vertical]:h-auto',
        className
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  type ButtonGroupProps,
  ButtonGroupSeparator,
  type ButtonGroupSeparatorProps,
  type ButtonGroupSize,
  ButtonGroupText,
  type ButtonGroupTextProps,
  buttonGroupTextVariants,
  buttonGroupVariants,
};
