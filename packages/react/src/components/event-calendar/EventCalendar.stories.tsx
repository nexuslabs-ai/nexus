import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { EventCalendar } from './event-calendar';
import { EventCalendarContent } from './event-calendar-content';
import { EventCalendarNav } from './event-calendar-nav';
import type { CalendarEvent } from './event-calendar-types';

// A fixed anchor keeps every story deterministic — the calendar otherwise
// renders around `new Date()`, which would move the grid between runs.
const ANCHOR = new Date(2026, 7, 12, 9, 0, 0);

const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 7, day, hour, minute, 0);

const EVENTS: CalendarEvent[] = [
  {
    id: 'standup',
    title: 'Design standup',
    start: at(12, 9, 30),
    end: at(12, 10),
    color: 'var(--color-chart-categorical-1)',
  },
  {
    id: 'review',
    title: 'Token review',
    start: at(12, 11),
    end: at(12, 12, 30),
    color: 'var(--color-chart-categorical-2)',
  },
  {
    id: 'offsite',
    title: 'Team offsite',
    start: at(13, 0),
    end: at(15, 0),
    allDay: true,
    color: 'var(--color-chart-categorical-3)',
  },
  {
    id: 'retro',
    title: 'Sprint retro',
    start: at(14, 15),
    end: at(14, 16),
    color: 'var(--color-chart-categorical-4)',
  },
];

const meta: Meta<typeof EventCalendar> = {
  title: 'Components/EventCalendar',
  component: EventCalendar,
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="nx:h-[42rem] nx:p-4">
      <EventCalendar {...args}>
        <EventCalendarNav />
        <EventCalendarContent />
      </EventCalendar>
    </div>
  ),
  args: {
    defaultDate: ANCHOR,
    defaultEvents: EVENTS,
  },
};

export default meta;
type Story = StoryObj<typeof EventCalendar>;

export const Month: Story = {
  args: { defaultView: 'month' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid')).toBeInTheDocument();
    await expect(canvas.getAllByText('Design standup').length).toBeGreaterThan(
      0
    );
  },
};

export const Week: Story = {
  args: { defaultView: 'week' },
};

export const Day: Story = {
  args: { defaultView: 'day' },
};

export const Agenda: Story = {
  args: { defaultView: 'agenda' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Design standup').length).toBeGreaterThan(
      0
    );
  },
};

/** Agenda with no events in range exercises the EmptyState substitution. */
export const AgendaEmpty: Story = {
  args: { defaultView: 'agenda', defaultEvents: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelector('[data-slot=event-calendar-no-events]')
    ).toBeInTheDocument();
    await expect(canvas.getByText(/no events/i)).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { defaultView: 'month', loading: true },
};

/** Verifies the Nexus data-attribute hooks survived the port. */
export const WithDataAttributes: Story = {
  args: { defaultView: 'month' },
  play: async ({ canvasElement }) => {
    const content = canvasElement.querySelector(
      '[data-slot=event-calendar-content]'
    );
    await expect(content).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot=event-calendar-month-view]')
    ).toHaveAttribute('data-view', 'month');
  },
};
