import { cva, type VariantProps } from 'class-variance-authority';

export { default as InputGroup, type InputGroupProps } from './InputGroup.vue';
export {
  default as InputGroupAddon,
  type InputGroupAddonProps,
} from './InputGroupAddon.vue';
export {
  default as InputGroupButton,
  type InputGroupButtonProps,
} from './InputGroupButton.vue';
export {
  default as InputGroupInput,
  type InputGroupInputProps,
} from './InputGroupInput.vue';
export {
  default as InputGroupText,
  type InputGroupTextProps,
} from './InputGroupText.vue';
export {
  default as InputGroupTextarea,
  type InputGroupTextareaProps,
} from './InputGroupTextarea.vue';

export const inputGroupVariants = cva(
  [
    'nx:group/input-group nx:relative nx:flex nx:box-border nx:w-full nx:min-w-0 nx:items-center nx:rounded-md nx:border-default nx:transition-field',
    // Size: an inline group matches standalone Input's height for the
    // control's data-size. `not-has-[>[data-align^=block]]` scopes this to
    // non-stacked layouts (no block addon) so the fixed-height rule and the
    // auto-height stacked case are mutually exclusive — they never both
    // match.
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=sm]]:h-8',
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=default]]:h-10',
    'nx:not-has-[>[data-align^=block]]:has-[[data-slot=input-group-control][data-size=lg]]:h-12',
    // The control fills the fixed-height frame without adding height (the
    // compound :has() selector outranks Input's own h-* by specificity).
    // Released in the stacked case, where the control keeps its own height.
    'nx:not-has-[>[data-align^=block]]:[&>input]:h-full',
    // Alignment: addons push the control's padding to make room.
    'nx:has-[>[data-align=inline-start]]:[&>input]:pl-2',
    'nx:has-[>[data-align=inline-end]]:[&>input]:pr-2',
    'nx:has-[>[data-align=block-start]]:flex-col nx:has-[>[data-align=block-start]]:[&>input]:pb-3',
    'nx:has-[>[data-align=block-end]]:flex-col nx:has-[>[data-align=block-end]]:[&>input]:pt-3',
    'nx:data-[disabled=true]:cursor-not-allowed nx:data-[disabled=true]:bg-disabled',
    // Focus: the group shows the ring when the inner control is focused
    // (the control suppresses its own outline).
    'nx:has-[[data-slot=input-group-control]:focus-visible]:outline-default nx:has-[[data-slot=input-group-control]:focus-visible]:outline-focus-default nx:has-[[data-slot=input-group-control]:focus-visible]:border-focus-default',
    // Error: an invalid control reddens the border; an invalid focused
    // control switches the ring to the error colour (matches Input).
    'nx:has-[[data-slot][aria-invalid=true]]:border-error-border',
    'nx:has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:outline-focus-error nx:has-[[data-slot=input-group-control][aria-invalid=true]:focus-visible]:border-focus-error',
  ],
  {
    variants: {
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:not-data-[disabled=true]:hover:bg-container-hover nx:data-[disabled=true]:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:not-data-[disabled=true]:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      variant: 'bordered',
    },
  }
);

export const inputGroupAddonVariants = cva(
  'nx:flex nx:h-auto nx:cursor-text nx:items-center nx:justify-start nx:gap-2 nx:py-1.5 nx:typography-label-default nx:text-muted-foreground nx:select-none nx:group-data-[disabled=true]/input-group:text-disabled-foreground nx:[&>kbd]:rounded-sm nx:[&>svg]:size-4',
  {
    variants: {
      align: {
        'inline-start':
          'nx:order-first nx:pl-3 nx:has-[>button]:-ml-2 nx:has-[>kbd]:-ml-1.5',
        'inline-end':
          'nx:order-last nx:pr-3 nx:has-[>button]:-mr-2 nx:has-[>kbd]:-mr-1.5',
        'block-start': 'nx:order-first nx:w-full nx:px-3 nx:pt-3',
        'block-end': 'nx:order-last nx:w-full nx:px-3 nx:pb-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

export const inputGroupButtonVariants = cva(
  'nx:flex nx:items-center nx:py-0 nx:typography-label-default nx:shadow-none nx:group-data-[disabled=true]/input-group:text-disabled-foreground',
  {
    variants: {
      size: {
        xs: 'nx:h-6 nx:gap-1 nx:rounded-sm nx:px-2 nx:has-[>svg]:px-2 nx:[&>svg]:size-3.5',
        sm: 'nx:h-8 nx:gap-1.5 nx:rounded-md nx:px-2.5 nx:has-[>svg]:px-2.5',
        'icon-xs': 'nx:size-6 nx:rounded-sm nx:p-0 nx:has-[>svg]:p-0',
        'icon-sm': 'nx:size-8 nx:p-0 nx:has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  }
);

export type InputGroupVariants = VariantProps<typeof inputGroupVariants>;
export type InputGroupAddonVariants = VariantProps<
  typeof inputGroupAddonVariants
>;
export type InputGroupButtonVariants = VariantProps<
  typeof inputGroupButtonVariants
>;
