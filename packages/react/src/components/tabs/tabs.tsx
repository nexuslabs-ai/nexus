import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

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
 * TabsList variants
 *
 * CVA configuration for TabsList styling.
 */
const tabsListVariants = cva(
  'nx:relative nx:isolate nx:inline-flex nx:items-center nx:justify-center',
  {
    variants: {
      variant: {
        default: 'nx:rounded-md nx:bg-control-background nx:p-1',
        underline: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TabsVariant = NonNullable<
  VariantProps<typeof tabsListVariants>['variant']
>;

const TabsVariantContext = React.createContext<TabsVariant>('default');

/**
 * TabsListProps
 *
 * Props for the TabsList component.
 */
interface TabsListProps extends Omit<
  React.ComponentProps<typeof TabsPrimitive.List>,
  'asChild'
> {
  /**
   * Visual style variant, shared by every trigger in the list
   * @default "default"
   */
  variant?: TabsVariant;
}

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
 *
 * @example
 * ```tsx
 * <TabsList variant="underline">
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
function TabsList({
  className,
  children,
  ref,
  variant = 'default',
  ...props
}: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const indicatorRef = React.useRef<HTMLSpanElement | null>(null);
  const readyRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;

    if (!list || !indicator) return;

    let raf = 0;

    const measure = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]'
      );

      if (!active) {
        indicator.style.opacity = '0';
        return;
      }

      const height = active.offsetHeight;
      const y =
        variant === 'underline'
          ? active.offsetTop + Math.max(height - 2, 0)
          : active.offsetTop;

      indicator.style.transform = `translate3d(${active.offsetLeft}px, ${y}px, 0)`;
      indicator.style.width = `${active.offsetWidth}px`;
      indicator.style.height = variant === 'underline' ? '2px' : `${height}px`;
      indicator.style.opacity = '1';

      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    // Measure synchronously before paint so the indicator never flashes at opacity-0.
    measure();

    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(list, {
      attributes: true,
      attributeFilter: ['data-state'],
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(list);

    return () => {
      cancelAnimationFrame(raf);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [variant]);

  return (
    <TabsPrimitive.List
      ref={setListRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    >
      <span
        ref={indicatorRef}
        aria-hidden
        data-slot="tabs-indicator"
        data-variant={variant}
        className={cn(
          'nx:pointer-events-none nx:absolute nx:top-0 nx:left-0 nx:z-0 nx:opacity-0',
          'nx:data-[variant=default]:rounded-sm nx:data-[variant=default]:border-default nx:data-[variant=default]:border-border-default nx:data-[variant=default]:bg-background',
          'nx:data-[variant=underline]:bg-primary-background',
          ready &&
            'nx:transition-[transform,width,height] nx:duration-fast nx:ease-move'
        )}
      />
      <TabsVariantContext.Provider value={variant}>
        {children}
      </TabsVariantContext.Provider>
    </TabsPrimitive.List>
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
    'nx:relative nx:z-1 nx:inline-flex nx:items-center nx:justify-center',
    'nx:whitespace-nowrap',
    'nx:text-muted-foreground',
    'nx:transition-control',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground',
  ],
  {
    variants: {
      /**
       * Visual style variant, set by the enclosing TabsList
       * @default "default"
       */
      variant: {
        default: [
          'nx:rounded-sm nx:border-default nx:border-transparent',
          'nx:data-[state=inactive]:hover:bg-control-background-hover',
          'nx:data-[state=active]:text-foreground',
        ],
        underline: [
          'nx:rounded-none nx:border-b-thick nx:border-transparent',
          'nx:bg-transparent',
          'nx:data-[state=active]:text-foreground',
        ],
      },
      /**
       * Size variant
       * @default "default"
       */
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

/**
 * TabsTriggerProps
 *
 * Props for the TabsTrigger component.
 */
interface TabsTriggerProps
  extends
    React.ComponentProps<typeof TabsPrimitive.Trigger>,
    Omit<VariantProps<typeof tabsTriggerVariants>, 'variant'> {}

/**
 * TabsTrigger
 *
 * Individual tab button that switches content when clicked. Takes its
 * variant from the enclosing TabsList.
 *
 * @example
 * ```tsx
 * <TabsTrigger value="account">Account</TabsTrigger>
 * ```
 *
 * @example
 * ```tsx
 * <TabsTrigger value="account" size="lg">Account</TabsTrigger>
 * ```
 */
function TabsTrigger({
  className,
  size = 'default',
  ...props
}: TabsTriggerProps) {
  const variant = React.useContext(TabsVariantContext);

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
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
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
  tabsListVariants,
  TabsTrigger,
  type TabsTriggerProps,
  tabsTriggerVariants,
};
