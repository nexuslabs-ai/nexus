'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

/**
 * Root of the tabs. Holds the active tab, the list and the panels.
 */
const Tabs = TabsPrimitive.Root;

type TabsVariant = 'default' | 'underline';
type TabsSize = 'sm' | 'default' | 'lg';

const TabsListContext = React.createContext<{
  variant: TabsVariant;
  size: TabsSize;
}>({ variant: 'default', size: 'default' });

/**
 * Props for TabsList.
 */
interface TabsListProps extends Omit<
  React.ComponentProps<typeof TabsPrimitive.List>,
  'asChild'
> {
  /**
   * Visual style of every trigger in the list.
   */
  variant?: TabsVariant;
  /**
   * Size of every trigger in the list.
   */
  size?: TabsSize;
}

/**
 * Row of tab triggers.
 */
const TabsList = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<TabsListProps>
>(function TabsList(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ref,
    variant = 'default',
    size = 'default',
    ...props
  }: React.PropsWithoutRef<TabsListProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
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

      const isUnderline = variant === 'underline';
      const isVertical = list.dataset.orientation === 'vertical';
      const isVerticalBar = isUnderline && isVertical;
      const isHorizontalBar = isUnderline && !isVertical;
      const x = isVerticalBar ? 0 : active.offsetLeft;
      const y = isHorizontalBar ? 0 : active.offsetTop;

      indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      indicator.style.width = isVerticalBar ? '' : `${active.offsetWidth}px`;
      indicator.style.height = isHorizontalBar
        ? ''
        : `${active.offsetHeight}px`;
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
      attributeFilter: ['data-state', 'data-orientation'],
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
      data-size={size}
      className={cn(
        'nx:relative nx:isolate nx:inline-flex nx:items-center nx:justify-center',
        'nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        variant === 'default' &&
          'nx:rounded-md nx:bg-control-background nx:p-1',
        className
      )}
      {...props}
    >
      <span
        ref={indicatorRef}
        aria-hidden
        data-slot="tabs-indicator"
        data-variant={variant}
        className={cn(
          'nx:pointer-events-none nx:absolute nx:z-0 nx:opacity-0',
          variant === 'default' &&
            'nx:top-0 nx:left-0 nx:rounded-sm nx:border-default nx:border-border-default nx:bg-background',
          variant === 'underline' && [
            'nx:bg-primary-background',
            'nx:[[data-orientation=horizontal]>&]:bottom-0 nx:[[data-orientation=horizontal]>&]:left-0 nx:[[data-orientation=horizontal]>&]:h-(--nx-borderwidth-thick)',
            'nx:[[data-orientation=vertical]>&]:top-0 nx:[[data-orientation=vertical]>&]:right-0 nx:[[data-orientation=vertical]>&]:w-(--nx-borderwidth-thick)',
          ],
          ready &&
            'nx:transition-[transform,width,height] nx:duration-fast nx:ease-move'
        )}
      />
      <TabsListContext.Provider value={{ variant, size }}>
        {children}
      </TabsListContext.Provider>
    </TabsPrimitive.List>
  );
});

/**
 * CVA configuration for TabsTrigger styling.
 */
const tabsTriggerVariants = cva(
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
      /**
       * Visual style.
       */
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
      /**
       * Size.
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
 * Props for TabsTrigger.
 */
type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

/**
 * Tab button that shows its panel. Takes its style from the TabsList `variant`
 * and `size`.
 */
const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<TabsTriggerProps>
>(function TabsTrigger(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TabsTriggerProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { variant, size } = React.useContext(TabsListContext);

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={variant}
      data-size={size}
      className={cn(tabsTriggerVariants({ variant, size, className }))}
      {...props}
    />
  );
});

/**
 * Props for TabsContent.
 */
type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;

/**
 * Panel for one tab, shown only while that tab is active.
 */
const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<TabsContentProps>
>(function TabsContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<TabsContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
});

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
