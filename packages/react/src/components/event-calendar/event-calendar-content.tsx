// Title: Event Calendar Content
// Description: Active-view switchboard rendering month, week, day, N-days, or agenda; swappable per view via the components prop.

import type { ComponentType, HTMLAttributes, ReactNode } from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

import {
  useEventCalendarSelector,
  useEventCalendarViewConfig,
} from './event-calendar';
import { EventCalendarAgendaView } from './event-calendar-agenda-view';
import { EventCalendarMonthView } from './event-calendar-month-view';
import { EventCalendarResourceView } from './event-calendar-resource-view';
import {
  EventCalendarDaysView,
  EventCalendarDayView,
  EventCalendarWeekView,
} from './event-calendar-time-grid';
import type { CalendarView } from './event-calendar-types';

const DEFAULT_VIEW_COMPONENTS: Record<CalendarView, ComponentType> = {
  month: EventCalendarMonthView,
  week: EventCalendarWeekView,
  day: EventCalendarDayView,
  days: EventCalendarDaysView,
  agenda: EventCalendarAgendaView,
  resource: EventCalendarResourceView,
};

interface EventCalendarContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Replaces the switchboard entirely; read useEventCalendarView() inside. */
  children?: ReactNode;
  asChild?: boolean;
}

function EventCalendarContent({
  className,
  asChild = false,
  children,
  ...props
}: EventCalendarContentProps) {
  const viewConfig = useEventCalendarViewConfig();
  const view = useEventCalendarSelector((state) => state.view);
  const loading = useEventCalendarSelector((state) => state.loading);

  const ActiveView = DEFAULT_VIEW_COMPONENTS[view];

  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="event-calendar-content"
      data-view={view}
      data-loading={loading || undefined}
      className={cn(
        'nx:relative nx:flex nx:min-h-0 nx:min-w-0 nx:flex-1 nx:flex-col',
        'nx:data-loading:pointer-events-none nx:data-loading:opacity-60',
        viewConfig.classNames?.content,
        className
      )}
      {...props}
    >
      {children ?? <ActiveView />}
    </Comp>
  );
}

export { DEFAULT_VIEW_COMPONENTS, EventCalendarContent };
export type { EventCalendarContentProps };
