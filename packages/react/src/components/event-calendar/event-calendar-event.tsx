// Title: Event Calendar Event
// Description: The reusable event chip/bar/block - selection, clicks, drag + resize wiring, and the consumer render slot.

import {
  type ButtonHTMLAttributes,
  createContext,
  type CSSProperties,
  type ReactNode,
  useContext,
} from 'react';

import { Slot } from '@radix-ui/react-slot';
import { IconRepeat } from '@tabler/icons-react';
import { addDays, format } from 'date-fns';

import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  useEventCalendar,
  useEventCalendarSelector,
  useEventCalendarViewConfig,
  useEventCalendarViewContext,
} from './event-calendar';
import {
  markChipPress,
  useEventCalendarGestures,
  wasRecentDrag,
} from './event-calendar-dnd';
import {
  spansMultipleDays,
  toZoned,
  zonedStartOfDay,
} from './event-calendar-lib';
import type {
  EventCalendarOccurrence,
  EventCalendarSegment,
} from './event-calendar-types';

/**
 * Event color presets, sourced from the Nexus categorical chart scale. Each
 * token already carries its own light and dark value, so the chip's alpha
 * tint works on both surfaces without a `dark:` override.
 */
const EVENT_CALENDAR_COLORS: Array<{ name: string; value: string }> = [
  { name: 'Teal', value: 'var(--color-chart-categorical-1)' },
  { name: 'Lime', value: 'var(--color-chart-categorical-2)' },
  { name: 'Orange', value: 'var(--color-chart-categorical-3)' },
  { name: 'Rose', value: 'var(--color-chart-categorical-4)' },
  { name: 'Indigo', value: 'var(--color-chart-categorical-5)' },
];

/**
 * Standardized drag-ghost surface treatment, shared verbatim by every view
 * (month, week/day/N-days, resource). One visual language for interactions:
 * - move: the event is CARRIED FREELY - a cursor-attached full clone (built
 *   by the dnd engine, data-slot=event-calendar-drag-carry) travels with the
 *   pointer; the in-grid ghost is only this faint dashed placeholder marking
 *   the snapped drop slot. The source stays dimmed in place.
 * - resize: the event is STRETCHED - the chip itself at the proposed extent
 *   with a dashed boundary instead of solid (slight indicator, no elevation).
 * - invalid: destructive tint on the placeholder / dashed clone; the engine
 *   adds the not-allowed cursor, a destructive ring on the carry clone, and
 *   a cursor-following validation hint.
 */
const EVENT_CALENDAR_GHOST = {
  move: 'nx:rounded-sm nx:border nx:border-dashed nx:border-(--ec-event-color)/50 nx:bg-(--ec-event-color)/8',
  resize:
    'nx:rounded-sm nx:border nx:border-dashed nx:border-(--ec-event-color)/70 nx:overflow-hidden',
  invalid: 'nx:border-border-error nx:bg-error-subtle',
  invalidResize: 'nx:border-border-error',
  /** Applied to the clone inside an invalid resize ghost. */
  invalidContent: 'nx:opacity-60',
} as const;

/**
 * Fade-out truncation for stacked timed blocks: squeezed cascade columns
 * hard-clip titles into a mash of adjacent glyphs; a right-edge mask fade
 * reads cleaner than an ellipsis at those tiny widths. The mask applies ONLY
 * below a 10rem container width - mask-image forces text off subpixel
 * antialiasing onto a grayscale raster layer, so masking every wide chip
 * makes the whole grid read bolder/blurry and shimmer while the window
 * resizes. Wide chips keep a plain ellipsis. Consumer renderEvent content
 * can import and reuse it.
 */
const EVENT_CALENDAR_FADE_TRUNCATE =
  'nx:w-full nx:truncate nx:@max-[10rem]:text-clip nx:@max-[10rem]:[mask-image:linear-gradient(to_right,#000_calc(100%-0.75rem),transparent)] nx:@max-[10rem]:rtl:[mask-image:linear-gradient(to_left,#000_calc(100%-0.75rem),transparent)]';

interface EventCalendarChipContextValue<TData = unknown> {
  occurrence: EventCalendarOccurrence<TData>;
  segment: EventCalendarSegment<TData>;
  isDragging: boolean;
  isSelected: boolean;
}

const EventCalendarChipContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createContext<EventCalendarChipContextValue<any> | null>(null);

/** The chip's subject; usable inside renderEvent content and chip children. */
function useEventCalendarEventChip<
  TData = unknown,
>(): EventCalendarChipContextValue<TData> {
  const ctx = useContext(EventCalendarChipContext);
  if (!ctx) {
    throw new Error(
      'useEventCalendarEventChip must be used within <EventCalendarEvent>'
    );
  }
  return ctx as EventCalendarChipContextValue<TData>;
}

interface EventCalendarEventProps<TData = unknown> extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  segment: EventCalendarSegment<TData>;
  /** Replaces the default chip CONTENT; the wrapper stays calendar-owned. */
  children?: ReactNode;
  /**
   * Static drag clone: renders the chip exactly as-is but inert - no gestures,
   * resize handles, selection/drag state, focus, or pointer events. Used for
   * the full-fidelity ghost that tracks the proposed slot during a move.
   */
  preview?: boolean;
  asChild?: boolean;
}

/**
 * The one interactive event element used by every view. The wrapper owns
 * positioning hooks, a11y, selection, drag/resize listeners, and data
 * attributes; content comes from children, the root renderEvent override,
 * or the built-in default.
 */
function EventCalendarEvent<TData = unknown>({
  segment,
  className,
  asChild = false,
  children,
  preview = false,
  style,
  onPointerDown,
  onClick,
  onDoubleClick,
  ...props
}: EventCalendarEventProps<TData>) {
  const instance = useEventCalendar<TData>();
  const viewConfig = useEventCalendarViewConfig();
  const { view } = useEventCalendarViewContext();
  const gestures = useEventCalendarGestures<TData>();
  const { settings } = instance;
  const occurrence = segment.occurrence;
  const event = occurrence.event;

  const isSelectedRaw = useEventCalendarSelector<TData, boolean>(
    (state) => state.selection.eventKeys.includes(occurrence.key),
    { calendar: instance }
  );
  const isDraggingRaw = useEventCalendarSelector<TData, boolean>(
    (state) => state.drag?.occurrence.key === occurrence.key,
    { calendar: instance }
  );
  // reactive, unlike gestures.canResize: api.setInteractions({ resize })
  // must add/remove the handles without waiting for an unrelated re-render
  const resizeOn = useEventCalendarSelector<TData, boolean>(
    (state) => state.interactions.resize,
    { calendar: instance }
  );
  // A preview clone must never inherit the source's selected/dragging state
  // (the drag key matches, which would dim the clone itself).
  const isSelected = preview ? false : isSelectedRaw;
  const isDragging = preview ? false : isDraggingRaw;

  const isBar =
    occurrence.allDay || spansMultipleDays(occurrence, settings.timeZone);
  const inTimeGrid =
    view === 'week' || view === 'day' || view === 'days' || view === 'resource';
  const interactive = view !== 'agenda' && !preview;
  const timedBlock = inTimeGrid && !isBar;
  const horizontalBar = isBar && !inTimeGrid;
  // >= compactEventMinutes renders the stacked (title over time) layout;
  // squeezed cascade columns there fade-truncate instead of hard-clipping
  // into neighbors
  const stackedBlock =
    timedBlock &&
    (segment.endMin ?? 0) - (segment.startMin ?? 0) >=
      viewConfig.compactEventMinutes;

  const defaultContent = (
    <>
      {/* leading color dot for single-row chips (month cells, all-day bars);
          time-grid blocks read their color from the tinted surface instead -
          in the stacked layout a dot would sit alone on the first line */}
      {!timedBlock && (
        <span
          aria-hidden
          data-slot="event-calendar-event-dot"
          // -me-0.5 tightens just the dot-to-title gap (the chip keeps gap-1.5
          // between the title and the trailing time)
          className="nx:-me-0.5 nx:size-1.5 nx:shrink-0 nx:rounded-full nx:bg-(--ec-event-color)"
        />
      )}
      {occurrence.isRecurring && (
        <IconRepeat
          className="nx:size-2.5 nx:shrink-0 nx:opacity-70"
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          'nx:typography-label-default',
          stackedBlock ? EVENT_CALENDAR_FADE_TRUNCATE : 'nx:truncate'
        )}
      >
        {event.title}
      </span>
      {/* month cells are narrow: a compact never-shrinking start time keeps
          the title readable; grid views show the full range */}
      {!occurrence.allDay &&
        segment.isStart &&
        (view === 'month' ? (
          <span className="nx:text-muted-foreground nx:shrink-0">
            {format(
              toZoned(occurrence.start, settings.timeZone),
              settings.i18n.formats.eventTime,
              { locale: settings.locale }
            )}
          </span>
        ) : (
          <span
            className={cn(
              'nx:text-muted-foreground nx:hidden nx:@[8rem]:inline',
              stackedBlock ? EVENT_CALENDAR_FADE_TRUNCATE : 'nx:truncate'
            )}
          >
            {settings.i18n.functions.formatEventTime(
              toZoned(occurrence.start, settings.timeZone),
              toZoned(occurrence.end, settings.timeZone),
              occurrence.allDay,
              { locale: settings.locale }
            )}
          </span>
        ))}
    </>
  );

  // Agenda time text is per-day for multi-day events: the first day reads
  // "From 9:00 AM", middle days "All day", the last day "Until 5:00 PM".
  // Boundaries derive from the occurrence vs segment.day (never the packing
  // flags - lane merging rewrites those on shared segment objects).
  const agendaTimeText = (() => {
    if (view !== 'agenda') return '';
    if (occurrence.allDay) return settings.i18n.labels.allDay;
    const dayStart = zonedStartOfDay(segment.day, settings.timeZone);
    const dayEnd = addDays(toZoned(dayStart, settings.timeZone), 1);
    const startsBefore = occurrence.start < dayStart;
    const endsAfter = occurrence.end > dayEnd;
    if (startsBefore && endsAfter) return settings.i18n.labels.allDay;
    if (endsAfter) {
      return settings.i18n.labels.timeFrom(
        format(
          toZoned(occurrence.start, settings.timeZone),
          settings.i18n.formats.eventTime,
          { locale: settings.locale }
        )
      );
    }
    if (startsBefore) {
      return settings.i18n.labels.timeUntil(
        format(
          toZoned(occurrence.end, settings.timeZone),
          settings.i18n.formats.eventTime,
          { locale: settings.locale }
        )
      );
    }
    return settings.i18n.functions.formatEventTime(
      toZoned(occurrence.start, settings.timeZone),
      toZoned(occurrence.end, settings.timeZone),
      false,
      { locale: settings.locale }
    );
  })();

  // Agenda default row: time column, color-dot badge, plain title
  const agendaDefaultContent = (
    <>
      <span className="nx:text-muted-foreground nx:w-40 nx:shrink-0 nx:truncate nx:tabular-nums">
        {agendaTimeText}
      </span>
      <span
        aria-hidden
        data-slot="event-calendar-agenda-dot"
        className="nx:size-2 nx:shrink-0 nx:rounded-full nx:bg-(--ec-event-color)"
      />
      <span className="nx:truncate nx:typography-body-small">
        {event.title}
      </span>
      {occurrence.isRecurring && (
        <IconRepeat
          className="nx:text-muted-foreground nx:size-2.5 nx:shrink-0"
          aria-hidden="true"
        />
      )}
    </>
  );

  const content =
    children ?? (view === 'agenda' ? agendaDefaultContent : defaultContent);

  const timeLabel = settings.i18n.functions.formatEventTime(
    toZoned(occurrence.start, settings.timeZone),
    toZoned(occurrence.end, settings.timeZone),
    occurrence.allDay,
    { locale: settings.locale }
  );
  // native hover tooltip text; a consumer formatter returning undefined
  // drops the title attribute entirely (e.g. when it renders its own tooltip)
  const label = settings.i18n.functions.formatEventLabel
    ? settings.i18n.functions.formatEventLabel(event.title, timeLabel)
    : `${event.title}, ${timeLabel}`;

  // Optional styled tooltip on hover / keyboard focus (viewConfig.eventTooltip,
  // default off). When on, the native title is dropped so the two never stack;
  // a preview clone never gets one. An empty label (i18n opt-out) leaves no
  // content so the tooltip is skipped.
  const tooltipOpts =
    typeof viewConfig.eventTooltip === 'object'
      ? viewConfig.eventTooltip
      : null;
  const tooltipContent = !preview && viewConfig.eventTooltip ? label : null;
  const tooltipOn = Boolean(tooltipContent);

  const showResize =
    interactive && resizeOn && !event.readOnly && event.resizable !== false;
  // Hover grip pill (mirrors the gantt bars): a tiny bar inside each resize
  // handle signals the direction. Shown on every resizable chip - compact
  // sub-compactEventMinutes timed blocks included - because the chip
  // min-height (1.5rem) leaves room at the very top/bottom edges without
  // colliding with the vertically-centered title.
  const grip = (
    <span
      aria-hidden
      data-slot="event-calendar-resize-grip"
      className={cn(
        'nx:bg-muted-foreground nx:rounded-full',
        timedBlock ? 'nx:h-0.5 nx:w-2.5' : 'nx:h-2.5 nx:w-0.5',
        viewConfig.classNames?.resizeGrip
      )}
    />
  );
  const resizeHandles = showResize && (
    <>
      {timedBlock && segment.isStart && (
        <span
          data-slot="event-calendar-resize-handle"
          data-edge="start"
          className={cn(
            'nx:absolute nx:inset-x-1 nx:top-0 nx:flex nx:h-1.5 nx:cursor-ns-resize nx:items-center nx:justify-center nx:opacity-0 nx:transition-opacity nx:duration-150 nx:group-hover/ec-event:opacity-100',
            viewConfig.classNames?.resizeHandle
          )}
          onPointerDown={(e) => gestures.beginResize(e, segment, 'start')}
        >
          {grip}
        </span>
      )}
      {timedBlock && segment.isEnd && (
        <span
          data-slot="event-calendar-resize-handle"
          data-edge="end"
          className={cn(
            'nx:absolute nx:inset-x-1 nx:bottom-0 nx:flex nx:h-1.5 nx:cursor-ns-resize nx:items-center nx:justify-center nx:opacity-0 nx:transition-opacity nx:duration-150 nx:group-hover/ec-event:opacity-100',
            viewConfig.classNames?.resizeHandle
          )}
          onPointerDown={(e) => gestures.beginResize(e, segment, 'end')}
        >
          {grip}
        </span>
      )}
      {(horizontalBar || (isBar && inTimeGrid)) && segment.isStart && (
        <span
          data-slot="event-calendar-resize-handle"
          data-edge="start"
          className={cn(
            'nx:absolute nx:inset-y-0 nx:start-0 nx:flex nx:w-2 nx:cursor-ew-resize nx:items-center nx:justify-center nx:opacity-0 nx:transition-opacity nx:duration-150 nx:group-hover/ec-event:opacity-100',
            viewConfig.classNames?.resizeHandle
          )}
          onPointerDown={(e) => gestures.beginResize(e, segment, 'start')}
        >
          {grip}
        </span>
      )}
      {(horizontalBar || (isBar && inTimeGrid)) && segment.isEnd && (
        <span
          data-slot="event-calendar-resize-handle"
          data-edge="end"
          className={cn(
            'nx:absolute nx:inset-y-0 nx:end-0 nx:flex nx:w-2 nx:cursor-ew-resize nx:items-center nx:justify-center nx:opacity-0 nx:transition-opacity nx:duration-150 nx:group-hover/ec-event:opacity-100',
            viewConfig.classNames?.resizeHandle
          )}
          onPointerDown={(e) => gestures.beginResize(e, segment, 'end')}
        >
          {grip}
        </span>
      )}
    </>
  );

  // Consumer handler first, then the calendar's own: the consumer can still
  // preventDefault to opt out of selection, and neither side loses its listener.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e);
    e.stopPropagation();
    // suppress the trailing slot-create click if this press does not turn
    // into a drag (e.g. a locked chip) - see markChipPress
    markChipPress();
    if (interactive) gestures.beginMove(e, segment);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    e.stopPropagation();
    if (wasRecentDrag()) return;
    // consumer first: e.preventDefault() opts out of built-in selection
    // (e.g. click = open dialog only, no selected tint)
    settings.onEventClick?.(occurrence, e);
    // the agenda is a read-only list: a click never selects/focuses a row
    if (e.defaultPrevented || view === 'agenda') return;
    instance.api.selectEvent(occurrence.key);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onDoubleClick?.(e);
    e.stopPropagation();
    settings.onEventDoubleClick?.(occurrence, e);
  };

  const Comp = asChild ? Slot : 'button';

  const chip = (
    <Comp
      type="button"
      data-slot="event-calendar-event"
      data-view={view}
      data-all-day={occurrence.allDay || undefined}
      data-recurring={occurrence.isRecurring || undefined}
      data-selected={isSelected || undefined}
      data-dragging={isDragging || undefined}
      data-preview={preview || undefined}
      data-past={occurrence.end.getTime() < Date.now() || undefined}
      // native hover reveal for squeezed/faded chips: full title + time
      // (dropped when the styled eventTooltip is on so the two never stack)
      title={preview || tooltipOn ? undefined : label}
      aria-label={
        settings.i18n.functions.formatEventAriaLabel?.(
          event.title,
          timeLabel,
          segment.continuesBefore || segment.continuesAfter
        ) ??
        `${event.title}, ${timeLabel}${
          segment.continuesBefore || segment.continuesAfter
            ? `, ${settings.i18n.labels.continues}`
            : ''
        }`
      }
      // Selection is otherwise conveyed by a background tint alone; the chip is a
      // real toggle in every interactive view, so a screen reader hears the state
      // (agenda rows never select, previews are inert - both stay unpressed).
      aria-pressed={interactive ? isSelected : undefined}
      aria-hidden={preview || undefined}
      tabIndex={preview ? -1 : undefined}
      // merged, not spread: every tint, ring and dot on the chip reads
      // --ec-event-color, so a consumer style prop must not replace it (base
      // gets this for free through mergeProps)
      style={
        {
          '--ec-event-color': event.color ?? 'var(--color-chart-categorical-1)',
          ...style,
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'nx:group/ec-event nx:text-foreground nx:relative nx:flex nx:w-full nx:min-w-0 nx:cursor-pointer nx:touch-none nx:items-center nx:overflow-hidden nx:text-start nx:select-none',
        'nx:outline-none nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-(--focus-offset)',
        preview && 'nx:pointer-events-none',
        view === 'agenda'
          ? // plain list row: color lives in the dot badge, not a tinted pill;
            // hover AND selection surfaces are owned by the agenda row wrapper
            'nx:gap-3 nx:rounded-md nx:typography-body-small'
          : cn(
              // nx:@container removes intrinsic sizing; only grid chips are containers
              // py-1: room above/below inline badges (attendee pill etc.)
              'nx:@container nx:gap-1.5 nx:rounded-sm nx:px-1.5 nx:py-1',
              // soft tint + hairline inset ring: color reads from the surface
              // itself (no accent border), stays legible in light and dark
              'nx:bg-(--ec-event-color)/15 nx:hover:bg-(--ec-event-color)/25',
              'nx:inset-ring nx:inset-ring-(--ec-event-color)/15',
              'nx:transition-[background-color,box-shadow] nx:duration-150',
              'nx:data-dragging:opacity-40',
              'nx:data-selected:bg-(--ec-event-color)/30 nx:data-selected:inset-ring-(--ec-event-color)/40',
              segment.continuesBefore && 'nx:rounded-s-none',
              segment.continuesAfter && 'nx:rounded-e-none'
            ),
        viewConfig.classNames?.event,
        className
      )}
      {...props}
    >
      {content}
      {resizeHandles}
    </Comp>
  );

  return (
    <EventCalendarChipContext.Provider
      value={{ occurrence, segment, isDragging, isSelected }}
    >
      {tooltipOn ? (
        <TooltipProvider delayDuration={tooltipOpts?.delay ?? 600}>
          <Tooltip>
            <TooltipTrigger asChild>{chip}</TooltipTrigger>
            <TooltipContent
              side={tooltipOpts?.side ?? 'top'}
              className={viewConfig.classNames?.eventTooltip}
            >
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        chip
      )}
    </EventCalendarChipContext.Provider>
  );
}

export {
  EVENT_CALENDAR_COLORS,
  EVENT_CALENDAR_FADE_TRUNCATE,
  EVENT_CALENDAR_GHOST,
  EventCalendarEvent,
  useEventCalendarEventChip,
};
export type { EventCalendarChipContextValue, EventCalendarEventProps };
