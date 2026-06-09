import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { IconClock } from '@tabler/icons-react';
import { expect, userEvent, within } from 'storybook/test';

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
      context.parameters.inCard === false ? (
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
      options: ['default', 'large', 'custom'],
      description: 'Visual day-cell size from the Figma variants',
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

// Large date cells mirror Figma's 48px size variant.
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
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(48);
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(48);
  },
};

// Custom date cells support secondary content inside the native day button.
export const CustomDayContent: Story = {
  render: () => (
    <DatePicker
      mode="single"
      cellSize="custom"
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
      renderDayContent={({ date }) => (
        <>
          <span>{date.getDate()}</span>
          <span className="nx:typography-body-xsmall nx:opacity-70">
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
      canvasElement.querySelector('[data-cell-size="custom"]')
    ).toBeInTheDocument();
    await expect(canvas.getByText('$75')).toBeInTheDocument();
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(56);
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(56);
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

    for (const rect of selectedRects) {
      expect(Math.round(rect.width)).toBe(firstWidth);
      expect(Math.round(rect.height)).toBe(firstHeight);
      expect(Math.round(rect.width)).toBeLessThanOrEqual(33);
      expect(Math.round(rect.height)).toBeLessThanOrEqual(33);
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
    await userEvent.click(day10!, { pointerEventsCheck: 0 });
    await expect(day10).not.toHaveAttribute('data-selected-single', 'true');
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
        <CardFooter className="nx:flex-wrap nx:gap-2 nx:border-t nx:border-border-default nx:pt-4">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="nx:flex-1"
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
        <CardFooter className="nx:border-t nx:border-border-default nx:pt-4">
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
    <div className="nx:flex nx:flex-wrap nx:gap-6">
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
