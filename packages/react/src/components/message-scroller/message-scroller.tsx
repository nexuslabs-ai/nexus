import * as React from 'react';

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
  viewportRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const MessageScrollerContext =
  React.createContext<MessageScrollerContextValue | null>(null);

/**
 * useMessageScroller
 *
 * Read the stream's scroll state, or drive it, from anywhere inside a
 * `MessageScroller` — including from a control rendered outside the viewport,
 * such as a button in a composer bar.
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
      'useMessageScroller must be used within a <MessageScroller />'
    );
  }

  return context;
}

/**
 * Fades the transcript into whichever edge still hides content, so a turn never
 * hard-cuts at the frame or collides with the floating jump button. The
 * WebKit-prefixed declaration carries Chrome and Edge below 120, which only
 * support the unprefixed property from that version.
 */
const edgeFadeClassName =
  'nx:[--edge-fade-start:0px] nx:[--edge-fade-end:0px] nx:group-data-[at-start=false]/message-scroller:[--edge-fade-start:2rem] nx:group-data-[at-end=false]/message-scroller:[--edge-fade-end:2rem] nx:[--edge-fade:linear-gradient(to_bottom,transparent,black_var(--edge-fade-start),black_calc(100%_-_var(--edge-fade-end)),transparent)] nx:[-webkit-mask-image:var(--edge-fade)] nx:[mask-image:var(--edge-fade)]';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
 * <MessageScroller className="nx:h-96">
 *   <MessageScrollerViewport>
 *     <MessageScrollerContent>
 *       {turns.map((turn) => (
 *         <MessageScrollerItem key={turn.id}>
 *           <Message>{turn.body}</Message>
 *         </MessageScrollerItem>
 *       ))}
 *     </MessageScrollerContent>
 *   </MessageScrollerViewport>
 *   <MessageScrollerButton />
 * </MessageScroller>
 * ```
 */
function MessageScroller({
  className,
  children,
  ...props
}: MessageScrollerProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const atEndRef = React.useRef(true);

  const [isScrollable, setIsScrollable] = React.useState(false);
  const [isAtEnd, setIsAtEnd] = React.useState(true);
  const [isAtStart, setIsAtStart] = React.useState(true);

  // Sync with the viewport's scroll geometry — an external system, so an effect
  // is the right tool. One subscription covers both the user scrolling and the
  // content growing underneath them.
  React.useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (!viewport || !content) return;

    const measure = () => {
      const remaining =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      const atEnd = remaining <= EDGE_THRESHOLD;

      atEndRef.current = atEnd;
      setIsAtEnd(atEnd);
      setIsAtStart(viewport.scrollTop <= EDGE_THRESHOLD);
      setIsScrollable(viewport.scrollHeight - viewport.clientHeight > 1);
    };

    // Reading the ref rather than state keeps the pin decision current without
    // resubscribing on every scroll.
    const holdEnd = () => {
      if (atEndRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
      }
      measure();
    };

    const observer = new ResizeObserver(holdEnd);

    // Open on the newest turn. This has to precede the first measure, or the
    // stream reads as scrolled-away on mount and the observer then refuses to
    // hold the end.
    viewport.scrollTop = viewport.scrollHeight;
    measure();
    viewport.addEventListener('scroll', measure, { passive: true });
    observer.observe(content);
    observer.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, []);

  const scrollTo = React.useCallback((top: number) => {
    viewportRef.current?.scrollTo({
      top,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, []);

  const scrollToEnd = React.useCallback(() => {
    scrollTo(viewportRef.current?.scrollHeight ?? 0);
  }, [scrollTo]);

  const scrollToStart = React.useCallback(() => scrollTo(0), [scrollTo]);

  const value = React.useMemo(
    () => ({
      isScrollable,
      isAtEnd,
      isAtStart,
      scrollToEnd,
      scrollToStart,
      viewportRef,
      contentRef,
    }),
    [isScrollable, isAtEnd, isAtStart, scrollToEnd, scrollToStart]
  );

  return (
    <MessageScrollerContext.Provider value={value}>
      <ScrollAreaPrimitive.Root
        data-slot="message-scroller"
        data-at-start={isAtStart}
        data-at-end={isAtEnd}
        className={cn(
          'nx:group/message-scroller nx:relative nx:flex nx:min-h-0 nx:w-full nx:flex-col nx:overflow-hidden',
          className
        )}
        {...props}
      >
        {children}
        <ScrollBar />
        <ScrollAreaPrimitive.Corner data-slot="message-scroller-corner" />
      </ScrollAreaPrimitive.Root>
    </MessageScrollerContext.Provider>
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
  ...props
}: MessageScrollerViewportProps) {
  const { viewportRef } = useMessageScroller();

  return (
    <ScrollAreaPrimitive.Viewport
      ref={viewportRef}
      data-slot="message-scroller-viewport"
      tabIndex={0}
      className={cn(
        'nx:size-full nx:min-h-0 nx:min-w-0 nx:overscroll-contain nx:rounded-[inherit] nx:[&>div]:h-full nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        edgeFadeClassName,
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
  ...props
}: MessageScrollerContentProps) {
  const { contentRef } = useMessageScroller();

  return (
    <div
      ref={contentRef}
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
  'nx:absolute nx:inset-x-0 nx:z-sticky nx:mx-auto nx:rounded-full nx:transition-[opacity,translate] nx:duration-fast nx:ease-enter nx:[&_svg]:size-4 nx:data-[active=false]:pointer-events-none nx:data-[active=false]:opacity-0 nx:motion-reduce:transition-none nx:motion-reduce:data-[active=false]:translate-y-0',
  {
    variants: {
      direction: {
        start: 'nx:top-4 nx:data-[active=false]:-translate-y-1',
        end: 'nx:bottom-4 nx:data-[active=false]:translate-y-1',
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
    Omit<React.ComponentProps<typeof Button>, 'children'>,
    VariantProps<typeof messageScrollerButtonVariants> {}

/**
 * MessageScrollerButton
 *
 * The return-to-latest affordance. It fades in once the reader has scrolled
 * away from the edge it targets, and is inert when it is not showing — out of
 * the tab order and out of the accessibility tree, so it is never a stop for a
 * keyboard user who cannot see it.
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
      aria-hidden={isActive ? undefined : true}
      tabIndex={isActive ? undefined : -1}
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
  MessageScrollerViewport,
  type MessageScrollerViewportProps,
  useMessageScroller,
};
