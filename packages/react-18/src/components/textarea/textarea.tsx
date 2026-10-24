import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const textareaVariants = cva(
  [
    'nx:flex nx:box-border nx:min-h-16 nx:w-full nx:rounded-md nx:border-default',
    'nx:text-foreground nx:autofill-text-foreground nx:transition-field',
    'nx:placeholder:text-muted-foreground',
    'nx:px-3 nx:py-2 nx:typography-body-default',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:autofill-bg-disabled nx:disabled:text-disabled-foreground nx:disabled:autofill-text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:autofill-bg-container nx:enabled:hover:bg-container-hover nx:enabled:hover:autofill-bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:autofill-bg-control-background nx:enabled:hover:bg-control-background-hover nx:enabled:hover:autofill-bg-control-background-hover',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  }
);

/**
 * Props for Textarea.
 */
type TextareaProps = React.ComponentProps<'textarea'> &
  VariantProps<typeof textareaVariants>;

/**
 * Multi-line text field styled like Input. Set the starting height with `rows`.
 * Set `variant="borderless"` to drop the border and keep a tinted fill.
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.PropsWithoutRef<TextareaProps>
>(function Textarea(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant,
    ...props
  }: React.PropsWithoutRef<TextareaProps> & {
    ref?: React.ForwardedRef<HTMLTextAreaElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant ?? 'bordered'}
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  );
});

export { Textarea, type TextareaProps, textareaVariants };
