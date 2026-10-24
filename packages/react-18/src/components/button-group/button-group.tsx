'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Separator } from '../separator/separator';

import {
  type ButtonGroupSize,
  ButtonGroupSizeContext,
} from './button-group-context';

const buttonGroupVariants = cva(
  'nx:flex nx:w-fit nx:items-stretch nx:*:focus-visible:relative nx:*:focus-visible:z-10',
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
  'nx:text-inherit nx:no-underline nx:flex nx:items-center nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-control-background nx:shadow-xs nx:transition-control nx:duration-fast nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
  {
    variants: {
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:typography-label-default',
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
   * Size for ButtonGroupText and any Button without its own `size`. It also reaches a Button inside a trigger wrapper, as in a split button.
   */
  size?: ButtonGroupSize;
}

/**
 * Joins Buttons, menu or select triggers, `ButtonGroupText` and `ButtonGroupSeparator` into one cluster with shared borders.
 * Set `orientation="vertical"` to stack them. For an input with addons, use `InputGroup`.
 */
const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ButtonGroupProps>
>(function ButtonGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    orientation = 'horizontal',
    size = 'default',
    children,
    ...props
  }: React.PropsWithoutRef<ButtonGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
        {children}
      </div>
    </ButtonGroupSizeContext.Provider>
  );
});

/**
 * ButtonGroupTextProps
 *
 * Props for the ButtonGroupText component.
 */
interface ButtonGroupTextProps extends React.ComponentProps<'div'> {
  /**
   * Renders the child element instead, such as a link.
   */
  asChild?: boolean;

  /**
   * Addon size. Inherits from ButtonGroup when omitted, or `"default"` outside one.
   */
  size?: ButtonGroupSize;
}

/**
 * Label or addon in a group, such as a prefix, unit or count. Matches the buttons' height and border.
 */
const ButtonGroupText = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ButtonGroupTextProps>
>(function ButtonGroupText(propsWithoutRef, forwardedRef) {
  const {
    className,
    asChild = false,
    size,
    ...props
  }: React.PropsWithoutRef<ButtonGroupTextProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const Comp = asChild ? Slot : 'div';
  const contextSize = React.useContext(ButtonGroupSizeContext);
  const resolvedSize = size ?? contextSize ?? 'default';

  return (
    <Comp
      data-slot="button-group-text"
      data-size={resolvedSize}
      className={cn(
        buttonGroupTextVariants({ size: resolvedSize }),
        asChild &&
          'nx:cursor-pointer nx:hover:bg-container-hover nx:active:bg-container-active',
        className
      )}
      {...props}
    />
  );
});

/**
 * ButtonGroupSeparatorProps
 *
 * Props for the ButtonGroupSeparator component.
 */
type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator>;

/**
 * Divider between sub-groups that spans the whole group. Vertical by default.
 */
const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ButtonGroupSeparatorProps>
>(function ButtonGroupSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    orientation = 'vertical',
    ...props
  }: React.PropsWithoutRef<ButtonGroupSeparatorProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
