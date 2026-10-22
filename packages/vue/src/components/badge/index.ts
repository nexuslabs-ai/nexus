import { cva, type VariantProps } from 'class-variance-authority';

export { default as Badge, type BadgeProps } from './Badge.vue';

export const badgeVariants = cva(
  'nx:inline-flex nx:box-border nx:h-6 nx:w-fit nx:items-center nx:justify-center nx:gap-1 nx:rounded-md nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-colors',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        error: '',
        warning: '',
        success: '',
        information: '',
      },
      fill: {
        solid: '',
        light: '',
        outline: '',
      },
    },
    compoundVariants: [
      // Solid fill variants
      {
        variant: 'default',
        fill: 'solid',
        className: 'nx:bg-primary-background nx:text-primary-foreground',
      },
      {
        variant: 'secondary',
        fill: 'solid',
        className: 'nx:bg-secondary-background nx:text-secondary-foreground',
      },
      {
        variant: 'error',
        fill: 'solid',
        className: 'nx:bg-error-background nx:text-error-foreground',
      },
      {
        variant: 'warning',
        fill: 'solid',
        className: 'nx:bg-warning-background nx:text-warning-foreground',
      },
      {
        variant: 'success',
        fill: 'solid',
        className: 'nx:bg-success-background nx:text-success-foreground',
      },
      {
        variant: 'information',
        fill: 'solid',
        className:
          'nx:bg-information-background nx:text-information-foreground',
      },
      // Light fill variants
      {
        variant: 'default',
        fill: 'light',
        className: 'nx:bg-primary-subtle nx:text-primary-subtle-foreground',
      },
      {
        variant: 'secondary',
        fill: 'light',
        className: 'nx:bg-secondary-subtle nx:text-secondary-subtle-foreground',
      },
      {
        variant: 'error',
        fill: 'light',
        className: 'nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      {
        variant: 'warning',
        fill: 'light',
        className: 'nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      {
        variant: 'success',
        fill: 'light',
        className: 'nx:bg-success-subtle nx:text-success-subtle-foreground',
      },
      {
        variant: 'information',
        fill: 'light',
        className:
          'nx:bg-information-subtle nx:text-information-subtle-foreground',
      },
      // Outline fill variants
      {
        variant: 'default',
        fill: 'outline',
        className:
          'nx:border-primary-border nx:bg-primary-subtle nx:text-primary-subtle-foreground',
      },
      {
        variant: 'secondary',
        fill: 'outline',
        className:
          'nx:border-border-default nx:bg-secondary-subtle nx:text-secondary-subtle-foreground',
      },
      {
        variant: 'error',
        fill: 'outline',
        className:
          'nx:border-error-border nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      {
        variant: 'warning',
        fill: 'outline',
        className:
          'nx:border-warning-border nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      {
        variant: 'success',
        fill: 'outline',
        className:
          'nx:border-success-border nx:bg-success-subtle nx:text-success-subtle-foreground',
      },
      {
        variant: 'information',
        fill: 'outline',
        className:
          'nx:border-information-border nx:bg-information-subtle nx:text-information-subtle-foreground',
      },
    ],
    defaultVariants: {
      variant: 'default',
      fill: 'solid',
    },
  }
);

export const badgeIconClasses =
  'nx:flex nx:items-center nx:justify-center nx:size-3.5 nx:[&>svg]:size-3.5';

export function badgeShapeClasses(
  isNumber: boolean,
  isIconOnly: boolean,
  isCaps: boolean
) {
  if (isNumber)
    return 'nx:min-w-6 nx:rounded-full nx:px-1.5 nx:typography-label-caps nx:tabular-nums';
  if (isIconOnly) return 'nx:w-6 nx:p-0';
  if (isCaps) return 'nx:typography-label-caps nx:uppercase nx:px-2';
  return 'nx:typography-label-default nx:px-2.5';
}

export type BadgeVariants = VariantProps<typeof badgeVariants>;
