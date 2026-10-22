import { cva, type VariantProps } from 'class-variance-authority';

export { default as Alert, type AlertProps } from './Alert.vue';
export {
  default as AlertActions,
  type AlertActionsProps,
} from './AlertActions.vue';
export { default as AlertClose, type AlertCloseProps } from './AlertClose.vue';
export {
  default as AlertContent,
  type AlertContentProps,
} from './AlertContent.vue';
export {
  default as AlertDescription,
  type AlertDescriptionProps,
} from './AlertDescription.vue';
export { default as AlertIcon, type AlertIconProps } from './AlertIcon.vue';
export { default as AlertTitle, type AlertTitleProps } from './AlertTitle.vue';

export const alertVariants = cva(
  'nx:group/alert nx:grid nx:w-full nx:px-6 nx:py-4',
  {
    variants: {
      variant: {
        default: 'nx:border-border-default nx:bg-container nx:text-foreground',
        destructive:
          'nx:border-error-border nx:bg-error-subtle nx:text-error-subtle-foreground',
        success:
          'nx:border-success-border nx:bg-success-subtle nx:text-success-subtle-foreground',
        information:
          'nx:border-information-border nx:bg-information-subtle nx:text-information-subtle-foreground',
        warning:
          'nx:border-warning-border nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      presentation: {
        card: 'nx:rounded-md nx:border-default',
        banner: 'nx:rounded-none nx:border-b-default',
      },
      layout: {
        stack:
          'nx:grid-cols-[auto_minmax(0,1fr)] nx:items-start nx:has-[>[data-slot=alert-icon]]:gap-x-4 nx:*:data-[slot=alert-title]:col-start-2 nx:*:data-[slot=alert-description]:col-start-2 nx:*:data-[slot=alert-content]:col-start-2 nx:*:data-[slot=alert-actions]:col-start-2',
        inline:
          'nx:grid-cols-[minmax(0,1fr)_auto] nx:items-center nx:gap-x-4 nx:gap-y-1 nx:has-[>[data-slot=alert-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]',
      },
    },
    defaultVariants: {
      variant: 'default',
      presentation: 'card',
      layout: 'stack',
    },
  }
);

export type AlertVariants = VariantProps<typeof alertVariants>;
