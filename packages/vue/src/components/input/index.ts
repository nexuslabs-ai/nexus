import { cva, type VariantProps } from 'class-variance-authority';

import { fieldSizeVariants } from '../../lib/field-size';

export { default as Input, type InputProps } from './Input.vue';

export const inputVariants = cva(
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

export type InputVariants = VariantProps<typeof inputVariants>;
