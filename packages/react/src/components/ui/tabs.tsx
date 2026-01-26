import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

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
type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;

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
        'nx:inline-flex nx:h-10 nx:items-center nx:justify-center',
        'nx:rounded-md nx:bg-muted nx:p-1',
        className
      )}
      {...props}
    />
  );
}

/**
 * TabsTriggerProps
 *
 * Props for the TabsTrigger component.
 */
type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

/**
 * TabsTrigger
 *
 * Individual tab button that switches content when clicked.
 *
 * @example
 * ```tsx
 * <TabsTrigger value="account">Account</TabsTrigger>
 * ```
 */
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'nx:inline-flex nx:items-center nx:justify-center',
        'nx:whitespace-nowrap nx:rounded-sm nx:px-3 nx:py-1.5',
        'nx:text-sm nx:font-medium nx:text-foreground',
        'nx:ring-offset-background',
        'nx:transition-all',
        'nx:focus-visible:outline-none nx:focus-visible:ring-2',
        'nx:focus-visible:ring-primary-background/50 nx:focus-visible:ring-offset-2',
        'nx:disabled:pointer-events-none nx:disabled:opacity-50',
        'nx:data-[state=active]:bg-background nx:data-[state=active]:text-foreground',
        'nx:data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  );
}

/**
 * TabsContentProps
 *
 * Props for the TabsContent component.
 */
type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;

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
        'nx:ring-offset-background',
        'nx:focus-visible:outline-none nx:focus-visible:ring-2',
        'nx:focus-visible:ring-primary-background/50 nx:focus-visible:ring-offset-2',
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
};
