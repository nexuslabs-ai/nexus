import { cva, type VariantProps } from 'class-variance-authority';

export { default as Textarea, type TextareaProps } from './Textarea.vue';

export const textareaVariants = cva(
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

export type TextareaVariants = VariantProps<typeof textareaVariants>;
