import * as React from 'react';

import { useComposedRefs } from '@radix-ui/react-compose-refs';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconArrowDown, IconArrowUp } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { ScrollBar } from '../scroll-area';

/** Slack a scroll position gets before it stops counting as "at the edge". */
const EDGE_THRESHOLD = 24;

interface MessageScrollerContextValue {
  /** The viewport is taller than its content has room for. */
  isScrollable: boolean;
  /** The viewport is resting at the end, so new content should hold it there. */
  isAtEnd: boolean;
  /** The viewport is resting at the start. */
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
 * useMessageScroller
 *
 * Read the stream's scroll state, or drive it, from anywhere inside a
 * `MessageScrollerProvider` — including from a control rendered outside the
 * scroller, such as a send button in a composer bar.
 *
 * @example
 * ```tsx
 * const { isAtEnd, scrollToEnd } = useMessageScroller();
 * ```
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
 * MessageScrollerProviderProps
 *
 * Props for the MessageScrollerProvider component.
 */
interface MessageScrollerProviderProps {
  children?: React.ReactNode;
}

/**
 * MessageScrollerProvider
 *
 * Owns the stream's scroll state. Wrap it around the `MessageScroller` and
 * anything beside it that needs to read or drive that state, such as the
 * composer that jumps to the latest turn on send.
 *
 * @example
 * ```tsx
 * <MessageScrollerProvider>
 *   <MessageScroller>…</MessageScroller>
 *   <Composer />
 * </MessageScrollerProvider>
 * ```
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

    // Open on the newest turn.
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
 * MessageScrollerProps
 *
 * Props for the MessageScroller component.
 */
interface MessageScrollerProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.Root
> {}

/**
 * MessageScroller
 *
 * The scroll container for a message stream. It holds the latest turn in view
 * while the reader is at the end, and stops doing so the moment they scroll up,
 * so appended content never yanks the viewport out from under them.
 *
 * It renders no live region of its own. Announcing new turns belongs to
 * `MessageGroup`'s `announce`, so a stream that opts in is announced once
 * rather than twice.
 *
 * @example
 * ```tsx
 * <MessageScrollerProvider>
 *   <MessageScroller className="nx:h-96">
 *     <MessageScrollerViewport>
 *       <MessageScrollerContent>
 *         {turns.map((turn) => (
 *           <MessageScrollerItem key={turn.id}>
 *             <Message>{turn.body}</Message>
 *           </MessageScrollerItem>
 *         ))}
 *       </MessageScrollerContent>
 *     </MessageScrollerViewport>
 *     <MessageScrollerButton />
 *   </MessageScroller>
 * </MessageScrollerProvider>
 * ```
 */
function MessageScroller({
  className,
  children,
  ...props
}: MessageScrollerProps) {
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
}

/**
 * MessageScrollerViewportProps
 *
 * Props for the MessageScrollerViewport component.
 */
interface MessageScrollerViewportProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.Viewport
> {}

/**
 * MessageScrollerViewport
 *
 * The scrolling region itself. It is focusable so a keyboard user can reach
 * and scroll the transcript even when it holds nothing focusable, and it
 * contains its overscroll so reaching the end does not scroll the page behind
 * it.
 */
function MessageScrollerViewport({
  className,
  ref,
  ...props
}: MessageScrollerViewportProps) {
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
}

/**
 * MessageScrollerContentProps
 *
 * Props for the MessageScrollerContent component.
 */
interface MessageScrollerContentProps extends React.ComponentProps<'div'> {}

/**
 * MessageScrollerContent
 *
 * The column of turns inside the viewport. `min-h-full` keeps a short stream
 * pinned to the top of the viewport instead of floating in the middle.
 */
function MessageScrollerContent({
  className,
  ref,
  ...props
}: MessageScrollerContentProps) {
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
}

/**
 * MessageScrollerItemProps
 *
 * Props for the MessageScrollerItem component.
 */
interface MessageScrollerItemProps extends React.ComponentProps<'div'> {}

/**
 * MessageScrollerItem
 *
 * One entry in the stream. `shrink-0` keeps a turn from being compressed when
 * the column runs out of room, which would otherwise make the measured scroll
 * height disagree with what is on screen.
 */
function MessageScrollerItem({
  className,
  ...props
}: MessageScrollerItemProps) {
  return (
    <div
      data-slot="message-scroller-item"
      className={cn('nx:min-w-0 nx:shrink-0', className)}
      {...props}
    />
  );
}

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
 * MessageScrollerButtonProps
 *
 * Props for the MessageScrollerButton component.
 */
interface MessageScrollerButtonProps
  extends
    Omit<React.ComponentProps<typeof Button>, 'children' | 'asChild'>,
    VariantProps<typeof messageScrollerButtonVariants> {}

/**
 * MessageScrollerButton
 *
 * The return-to-latest affordance. It appears once the reader has scrolled
 * away from the edge it targets. While hidden it is out of the tab order and
 * the accessibility tree, so it is never a stop for a keyboard user who cannot
 * see it.
 *
 * @example
 * ```tsx
 * <MessageScrollerButton />
 * <MessageScrollerButton direction="start" aria-label="Jump to the oldest message" />
 * ```
 */
function MessageScrollerButton({
  className,
  direction = 'end',
  variant = 'outline',
  size = 'icon-sm',
  ...props
}: MessageScrollerButtonProps) {
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
}

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
