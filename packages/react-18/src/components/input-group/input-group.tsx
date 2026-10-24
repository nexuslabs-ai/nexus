import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';

const inputGroupVariants = cva(
  [
    'nx:group/input-group nx:relative nx:flex nx:box-border nx:w-full nx:min-w-0 nx:items-center nx:rounded-md nx:border-default nx:transition-field',
    // Size: an inline group matches standalone Input's height for the
    // control's data-size. `not-has-[>[data-align^=block]]` scopes this to
    // non-stacked layouts (no block addon) so the fixed-height rule and the
    // auto-height stacked case are mutually exclusive — they never both
    // match.
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=sm]]:h-8',
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=default]]:h-10',
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=lg]]:h-12',
    // The control fills the fixed-height frame without adding height (the
    // compound :has() selector outranks Input's own h-* by specificity).
    // Released in the stacked case, where the control keeps its own height.
    'nx:not-has-[>[data-align^=block]]:[&>input]:h-full',
    // Alignment: addons push the control's padding to make room.
    'nx:has-[>[data-align=inline-start]]:[&>input]:pl-2',
    'nx:has-[>[data-align=inline-end]]:[&>input]:pr-2',
    'nx:has-[>[data-align=block-start]]:flex-col nx:has-[>[data-align=block-start]]:[&>input]:pb-3',
    'nx:has-[>[data-align=block-end]]:flex-col nx:has-[>[data-align=block-end]]:[&>input]:pt-3',
    'nx:data-[disabled=true]:cursor-not-allowed nx:data-[disabled=true]:bg-disabled',
    // Focus: the group shows the ring when the inner control is focused
    // (the control suppresses its own outline).
    'nx:has-[[data-slot=input-group-control]:focus-visible]:outline-default nx:has-[[data-slot=input-group-control]:focus-visible]:outline-focus-default nx:has-[[data-slot=input-group-control]:focus-visible]:border-focus-default',
    // Error: an invalid control reddens the border; an invalid focused
    // control switches the ring to the error colour (matches Input).
    'nx:has-[[data-slot][aria-invalid=true]]:border-error-border',
    'nx:has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-focus-error nx:has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:border-focus-error',
  ],
  {
    variants: {
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:not-data-[disabled=true]:hover:bg-container-hover nx:data-[disabled=true]:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:not-data-[disabled=true]:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  }
);

/**
 * Props for the InputGroup component.
 */
type InputGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof inputGroupVariants>;

/**
 * Frames an `InputGroupInput` or `InputGroupTextarea` with `InputGroupAddon`s
 * for icons, text, buttons or key hints. The group shows the control's focus
 * ring and invalid state. Inline groups match the control's height. Set
 * `variant="borderless"` to drop the border and keep a tinted fill.
 */
const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<InputGroupProps>
>(function InputGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant,
    ...props
  }: React.PropsWithoutRef<InputGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="input-group"
      data-variant={variant ?? 'bordered'}
      role="group"
      className={cn(inputGroupVariants({ variant, className }))}
      {...props}
    />
  );
});

const inputGroupAddonVariants = cva(
  'nx:flex nx:h-auto nx:cursor-text nx:items-center nx:justify-start nx:gap-2 nx:py-1.5 nx:typography-label-default nx:text-muted-foreground nx:select-none nx:group-data-[disabled=true]/input-group:text-disabled-foreground nx:[&>kbd]:rounded-sm nx:[&>svg]:size-4',
  {
    variants: {
      align: {
        'inline-start':
          'nx:order-first nx:pl-3 nx:has-[>button]:-ml-2 nx:has-[>kbd]:-ml-1.5',
        'inline-end':
          'nx:order-last nx:pr-3 nx:has-[>button]:-mr-2 nx:has-[>kbd]:-mr-1.5',
        'block-start': 'nx:order-first nx:w-full nx:px-3 nx:pt-3',
        'block-end': 'nx:order-last nx:w-full nx:px-3 nx:pb-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

/**
 * Props for the InputGroupAddon component.
 */
type InputGroupAddonProps = React.ComponentProps<'div'> &
  VariantProps<typeof inputGroupAddonVariants>;

/**
 * Slot for icons, text, buttons or key hints beside or above the control.
 * Set `align` to place it at the start, end, top or bottom.
 */
const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<InputGroupAddonProps>
>(function InputGroupAddon(propsWithoutRef, forwardedRef) {
  const {
    className,
    align = 'inline-start',
    ...props
  }: React.PropsWithoutRef<InputGroupAddonProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
});

const inputGroupButtonVariants = cva(
  'nx:flex nx:items-center nx:py-0 nx:typography-label-default nx:shadow-none nx:group-data-[disabled=true]/input-group:text-disabled-foreground',
  {
    variants: {
      size: {
        xs: 'nx:h-6 nx:gap-1 nx:rounded-sm nx:px-2 nx:has-[>svg]:px-2 nx:[&>svg]:size-3.5',
        sm: 'nx:h-8 nx:gap-1.5 nx:rounded-md nx:px-2.5 nx:has-[>svg]:px-2.5',
        'icon-xs': 'nx:size-6 nx:rounded-sm nx:p-0 nx:has-[>svg]:p-0',
        'icon-sm': 'nx:size-8 nx:p-0 nx:has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  }
);

/**
 * Props for the InputGroupButton component.
 */
type InputGroupButtonProps = Omit<React.ComponentProps<typeof Button>, 'size'> &
  VariantProps<typeof inputGroupButtonVariants>;

/**
 * Compact button sized to fit inside an `InputGroupAddon`. Uses the `ghost`
 * variant and `xs` size unless you set them.
 */
const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<InputGroupButtonProps>
>(function InputGroupButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    type = 'button',
    variant = 'ghost',
    size = 'xs',
    ...props
  }: React.PropsWithoutRef<InputGroupButtonProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Button
      type={type}
      data-slot="input-group-button"
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
});

/**
 * Props for the InputGroupText component.
 */
type InputGroupTextProps = React.ComponentProps<'span'>;

/**
 * Addon text, such as a unit, label or prefix.
 */
const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<InputGroupTextProps>
>(function InputGroupText(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<InputGroupTextProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        'nx:flex nx:items-center nx:gap-2 nx:typography-body-default nx:text-muted-foreground nx:group-data-[disabled=true]/input-group:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the InputGroupInput component.
 */
type InputGroupInputProps = Omit<React.ComponentProps<typeof Input>, 'variant'>;

/**
 * Text input for an `InputGroup`. The group supplies its border, focus ring
 * and height.
 */
const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.PropsWithoutRef<InputGroupInputProps>
>(function InputGroupInput(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<InputGroupInputProps> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'nx:flex-1 nx:rounded-none nx:border-0 nx:focus-visible:outline-none',
        'nx:bg-transparent nx:enabled:hover:bg-transparent nx:disabled:bg-transparent',
        'nx:autofill-bg-transparent nx:enabled:hover:autofill-bg-transparent nx:disabled:autofill-bg-transparent',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the InputGroupTextarea component.
 */
type InputGroupTextareaProps = Omit<
  React.ComponentProps<typeof Textarea>,
  'variant'
>;

/**
 * Textarea for an `InputGroup`. The group supplies its border and focus
 * ring.
 */
const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.PropsWithoutRef<InputGroupTextareaProps>
>(function InputGroupTextarea(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<InputGroupTextareaProps> & {
    ref?: React.ForwardedRef<HTMLTextAreaElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'nx:flex-1 nx:resize-none nx:rounded-none nx:border-0 nx:py-3 nx:focus-visible:outline-none',
        'nx:bg-transparent nx:enabled:hover:bg-transparent nx:disabled:bg-transparent',
        'nx:autofill-bg-transparent nx:enabled:hover:autofill-bg-transparent nx:disabled:autofill-bg-transparent',
        className
      )}
      {...props}
    />
  );
});

export {
  InputGroup,
  InputGroupAddon,
  type InputGroupAddonProps,
  inputGroupAddonVariants,
  InputGroupButton,
  type InputGroupButtonProps,
  inputGroupButtonVariants,
  InputGroupInput,
  type InputGroupInputProps,
  type InputGroupProps,
  InputGroupText,
  InputGroupTextarea,
  type InputGroupTextareaProps,
  type InputGroupTextProps,
  inputGroupVariants,
};
