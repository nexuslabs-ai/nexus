import { cva, type VariantProps } from 'class-variance-authority';

export { default as ChoiceCard, type ChoiceCardProps } from './ChoiceCard.vue';
export {
  default as ChoiceCardContent,
  type ChoiceCardContentProps,
} from './ChoiceCardContent.vue';
export {
  default as ChoiceCardDescription,
  type ChoiceCardDescriptionProps,
} from './ChoiceCardDescription.vue';
export {
  default as ChoiceCardTitle,
  type ChoiceCardTitleProps,
} from './ChoiceCardTitle.vue';

export const choiceCardVariants = cva(
  [
    'nx:group/choice-card nx:box-border nx:flex nx:min-w-0 nx:w-full nx:cursor-pointer nx:items-start nx:gap-3 nx:rounded-md nx:bg-background nx:p-4 nx:transition-colors',
    'nx:[&>[data-slot=checkbox]]:mt-0.5 nx:[&>[data-slot=radio-group-item]]:mt-0.5',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:hover:bg-background-hover',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:active:bg-background-active',
    'nx:has-[>[data-slot=checkbox]:disabled]:cursor-not-allowed nx:has-[>[data-slot=checkbox]:disabled]:border-border-disabled nx:has-[>[data-slot=checkbox]:disabled]:bg-disabled',
    'nx:has-[>[data-slot=radio-group-item]:disabled]:cursor-not-allowed nx:has-[>[data-slot=radio-group-item]:disabled]:border-border-disabled nx:has-[>[data-slot=radio-group-item]:disabled]:bg-disabled',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=checkbox][aria-invalid=true]]:border-error-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:has-[>[data-slot=radio-group-item][aria-invalid=true]]:border-error-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:border-primary-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=checked]]:bg-primary-subtle',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:border-primary-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=checkbox][data-state=indeterminate]]:bg-primary-subtle',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:border-primary-border',
    'nx:not-has-[>[data-slot=checkbox]:disabled]:not-has-[>[data-slot=radio-group-item]:disabled]:not-has-[>[data-slot=checkbox][aria-invalid=true]]:not-has-[>[data-slot=radio-group-item][aria-invalid=true]]:has-[>[data-slot=radio-group-item][data-state=checked]]:bg-primary-subtle',
  ],
  {
    variants: {
      variant: {
        bordered: 'nx:border-default nx:border-border-default',
        borderless: 'nx:border-default nx:border-transparent',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  }
);

export type ChoiceCardVariants = VariantProps<typeof choiceCardVariants>;
