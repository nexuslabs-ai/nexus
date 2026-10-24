import { cva, type VariantProps } from 'class-variance-authority';

export {
  default as ButtonGroup,
  type ButtonGroupProps,
} from './ButtonGroup.vue';
export {
  default as ButtonGroupSeparator,
  type ButtonGroupSeparatorProps,
} from './ButtonGroupSeparator.vue';
export {
  default as ButtonGroupText,
  type ButtonGroupTextProps,
} from './ButtonGroupText.vue';

export const buttonGroupVariants = cva(
  'nx:flex nx:w-fit nx:items-stretch nx:*:focus-visible:relative nx:*:focus-visible:z-10',
  {
    variants: {
      orientation: {
        horizontal:
          'nx:[&>*:not(:first-child)]:rounded-l-none nx:[&>*:not(:first-child)]:border-l-0 nx:[&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'nx:flex-col nx:[&>*:not(:first-child)]:rounded-t-none nx:[&>*:not(:first-child)]:border-t-0 nx:[&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

export const buttonGroupTextVariants = cva(
  'nx:text-inherit nx:no-underline nx:flex nx:items-center nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-control-background nx:shadow-xs nx:transition-control nx:duration-fast nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4',
  {
    variants: {
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:typography-label-default',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;
