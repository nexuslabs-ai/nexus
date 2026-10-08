import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Separator } from '../separator';

import {
  ButtonGroupJoinedContext,
  type ButtonGroupSize,
  ButtonGroupSizeContext,
} from './button-group-context';

const buttonGroupVariants = cva(
  'nx:flex nx:w-fit nx:items-stretch nx:*:focus-visible:relative nx:*:focus-visible:z-10',
  {
    variants: {
      orientation: {
        horizontal:
          'nx:[&>*:not(:first-child)]:rounded-s-none nx:[&>*:not(:first-child)]:border-s-0 nx:[&>*:not(:last-child)]:rounded-e-none',
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
  'nx:flex nx:items-center nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-control-background nx:shadow-xs nx:[&_svg]:pointer-events-none',
  {
    variants: {
      size: {
        xs: 'nx:h-7 nx:px-2 nx:typography-label-small nx:[&_svg]:size-icon-glyph-xs',
        sm: 'nx:h-8 nx:px-2.5 nx:typography-label-compact nx:[&_svg]:size-icon-glyph-sm',
        default:
          'nx:h-10 nx:px-3 nx:typography-label-default nx:[&_svg]:size-icon-glyph-default',
        lg: 'nx:h-12 nx:px-3.5 nx:typography-label-default nx:[&_svg]:size-icon-glyph-default',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

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
   * Size shared with ButtonGroupText and any Button member that doesn't set its
   * own size. Inherited through context, so a Button nested inside a trigger
   * wrapper (a split button) picks it up too.
   * @default "default"
   */
  size?: ButtonGroupSize;
}

/**
 * ButtonGroup
 *
 * A visually-joined cluster of button-shaped controls — Buttons, a
 * `DropdownMenu` or `Select` trigger, a link via `<Button asChild>`,
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
 *   <Button variant="outline">Previous</Button>
 *   <Button variant="outline">Today</Button>
 *   <Button variant="outline">Next</Button>
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
      <ButtonGroupJoinedContext.Provider value>
        <div
          role="group"
          data-slot="button-group"
          data-orientation={orientation}
          data-size={size}
          className={cn(buttonGroupVariants({ orientation }), className)}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupJoinedContext.Provider>
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
function ButtonGroupText({ className, size, ...props }: ButtonGroupTextProps) {
  const contextSize = React.useContext(ButtonGroupSizeContext);
  const resolvedSize = size ?? contextSize ?? 'default';

  return (
    <div
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
 * A full-length divider between actions or sub-clusters. Overlaps the next control
 * so filled surfaces remain joined. Defaults to a vertical rule.
 * The following control owns the fill under the divider, so its variant
 * selects the colour, including in mixed groups and RTL. Default/destructive
 * use their decorative on-solid tokens; other variants use the neutral border.
 * Use horizontal orientation in vertical groups. Omit this divider between
 * outlined buttons, which already have border seams.
 * Decorative by default and does not add a keyboard stop.
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
        'nx:relative nx:z-10 nx:self-stretch nx:pointer-events-none',
        'nx:data-[orientation=vertical]:h-auto nx:data-[orientation=vertical]:-me-px',
        'nx:data-[orientation=horizontal]:w-auto nx:data-[orientation=horizontal]:-mb-px',
        'nx:has-[+[data-slot=button][data-variant=default]]:bg-primary-border-on-solid nx:has-[+[data-slot=button][data-variant=destructive]]:bg-error-border-on-solid',
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
