import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import type { Meta, StoryObj } from '@storybook/react';
import { IconClock } from '@tabler/icons-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

import { DatePicker } from './date-picker';

// Fixed reference month keeps day-grid layout deterministic across runs.
const REFERENCE_MONTH = new Date(2025, 0, 1);
const REFERENCE_TODAY = new Date(2025, 0, 15);

function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

// Resolve a spacing token to px from :root so cell-size assertions track the
// active spacing mode instead of hardcoding the default-mode value.
function resolveSpacingPx(canvasElement: HTMLElement, varName: string) {
  const root = canvasElement.ownerDocument.documentElement;
  return Math.round(
    parseFloat(getComputedStyle(root).getPropertyValue(varName))
  );
}

// Inclusive ascending list of dates between two days (order-agnostic).
function daysBetween(a: Date, b: Date) {
  const [start, end] = a <= b ? [a, b] : [b, a];
  const days: Date[] = [];
  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In a week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
];

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  // The grid is a borderless primitive built to sit inside a Card/Popover — it
  // goes transparent via `in-data-[slot=card-content]`, so the Card supplies the
  // surface. WithPresets opts out (`parameters.inCard: false`) with its own Card.
  decorators: [
    (Story, context) =>
      context.parameters?.inCard === false ? (
        <Story />
      ) : (
        <Card className="nx:w-fit">
          <CardContent className="nx:p-0">
            <Story />
          </CardContent>
        </Card>
      ),
  ],
  argTypes: {
    cellSize: {
      control: 'select',
      options: ['default', 'large', 'xlarge'],
      description:
        'Day-cell size preset (default 32px / large 48px / xlarge 56px)',
    },
    captionLayout: {
      control: 'select',
      options: ['label', 'dropdown', 'dropdown-months', 'dropdown-years'],
      description: 'Month caption layout from react-day-picker',
    },
    buttonVariant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'Button variant used for previous / next navigation',
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Show days from the previous / next month in the grid',
    },
    showWeekNumber: {
      control: 'boolean',
      description: 'Show the week-number column',
    },
    fixedWeeks: {
      control: 'boolean',
      description: 'Always render six weeks',
    },
    weekStartsOn: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
      description: 'First day of week (0=Sun … 6=Sat); a `locale` can drive it',
    },
    numberOfMonths: {
      control: 'number',
      description: 'Number of months to render',
    },
    className: { control: false },
    classNames: { control: false },
    components: { control: false },
    defaultMonth: { control: false },
    disabled: { control: false },
    formatters: { control: false },
    labels: { control: false },
    mode: {
      control: false,
      description:
        'Mode is fixed per story because each mode needs a different selected-value shape',
    },
    modifiers: { control: false },
    onSelect: { control: false },
    renderDayContent: {
      control: false,
      description:
        'Function prop; use the CustomDayContent story for the custom-cell variant',
    },
    selected: { control: false },
    styles: { control: false },
    today: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// Playground story for Storybook Controls.
export const Controls: Story = {
  args: {
    mode: 'single',
    defaultMonth: REFERENCE_MONTH,
    selected: new Date(2025, 0, 15),
    today: REFERENCE_TODAY,
    cellSize: 'default',
    captionLayout: 'label',
    buttonVariant: 'ghost',
    showOutsideDays: true,
    showWeekNumber: false,
    fixedWeeks: false,
    numberOfMonths: 1,
  },
};

// Single-date selection — the default mode.
export const Default: Story = {
  render: () => (
    <DatePicker
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
    />
  ),
  play: async ({ canvasElement }) => {
    const currentMonthDay = canvasElement.querySelector<HTMLButtonElement>(
      'button[data-day="2025-01-01"]'
    );
    const outsideMonthDay = canvasElement.querySelector<HTMLButtonElement>(
      'button[data-day="2024-12-29"]'
    );
    const outsideMonthCell = outsideMonthDay?.closest('.rdp-day');

    await expect(currentMonthDay).toBeInTheDocument();
    await expect(outsideMonthDay).toBeInTheDocument();
    await expect(outsideMonthCell).toBeInTheDocument();
    await expect(outsideMonthDay).toHaveAttribute('data-outside', 'true');

    const currentColor = getComputedStyle(currentMonthDay!).color;
    const outsideColor = getComputedStyle(outsideMonthDay!).color;
    const outsideCellColor = getComputedStyle(outsideMonthCell!).color;

    expect(outsideColor).not.toBe(currentColor);
    expect(outsideColor).toBe(outsideCellColor);
  },
};

// Today uses the Figma red inner-circle treatment.
export const Today: Story = {
  render: () => (
    <DatePicker
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      today={REFERENCE_TODAY}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const today = canvas.getByText('15').closest('button');

    await expect(today).toHaveAttribute('data-today', 'true');
    await expect(today).not.toHaveAttribute('data-selected-single', 'true');
  },
};

// Large cells use the `large` preset (spacing-12, 48px under the default mode).
export const LargeCells: Story = {
  render: () => (
    <DatePicker
      mode="single"
      cellSize="large"
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByText('15').closest('button');

    await expect(
      canvasElement.querySelector('[data-cell-size="large"]')
    ).toBeInTheDocument();
    const largeCellPx = resolveSpacingPx(canvasElement, '--nx-spacing-12');
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(
      largeCellPx
    );
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(
      largeCellPx
    );
  },
};

// Secondary content inside the native day button via renderDayContent; the
// `xlarge` preset gives the extra row room.
export const CustomDayContent: Story = {
  render: () => (
    <DatePicker
      mode="single"
      cellSize="xlarge"
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
      renderDayContent={({ date }) => (
        <>
          <span>{date.getDate()}</span>
          <span className="nx:typography-body-small nx:opacity-70">
            ${date.getDate() * 5}
          </span>
        </>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByText('15').closest('button');

    await expect(
      canvasElement.querySelector('[data-cell-size="xlarge"]')
    ).toBeInTheDocument();
    await expect(canvas.getByText('$75')).toBeInTheDocument();
    const xlargeCellPx = resolveSpacingPx(canvasElement, '--nx-spacing-14');
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(
      xlargeCellPx
    );
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(
      xlargeCellPx
    );
  },
};

// Range selection — the connected rail spans start → middle → end.
export const Range: Story = {
  render: () => (
    <DatePicker
      mode="range"
      defaultMonth={REFERENCE_MONTH}
      selected={{ from: new Date(2025, 0, 8), to: new Date(2025, 0, 16) }}
    />
  ),
};

// Range hover-preview: while a range is half-selected, hovering paints a
// tentative rail (the `preview` modifier) from the start to the hovered day.
export const RangeHoverPreview: Story = {
  parameters: { inCard: false },
  render: function RangeHoverPreviewStory() {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(2025, 0, 8),
      to: undefined,
    });
    const [hovered, setHovered] = React.useState<Date | undefined>();

    // Tentative span from the committed start to the hovered day, minus the
    // start itself (it already shows as the committed endpoint).
    const preview =
      range?.from && !range.to && hovered
        ? daysBetween(range.from, hovered).filter(
            (d) => d.getTime() !== range.from!.getTime()
          )
        : [];

    return (
      <Card className="nx:w-fit">
        <CardContent className="nx:p-0">
          <DatePicker
            mode="range"
            defaultMonth={REFERENCE_MONTH}
            selected={range}
            onSelect={setRange}
            modifiers={{ preview }}
            onDayMouseEnter={(day) => setHovered(day)}
            onDayMouseLeave={() => setHovered(undefined)}
          />
        </CardContent>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByText('11').closest('button')!);

    // Day 10 sits between the committed start (8) and the hovered day (11),
    // so its cell should carry the preview rail.
    const cell = canvas.getByText('10').closest('td');
    await waitFor(() =>
      expect(getComputedStyle(cell!).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)'
      )
    );
  },
};

// Multiple discrete dates.
export const Multiple: Story = {
  render: () => (
    <DatePicker
      mode="multiple"
      defaultMonth={REFERENCE_MONTH}
      selected={[
        new Date(2025, 0, 6),
        new Date(2025, 0, 13),
        new Date(2025, 0, 20),
      ]}
    />
  ),
};

// Adjacent multiple dates remain discrete fixed-size selections, not a range rail.
export const MultipleAdjacent: Story = {
  render: () => (
    <DatePicker
      mode="multiple"
      defaultMonth={REFERENCE_MONTH}
      selected={[
        new Date(2025, 0, 15),
        new Date(2025, 0, 16),
        new Date(2025, 0, 17),
        new Date(2025, 0, 20),
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectedDays = ['15', '16', '17'].map((day) =>
      canvas.getByText(day).closest('button')
    );

    for (const day of selectedDays) {
      await expect(day).toHaveAttribute('data-selected-single', 'true');
    }

    const selectedRects = selectedDays.map((day) =>
      day!.getBoundingClientRect()
    );
    const firstWidth = Math.round(selectedRects[0]!.width);
    const firstHeight = Math.round(selectedRects[0]!.height);
    const defaultCell = resolveSpacingPx(canvasElement, '--nx-spacing-8');

    for (const rect of selectedRects) {
      expect(Math.round(rect.width)).toBe(firstWidth);
      expect(Math.round(rect.height)).toBe(firstHeight);
      expect(Math.round(rect.width)).toBeLessThanOrEqual(defaultCell);
      expect(Math.round(rect.height)).toBeLessThanOrEqual(defaultCell);
    }
  },
};

// Month / year dropdown caption instead of the static label.
export const DropdownCaption: Story = {
  render: () => (
    <DatePicker
      mode="single"
      captionLayout="dropdown"
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
    />
  ),
};

// Specific days disabled — dimmed and non-interactive.
export const DisabledDays: Story = {
  render: () => (
    <DatePicker
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      disabled={[new Date(2025, 0, 10), new Date(2025, 0, 11)]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day10 = canvas.getByText('10').closest('button');

    await expect(day10).toBeDisabled();
    // A disabled day recolors via a semantic disabled-text token at full
    // opacity (not a fade).
    await expect(day10).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(day10!).opacity).toBe('1');
    await userEvent.click(day10!, { pointerEventsCheck: 0 });
    await expect(day10).not.toHaveAttribute('data-selected-single', 'true');
  },
};

// Unavailable (booked / blackout) days — struck through, distinct from plain
// disabled. `unavailable` styles the cell; pair it with `disabled` to also block
// selection (Spectrum's unavailable-vs-disabled distinction).
export const UnavailableDays: Story = {
  render: () => {
    const booked = [new Date(2025, 0, 20), new Date(2025, 0, 21)];
    return (
      <DatePicker
        mode="single"
        defaultMonth={REFERENCE_MONTH}
        selected={new Date(2025, 0, 15)}
        disabled={booked}
        modifiers={{ unavailable: booked }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cell = canvas.getByText('20').closest('td');

    await expect(cell).toBeInTheDocument();
    expect(getComputedStyle(cell!).textDecorationLine).toContain(
      'line-through'
    );
  },
};

// First day of week — Monday-first (matches the Figma reference). Pass a date-fns
// `locale` instead to derive both the first day and weekday names per region.
// (Weekday label format itself is locale/formatter-driven and out of scope here.)
export const WeekStartsMonday: Story = {
  render: () => (
    <DatePicker
      mode="single"
      weekStartsOn={1}
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
    />
  ),
  play: async ({ canvasElement }) => {
    const weekdays = canvasElement.querySelectorAll('.rdp-weekday');

    // Monday-first → the first weekday header is "Mo", last is "Su".
    await expect(weekdays[0]).toHaveTextContent('Mo');
    await expect(weekdays[6]).toHaveTextContent('Su');
  },
};

// Week numbers exercise the dedicated week-number typography path.
export const WeekNumbers: Story = {
  render: () => (
    <DatePicker
      mode="single"
      showWeekNumber
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
    />
  ),
};

// Clicking a day selects it (data-selected-single flips true).
export const ClickInteraction: Story = {
  render: () => <DatePicker mode="single" defaultMonth={REFERENCE_MONTH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('15').closest('button')!);
    await expect(canvas.getByText('15').closest('button')).toHaveAttribute(
      'data-selected-single',
      'true'
    );
  },
};

// Arrow keys move the roving focus across the day grid.
export const KeyboardInteraction: Story = {
  render: () => <DatePicker mode="single" defaultMonth={REFERENCE_MONTH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('15').closest('button')!);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('16').closest('button')).toHaveFocus();
  },
};

// data-slot identifies the root; each day button carries data-day.
export const WithDataAttributes: Story = {
  render: () => <DatePicker mode="single" defaultMonth={REFERENCE_MONTH} />,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="date-picker"]')
    ).toBeInTheDocument();
    const canvas = within(canvasElement);
    const day15 = canvas.getByText('15').closest('button');
    await expect(day15).toHaveAttribute('data-day');
    // #498: day cells + weekday headers use the typography-body-default composite
    // (migrated from the raw named text-size utility); both share the same 14px/400 type.
    await expect(day15).toHaveClass('nx:typography-body-default');
    await expect(canvasElement.querySelector('.rdp-weekday')).toHaveClass(
      'nx:typography-body-default'
    );
  },
};

// Accessibility: react-day-picker labels each day with its full date plus
// "Today" / "selected" status, and renders `footer` in an aria-live region so the
// current selection is announced (additive to rdp's month-change announcement).
export const Accessibility: Story = {
  parameters: { inCard: false },
  render: function AccessibilityStory() {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(2025, 0, 15)
    );

    return (
      <Card className="nx:w-fit">
        <CardContent className="nx:p-0">
          <DatePicker
            mode="single"
            selected={date}
            onSelect={setDate}
            today={new Date(2025, 0, 8)}
            defaultMonth={REFERENCE_MONTH}
            footer={
              date
                ? `Selected ${date.toLocaleDateString()}`
                : 'No date selected'
            }
          />
        </CardContent>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectedLabel =
      canvas.getByText('15').closest('button')!.getAttribute('aria-label') ??
      '';
    const todayLabel =
      canvas.getByText('8').closest('button')!.getAttribute('aria-label') ?? '';

    // Full date + status come from react-day-picker's labelDayButton.
    expect(selectedLabel).toContain('January 15th, 2025');
    expect(selectedLabel).toContain('selected');
    expect(todayLabel).toContain('Today');

    // `footer` is announced via rdp's aria-live status region.
    const footer = canvas.getByText(/Selected/);
    await expect(footer).toHaveAttribute('aria-live', 'polite');
  },
};

// Calendar in a Card with quick-preset buttons (shadcn's CalendarWithPresets
// pattern). The grid goes transparent inside CardContent via its
// `in-data-[slot=card-content]` hook, so the Card supplies the surface.
export const WithPresets: Story = {
  parameters: { inCard: false },
  render: function WithPresetsStory() {
    const [date, setDate] = React.useState<Date | undefined>(REFERENCE_TODAY);
    const [month, setMonth] = React.useState<Date>(REFERENCE_MONTH);

    const applyPreset = (days: number) => {
      const next = addDays(REFERENCE_TODAY, days);
      setDate(next);
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    };

    return (
      <Card className="nx:w-fit">
        <CardContent className="nx:p-0">
          <DatePicker
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            fixedWeeks
          />
        </CardContent>
        <CardFooter className="nx:grid nx:grid-cols-2 nx:gap-2 nx:border-t nx:border-border-default nx:p-4 nx:[&>*:last-child]:col-span-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </CardFooter>
      </Card>
    );
  },
};

// Calendar in a Card with start/end time inputs in the footer (shadcn's
// CalendarWithTime). The time fields use Field + InputGroup with a trailing
// clock addon; the consumer supplies the icon (here from @tabler/icons-react).
export const WithTime: Story = {
  parameters: { inCard: false },
  render: function WithTimeStory() {
    const [date, setDate] = React.useState<Date | undefined>(
      new Date(2025, 0, 12)
    );

    return (
      <Card className="nx:w-fit">
        <CardContent className="nx:p-0">
          <DatePicker
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={REFERENCE_MONTH}
          />
        </CardContent>
        <CardFooter className="nx:border-t nx:border-border-default nx:p-4">
          <FieldGroup className="nx:gap-4">
            <Field>
              <FieldLabel htmlFor="time-from">Start Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="time-from"
                  type="time"
                  step="1"
                  defaultValue="10:30:00"
                  className="nx:appearance-none nx:[&::-webkit-calendar-picker-indicator]:hidden"
                />
                <InputGroupAddon align="inline-end">
                  <IconClock />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="time-to">End Time</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="time-to"
                  type="time"
                  step="1"
                  defaultValue="12:30:00"
                  className="nx:appearance-none nx:[&::-webkit-calendar-picker-indicator]:hidden"
                />
                <InputGroupAddon align="inline-end">
                  <IconClock />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
        </CardFooter>
      </Card>
    );
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// Single (today border + a selected day) beside a range (the connected rail).
// Reused by the per-base variant generator across 5 bases × 2 themes.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:gap-2">
      <DatePicker
        mode="single"
        defaultMonth={REFERENCE_MONTH}
        today={new Date(2025, 0, 8)}
        selected={new Date(2025, 0, 15)}
        labels={{ labelNav: () => 'Single date navigation' }}
      />
      <DatePicker
        mode="range"
        defaultMonth={REFERENCE_MONTH}
        selected={{ from: new Date(2025, 0, 8), to: new Date(2025, 0, 16) }}
        labels={{ labelNav: () => 'Date range navigation' }}
      />
    </div>
  ),
};
