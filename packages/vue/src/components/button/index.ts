import { cva, type VariantProps } from 'class-variance-authority';

export { default as Button, type ButtonProps } from './Button.vue';

export const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:bg-transparent nx:py-0 nx:no-underline nx:justify-center nx:rounded-base nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-[color,background-color,border-color,scale] nx:active:scale-[0.96] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:[&_svg]:pointer-events-none nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:active:bg-primary-background-active nx:disabled:bg-primary-disabled nx:aria-disabled:bg-primary-disabled',
        error:
          'nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover nx:active:bg-error-background-active nx:disabled:bg-error-disabled nx:aria-disabled:bg-error-disabled',
        outline:
          'nx:border-default nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        dashed:
          'nx:border-default nx:border-dashed nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-disabled nx:aria-disabled:text-disabled-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        ghost:
          'nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:active:scale-100 nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
      },
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:gap-2 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:gap-2 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:gap-2 nx:typography-label-default',
        'icon-sm': 'nx:size-8 nx:gap-0 nx:p-0',
        icon: 'nx:size-10 nx:gap-0 nx:p-0',
        'icon-lg': 'nx:size-12 nx:gap-0 nx:p-0',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        size: ['sm', 'default', 'lg'],
        className: 'nx:h-auto nx:p-0!',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
