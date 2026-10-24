import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { fieldSizeVariants } from '../../lib/field-size';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  [
    'nx:flex nx:box-border nx:w-full nx:rounded-md nx:border-default',
    'nx:text-foreground nx:autofill-text-foreground nx:transition-field',
    'nx:file:border-0 nx:file:bg-transparent nx:file:typography-label-default nx:file:text-foreground nx:disabled:file:text-disabled-foreground',
    'nx:placeholder:text-muted-foreground',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:autofill-bg-disabled nx:disabled:text-disabled-foreground nx:disabled:autofill-text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
  ],
  {
    variants: {
      size: fieldSizeVariants,
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:autofill-bg-container nx:enabled:hover:bg-container-hover nx:enabled:hover:autofill-bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:autofill-bg-control-background nx:enabled:hover:bg-control-background-hover nx:enabled:hover:autofill-bg-control-background-hover',
        ghost:
          'nx:border-transparent nx:bg-transparent nx:autofill-bg-transparent nx:enabled:hover:not-aria-invalid:not-focus-visible:border-border-default',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'bordered',
    },
  }
);

/**
 * InputProps
 *
 * Props for the Input component.
 */
type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>;

/**
 * A one-line text field. Accepts every native input attribute.
 *
 * - `bordered` has a stroke and a fill.
 * - `borderless` drops the stroke and keeps a tonal fill.
 * - `ghost` has no fill. Its stroke shows only on hover, focus or an invalid value.
 *
 * Browsers repaint autofilled fields with their own colors. On a custom
 * surface, pair each `bg-*` or `text-*` class with its `autofill-bg-*` or
 * `autofill-text-*` match.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.PropsWithoutRef<InputProps>
>(function Input(propsWithoutRef, forwardedRef) {
  const {
    className,
    type,
    size,
    variant,
    ...props
  }: React.PropsWithoutRef<InputProps> & {
    ref?: React.ForwardedRef<HTMLInputElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size ?? 'default'}
      data-variant={variant ?? 'bordered'}
      className={cn(inputVariants({ size, variant, className }))}
      {...props}
    />
  );
});

export { Input, type InputProps, inputVariants };
