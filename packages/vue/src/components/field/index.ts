import { cva, type VariantProps } from 'class-variance-authority';

export { default as Field, type FieldProps } from './Field.vue';
export {
  default as FieldContent,
  type FieldContentProps,
} from './FieldContent.vue';
export {
  default as FieldDescription,
  type FieldDescriptionProps,
} from './FieldDescription.vue';
export { default as FieldError, type FieldErrorProps } from './FieldError.vue';
export { default as FieldGroup, type FieldGroupProps } from './FieldGroup.vue';
export { default as FieldLabel, type FieldLabelProps } from './FieldLabel.vue';
export {
  default as FieldLegend,
  type FieldLegendProps,
} from './FieldLegend.vue';
export {
  default as FieldRequiredIndicator,
  type FieldRequiredIndicatorProps,
} from './FieldRequiredIndicator.vue';
export {
  default as FieldSeparator,
  type FieldSeparatorProps,
} from './FieldSeparator.vue';
export { default as FieldSet, type FieldSetProps } from './FieldSet.vue';
export { default as FieldTitle, type FieldTitleProps } from './FieldTitle.vue';

export const fieldVariants = cva(
  'nx:group/field nx:flex nx:w-full nx:gap-2 nx:data-[invalid=true]:text-error-subtle-foreground',
  {
    variants: {
      orientation: {
        vertical: 'nx:flex-col nx:*:w-full nx:[&>.sr-only]:w-auto',
        horizontal:
          'nx:flex-row nx:items-center nx:*:data-[slot=field-label]:flex-auto nx:has-[>[data-slot=field-content]]:items-start nx:has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px nx:has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-px',
        responsive:
          'nx:flex-col nx:@md/field-group:flex-row nx:@md/field-group:items-center nx:*:w-full nx:@md/field-group:*:w-auto nx:[&>.sr-only]:w-auto nx:@md/field-group:*:data-[slot=field-label]:flex-auto nx:@md/field-group:has-[>[data-slot=field-content]]:items-start nx:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-px nx:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-px',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

export type FieldVariants = VariantProps<typeof fieldVariants>;

/** Validation errors for a field, in the shape form libraries report them. */
export type FieldErrors = Array<{ message?: string } | undefined>;
