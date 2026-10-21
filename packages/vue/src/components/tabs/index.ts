import { cva } from 'class-variance-authority';
import type { InjectionKey } from 'vue';

export {
  default as TabsContent,
  type TabsContentProps,
} from './TabsContent.vue';
export { default as TabsList, type TabsListProps } from './TabsList.vue';
export {
  default as TabsTrigger,
  type TabsTriggerProps,
} from './TabsTrigger.vue';
export { TabsRoot as Tabs, type TabsRootProps as TabsProps } from 'reka-ui';

export type TabsVariant = 'default' | 'underline';
export type TabsSize = 'sm' | 'default' | 'lg';

export const TabsListKey: InjectionKey<{
  variant: TabsVariant;
  size: TabsSize;
}> = Symbol('tabs-list');

export const tabsTriggerVariants = cva(
  // Base classes
  [
    'nx:relative nx:z-1 nx:inline-flex nx:items-center nx:justify-center',
    'nx:whitespace-nowrap nx:bg-transparent',
    'nx:text-muted-foreground',
    'nx:transition-control',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground',
  ],
  {
    variants: {
      /** Visual style. */
      variant: {
        default: [
          'nx:rounded-sm nx:border-default nx:border-transparent',
          'nx:data-[state=inactive]:hover:bg-control-background-hover',
          'nx:data-[state=active]:text-foreground',
        ],
        underline: [
          'nx:rounded-none nx:border-0 nx:border-b-thick nx:border-transparent',
          'nx:data-[orientation=vertical]:border-b-0 nx:data-[orientation=vertical]:border-r-thick',
          'nx:bg-transparent',
          'nx:data-[state=active]:text-foreground',
        ],
      },
      /** Size. */
      size: {
        sm: 'nx:px-2 nx:py-1 nx:typography-label-small',
        default: 'nx:px-3 nx:py-1.5 nx:typography-label-default',
        lg: 'nx:px-4 nx:py-2 nx:typography-label-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
