import { cva, type VariantProps } from 'class-variance-authority';

export { default as Slider, type SliderProps } from './Slider.vue';

export const sliderVariants =
  'nx:group/slider nx:relative nx:flex nx:w-full nx:touch-none nx:select-none nx:data-disabled:pointer-events-none nx:data-[orientation=horizontal]:h-8 nx:data-[orientation=horizontal]:items-center nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:min-h-44 nx:data-[orientation=vertical]:w-8 nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:justify-center';

export const sliderTrackVariants = cva(
  'nx:relative nx:grow nx:overflow-hidden nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted nx:shadow-xs nx:transition-colors nx:duration-fast nx:data-disabled:border-border-disabled nx:data-disabled:bg-disabled',
  {
    variants: {
      size: {
        standard:
          'nx:p-0.5 nx:data-[orientation=horizontal]:h-4 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-4',
        comfortable:
          'nx:p-0.5 nx:data-[orientation=horizontal]:h-8 nx:data-[orientation=horizontal]:w-full nx:data-[orientation=vertical]:h-full nx:data-[orientation=vertical]:w-8',
      },
    },
    defaultVariants: {
      size: 'standard',
    },
  }
);

export const sliderRangeVariants =
  'nx:absolute nx:bg-control-background nx:bg-clip-content nx:p-0.5 nx:transition-colors nx:duration-fast nx:data-disabled:bg-disabled nx:data-[orientation=horizontal]:top-0 nx:data-[orientation=horizontal]:h-full nx:data-[orientation=vertical]:left-0 nx:data-[orientation=vertical]:w-full';

export const sliderThumbVariants = cva(
  "nx:relative nx:block nx:size-5 nx:shrink-0 nx:bg-transparent nx:before:absolute nx:before:top-1/2 nx:before:left-1/2 nx:before:-translate-x-1/2 nx:before:-translate-y-1/2 nx:before:rounded-sm nx:before:bg-foreground nx:before:content-[''] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:aria-invalid:focus-visible:outline-focus-error nx:data-disabled:before:bg-disabled-foreground",
  {
    variants: {
      orientation: {
        horizontal: 'nx:before:h-5 nx:before:w-0.5',
        vertical: 'nx:before:h-0.5 nx:before:w-5',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

export const sliderMarkerClassName =
  'nx:pointer-events-none nx:absolute nx:z-10 nx:size-1.5 nx:rounded-full nx:bg-muted-foreground-subtle nx:opacity-50 nx:transition-colors nx:duration-fast nx:data-disabled:bg-disabled-foreground nx:data-[orientation=horizontal]:top-1/2 nx:data-[orientation=horizontal]:-translate-x-1/2 nx:data-[orientation=horizontal]:-translate-y-1/2 nx:data-[orientation=vertical]:left-1/2 nx:data-[orientation=vertical]:-translate-x-1/2 nx:data-[orientation=vertical]:translate-y-1/2';

export type SliderTrackVariants = VariantProps<typeof sliderTrackVariants>;
