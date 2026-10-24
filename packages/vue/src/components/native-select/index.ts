import { cva, type VariantProps } from 'class-variance-authority';

export {
  default as NativeSelect,
  type NativeSelectProps,
} from './NativeSelect.vue';
export {
  default as NativeSelectOptGroup,
  type NativeSelectOptGroupProps,
} from './NativeSelectOptGroup.vue';
export {
  default as NativeSelectOption,
  type NativeSelectOptionProps,
} from './NativeSelectOption.vue';

export const nativeSelectVariants = cva(
  [
    'nx:box-border nx:w-full nx:min-w-0 nx:appearance-none nx:rounded-md nx:border-default',
    'nx:text-foreground nx:autofill-text-foreground nx:transition-field',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:autofill-bg-disabled nx:disabled:text-disabled-foreground nx:disabled:autofill-text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        default: 'nx:px-3 nx:py-2 nx:pr-9 nx:typography-body-default',
        sm: 'nx:px-2.5 nx:py-1.5 nx:pr-9 nx:typography-body-small',
      },
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:autofill-bg-container nx:enabled:hover:bg-container-hover nx:enabled:hover:autofill-bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:autofill-bg-control-background nx:enabled:hover:bg-control-background-hover nx:enabled:hover:autofill-bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'bordered',
    },
  }
);

export type NativeSelectVariants = VariantProps<typeof nativeSelectVariants>;
