'use client';

import * as React from 'react';

import { useComposedRefs } from '@radix-ui/react-compose-refs';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconArrowDown, IconArrowUp } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { ScrollBar } from '../scroll-area/scroll-area';

/** Slack a scroll position gets before it stops counting as "at the edge". */
const EDGE_THRESHOLD = 24;

interface MessageScrollerContextValue {
  isScrollable: boolean;
  isAtEnd: boolean;
  isAtStart: boolean;
  scrollToEnd: () => void;
  scrollToStart: () => void;
}

interface MessageScrollerNodesContextValue {
  setViewport: (node: HTMLDivElement | null) => void;
  setContent: (node: HTMLDivElement | null) => void;
}

const MessageScrollerContext =
  React.createContext<MessageScrollerContextValue | null>(null);

const MessageScrollerNodesContext =
  React.createContext<MessageScrollerNodesContextValue | null>(null);

/**
 * Reads or changes the scroll position from anywhere inside a
 * `MessageScrollerProvider`. Works outside the scroller too, such as in a
 * composer's send button.
 */
function useMessageScroller() {
  const context = React.useContext(MessageScrollerContext);

  if (!context) {
    throw new Error(
      'useMessageScroller must be used within a <MessageScrollerProvider />'
    );
  }

  return context;
}

function useMessageScrollerNodes() {
  const context = React.useContext(MessageScrollerNodesContext);

  if (!context) {
    throw new Error(
      'MessageScroller parts must be used within a <MessageScrollerProvider />'
    );
  }

  return context;
}

// Inline, so `reduceMotion`'s `scroll-behavior: auto !important` still wins.
function smoothScrollTo(viewport: HTMLElement, top: number) {
  const previous = viewport.style.scrollBehavior;
  viewport.style.scrollBehavior = 'smooth';
  viewport.scrollTo({ top });
  viewport.style.scrollBehavior = previous;
}

/**
 * Props for the MessageScrollerProvider component.
 */
interface MessageScrollerProviderProps {
  children?: React.ReactNode;
}

/**
 * Holds the scroll state of the stream. Wrap it around the `MessageScroller`
 * and any control that reads or changes the scroll, such as a composer.
 */
function MessageScrollerProvider({ children }: MessageScrollerProviderProps) {
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  const pinnedRef = React.useRef(true);
  // Set while `scrollToStart` animates away from the end, whose first frames
  // are still near enough to the end to re-pin.
  const leavingEndRef = React.useRef(false);

  const [isScrollable, setIsScrollable] = React.useState(false);
  const [isAtEnd, setIsAtEnd] = React.useState(true);
  const [isAtStart, setIsAtStart] = React.useState(true);

  React.useEffect(() => {
    if (!viewport || !content) return;

    let lastScrollTop = 0;

    const isNearEnd = () =>
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <=
      EDGE_THRESHOLD;

    const measure = () => {
      lastScrollTop = viewport.scrollTop;
      setIsAtEnd(isNearEnd());
      setIsAtStart(viewport.scrollTop <= EDGE_THRESHOLD);
      setIsScrollable(viewport.scrollHeight - viewport.clientHeight > 1);
    };

    // A scroll event can be dispatched after content has already grown, so it
    // would measure the old position against the new height. Only an upward
    // move releases the pin; reaching the end restores it, except while
    // `scrollToStart` is still animating away from the end.
    const handleScroll = () => {
      const { scrollTop } = viewport;
      if (scrollTop < lastScrollTop) pinnedRef.current = false;
      if (scrollTop > lastScrollTop || scrollTop === 0) {
        leavingEndRef.current = false;
      }
      if (isNearEnd() && !leavingEndRef.current) pinnedRef.current = true;
      measure();
    };

    const holdEnd = () => {
      if (pinnedRef.current) viewport.scrollTo({ top: viewport.scrollHeight });
      measure();
    };

    const observer = new ResizeObserver(holdEnd);

    pinnedRef.current = true;
    viewport.scrollTo({ top: viewport.scrollHeight });
    measure();
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    observer.observe(content);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [viewport, content]);

  // Pinning first lets the resize observer carry the scroll the rest of the
  // way when content grows mid-animation.
  const scrollToEnd = React.useCallback(() => {
    if (!viewport) return;
    pinnedRef.current = true;
    leavingEndRef.current = false;
    smoothScrollTo(viewport, viewport.scrollHeight);
  }, [viewport]);

  const scrollToStart = React.useCallback(() => {
    // Already at the start, no scroll event would follow to clear the flag.
    if (!viewport || viewport.scrollTop === 0) return;
    pinnedRef.current = false;
    leavingEndRef.current = true;
    smoothScrollTo(viewport, 0);
  }, [viewport]);

  const value = React.useMemo(
    () => ({ isScrollable, isAtEnd, isAtStart, scrollToEnd, scrollToStart }),
    [isScrollable, isAtEnd, isAtStart, scrollToEnd, scrollToStart]
  );

  const nodes = React.useMemo(() => ({ setViewport, setContent }), []);

  return (
    <MessageScrollerContext.Provider value={value}>
      <MessageScrollerNodesContext.Provider value={nodes}>
        {children}
      </MessageScrollerNodesContext.Provider>
    </MessageScrollerContext.Provider>
  );
}

/**
 * Props for the MessageScroller component.
 */
type MessageScrollerProps = React.ComponentProps<
  typeof ScrollAreaPrimitive.Root
>;

/**
 * Scroll container that keeps the latest turn in view until the reader
 * scrolls up. To announce new turns, set `announce` on `MessageGroup`.
 */
const MessageScroller = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MessageScrollerProps>
>(function MessageScroller(propsWithoutRef, forwardedRef) {
  const {
    className,
    children,
    ...props
  }: React.PropsWithoutRef<MessageScrollerProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { isAtStart, isAtEnd } = useMessageScroller();

  return (
    <ScrollAreaPrimitive.Root
      data-slot="message-scroller"
      data-at-start={isAtStart}
      data-at-end={isAtEnd}
      className={cn(
        'nx:relative nx:flex nx:min-h-0 nx:w-full nx:flex-col nx:overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
      <ScrollBar />
      <ScrollAreaPrimitive.Corner data-slot="message-scroller-corner" />
    </ScrollAreaPrimitive.Root>
  );
});

/**
 * Props for the MessageScrollerViewport component.
 */
type MessageScrollerViewportProps = React.ComponentProps<
  typeof ScrollAreaPrimitive.Viewport
>;

/**
 * Scrolling region of the stream, focusable so keyboard users can scroll it.
 * Scrolling past its end does not scroll the page behind it.
 */
const MessageScrollerViewport = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MessageScrollerViewportProps>
>(function MessageScrollerViewport(propsWithoutRef, forwardedRef) {
  const {
    className,
    ref,
    ...props
  }: React.PropsWithoutRef<MessageScrollerViewportProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { isAtStart, isAtEnd } = useMessageScroller();
  const { setViewport } = useMessageScrollerNodes();
  const composedRef = useComposedRefs(ref, setViewport);

  return (
    <ScrollAreaPrimitive.Viewport
      ref={composedRef}
      data-slot="message-scroller-viewport"
      tabIndex={0}
      className={cn(
        'nx:size-full nx:min-h-0 nx:min-w-0 nx:overscroll-contain nx:rounded-[inherit] nx:*:h-full nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        !isAtStart && 'nx:mask-t-from-90%',
        !isAtEnd && 'nx:mask-b-from-90%',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the MessageScrollerContent component.
 */
type MessageScrollerContentProps = React.ComponentProps<'div'>;

/**
 * Column of turns inside the viewport. A short stream starts at the top.
 */
const MessageScrollerContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MessageScrollerContentProps>
>(function MessageScrollerContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    ref,
    ...props
  }: React.PropsWithoutRef<MessageScrollerContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const { setContent } = useMessageScrollerNodes();
  const composedRef = useComposedRefs(ref, setContent);

  return (
    <div
      ref={composedRef}
      data-slot="message-scroller-content"
      className={cn(
        'nx:flex nx:h-max nx:min-h-full nx:flex-col nx:gap-6 nx:p-4',
        className
      )}
      {...props}
    />
  );
});

/**
 * Props for the MessageScrollerItem component.
 */
type MessageScrollerItemProps = React.ComponentProps<'div'>;

/**
 * One entry in the stream. Wrap each turn in one so it never shrinks.
 */
const MessageScrollerItem = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<MessageScrollerItemProps>
>(function MessageScrollerItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<MessageScrollerItemProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="message-scroller-item"
      className={cn('nx:min-w-0 nx:shrink-0', className)}
      {...props}
    />
  );
});

const messageScrollerButtonVariants = cva(
  'nx:absolute nx:inset-x-0 nx:z-sticky nx:mx-auto nx:rounded-full nx:[&_svg]:size-4 nx:data-[active=false]:invisible',
  {
    variants: {
      direction: {
        start: 'nx:top-4',
        end: 'nx:bottom-4',
      },
    },
    defaultVariants: {
      direction: 'end',
    },
  }
);

/**
 * Props for the MessageScrollerButton component.
 */
type MessageScrollerButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'children' | 'asChild'
> &
  VariantProps<typeof messageScrollerButtonVariants>;

/**
 * Button that jumps to the latest turn, or the oldest with `direction="start"`.
 * It appears once the reader scrolls away from that end.
 */
const MessageScrollerButton = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<MessageScrollerButtonProps>
>(function MessageScrollerButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    direction = 'end',
    variant = 'outline',
    size = 'icon-sm',
    ...props
  }: React.PropsWithoutRef<MessageScrollerButtonProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const { isScrollable, isAtEnd, isAtStart, scrollToEnd, scrollToStart } =
    useMessageScroller();

  const isActive =
    isScrollable && (direction === 'end' ? !isAtEnd : !isAtStart);

  const Icon = direction === 'end' ? IconArrowDown : IconArrowUp;

  return (
    <Button
      data-slot="message-scroller-button"
      data-direction={direction}
      data-active={isActive}
      aria-label={
        direction === 'end'
          ? 'Scroll to the latest message'
          : 'Scroll to the oldest message'
      }
      variant={variant}
      size={size}
      onClick={direction === 'end' ? scrollToEnd : scrollToStart}
      className={cn(messageScrollerButtonVariants({ direction }), className)}
      {...props}
    >
      <Icon />
    </Button>
  );
});

export {
  MessageScroller,
  MessageScrollerButton,
  type MessageScrollerButtonProps,
  messageScrollerButtonVariants,
  MessageScrollerContent,
  type MessageScrollerContentProps,
  MessageScrollerItem,
  type MessageScrollerItemProps,
  type MessageScrollerProps,
  MessageScrollerProvider,
  type MessageScrollerProviderProps,
  MessageScrollerViewport,
  type MessageScrollerViewportProps,
  useMessageScroller,
};
