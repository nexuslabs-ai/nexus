import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Tabs
 *
 * The root component that manages tab state. Contains the list and content panels.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 * ```
 */
const Tabs = TabsPrimitive.Root;

/**
 * TabsListProps
 *
 * Props for the TabsList component.
 */
interface TabsListProps extends React.ComponentProps<
  typeof TabsPrimitive.List
> {}

/**
 * TabsList
 *
 * Container for tab triggers. Displays tabs in a horizontal row.
 *
 * @example
 * ```tsx
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'nx:inline-flex nx:items-center nx:justify-center',
        'nx:rounded-md nx:bg-muted nx:p-1',
        className
      )}
      {...props}
    />
  );
}

/**
 * TabsTrigger variants
 *
 * CVA configuration for TabsTrigger styling.
 */
const tabsTriggerVariants = cva(
  // Base classes
  [
    'nx:inline-flex nx:items-center nx:justify-center',
    'nx:whitespace-nowrap',
    'nx:font-medium nx:text-foreground/70',
    'nx:transition-all',
    'nx:focus-visible:outline-none nx:focus-visible:shadow-focus-default',
    'nx:disabled:pointer-events-none nx:disabled:opacity-50',
  ],
  {
    variants: {
      /**
       * Visual style variant
       * @default "default"
       */
      variant: {
        default: [
          'nx:rounded-sm',
          'nx:data-[state=active]:bg-background',
          'nx:data-[state=active]:text-foreground',
          'nx:data-[state=active]:shadow-sm',
        ],
        underline: [
          'nx:rounded-none nx:border-b-2 nx:border-transparent',
          'nx:bg-transparent',
          'nx:data-[state=active]:border-primary-background',
          'nx:data-[state=active]:text-foreground',
          'nx:data-[state=active]:shadow-none',
        ],
        outline: [
          'nx:rounded-sm nx:border nx:border-transparent',
          'nx:bg-transparent',
          'nx:hover:bg-muted',
          'nx:data-[state=active]:border-border-default',
          'nx:data-[state=active]:bg-background',
          'nx:data-[state=active]:text-foreground',
        ],
      },
      /**
       * Size variant
       * @default "default"
       */
      size: {
        sm: 'nx:px-2 nx:py-1 nx:text-xs',
        default: 'nx:px-3 nx:py-1.5 nx:text-sm',
        lg: 'nx:px-4 nx:py-2 nx:text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * TabsTriggerProps
 *
 * Props for the TabsTrigger component.
 */
interface TabsTriggerProps
  extends
    React.ComponentProps<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

/**
 * TabsTrigger
 *
 * Individual tab button that switches content when clicked.
 *
 * @example
 * ```tsx
 * <TabsTrigger value="account">Account</TabsTrigger>
 * ```
 *
 * @example
 * ```tsx
 * <TabsTrigger value="account" variant="underline" size="lg">Account</TabsTrigger>
 * ```
 */
function TabsTrigger({ className, variant, size, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant}
      data-size={size}
      className={cn(tabsTriggerVariants({ variant, size, className }))}
      {...props}
    />
  );
}

/**
 * TabsContentProps
 *
 * Props for the TabsContent component.
 */
interface TabsContentProps extends React.ComponentProps<
  typeof TabsPrimitive.Content
> {}

/**
 * TabsContent
 *
 * Container for content associated with a tab.
 * Only visible when its corresponding tab is active.
 *
 * @example
 * ```tsx
 * <TabsContent value="account">
 *   <p>Account settings content</p>
 * </TabsContent>
 * ```
 */
function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'nx:mt-2',
        'nx:focus-visible:outline-none nx:focus-visible:shadow-focus-default',
        className
      )}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsContent,
  type TabsContentProps,
  TabsList,
  type TabsListProps,
  TabsTrigger,
  type TabsTriggerProps,
  tabsTriggerVariants,
};
