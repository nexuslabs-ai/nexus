import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import {
  DatePickerPanel,
  type DatePickerPanelPreset,
} from './date-picker-panel';

const REFERENCE_MONTH = new Date(2026, 4, 1);
const REFERENCE_DATE = new Date(2026, 4, 20);
const REFERENCE_END_DATE = new Date(2026, 4, 22);
const REFERENCE_TODAY = new Date(2026, 4, 20);

function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

const PRESETS: DatePickerPanelPreset[] = [
  { label: 'Today', getValue: (today) => ({ startDate: today }) },
  {
    label: 'Tomorrow',
    getValue: (today) => ({ startDate: addDays(today, 1) }),
  },
  {
    label: 'In 3 days',
    getValue: (today) => ({ startDate: addDays(today, 3) }),
  },
  {
    label: 'In a week',
    getValue: (today) => ({ startDate: addDays(today, 7) }),
  },
  {
    label: 'In 2 weeks',
    getValue: (today) => ({ startDate: addDays(today, 14) }),
  },
];

const meta: Meta<typeof DatePickerPanel> = {
  title: 'Components/DatePickerPanel',
  component: DatePickerPanel,
  argTypes: {
    className: { control: false },
    defaultMonth: { control: false },
    defaultValue: { control: false },
    footer: { control: false },
    onValueChange: { control: false },
    presets: { control: false },
    today: { control: false },
    value: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof DatePickerPanel>;

export const Default: Story = {
  render: () => (
    <DatePickerPanel
      defaultMonth={REFERENCE_MONTH}
      today={REFERENCE_TODAY}
      defaultValue={{ startDate: REFERENCE_DATE }}
    />
  ),
};

export const WithEndDate: Story = {
  render: () => (
    <DatePickerPanel
      defaultMonth={REFERENCE_MONTH}
      today={REFERENCE_TODAY}
      defaultValue={{ startDate: REFERENCE_DATE }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('switch', { name: 'End date' }));

    await expect(
      canvas.getByRole('button', { name: 'End date' })
    ).toHaveTextContent('May 20, 2026');
    await expect(
      canvasElement.querySelector('[data-include-end-date="true"]')
    ).toBeInTheDocument();
  },
};

export const WithTimeRange: Story = {
  render: () => (
    <DatePickerPanel
      defaultMonth={REFERENCE_MONTH}
      today={REFERENCE_TODAY}
      defaultValue={{
        startDate: REFERENCE_DATE,
        endDate: REFERENCE_END_DATE,
        includeEndDate: true,
        includeTime: true,
      }}
      footer={
        <div className="nx:flex nx:flex-col nx:gap-1">
          <button
            type="button"
            className="nx:flex nx:min-h-10 nx:w-full nx:items-center nx:justify-between nx:rounded-md nx:px-2 nx:py-2 nx:text-left nx:typography-body-default nx:text-foreground nx:hover:bg-popover-hover"
          >
            <span>Remind</span>
            <span className="nx:text-muted-foreground">At time of event</span>
          </button>
          <button
            type="button"
            className="nx:flex nx:min-h-10 nx:w-full nx:items-center nx:rounded-md nx:px-2 nx:py-2 nx:text-left nx:typography-body-default nx:text-muted-foreground nx:hover:bg-popover-hover"
          >
            Learn about reminders
          </button>
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Start time')).toHaveValue('09:00');
    await expect(canvas.getByLabelText('End time')).toHaveValue('09:00');
    await expect(canvas.getByText('Time format')).toBeInTheDocument();
    await expect(canvas.getByText('Timezone')).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-include-time="true"]')
    ).toBeInTheDocument();
  },
};

export const WithPresets: Story = {
  render: () => (
    <DatePickerPanel
      defaultMonth={REFERENCE_MONTH}
      today={REFERENCE_TODAY}
      presets={PRESETS}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Tomorrow' }));

    await expect(
      canvas.getByRole('button', { name: 'Start date' })
    ).toHaveTextContent('May 21, 2026');
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <DatePickerPanel defaultMonth={REFERENCE_MONTH} today={REFERENCE_TODAY} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="date-picker-panel"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="date-picker-panel-settings"]')
    ).toBeInTheDocument();
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <DatePickerPanel defaultMonth={REFERENCE_MONTH} today={REFERENCE_TODAY} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('15').closest('button')!);

    await expect(
      canvas.getByRole('button', { name: 'Start date' })
    ).toHaveTextContent('May 15, 2026');
    await expect(canvas.getByText('15').closest('button')).toHaveAttribute(
      'data-selected-single',
      'true'
    );
  },
};

export const KeyboardInteraction: Story = {
  render: () => (
    <DatePickerPanel defaultMonth={REFERENCE_MONTH} today={REFERENCE_TODAY} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const startField = canvas.getByRole('button', { name: 'Start date' });

    await userEvent.tab();
    await expect(startField).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(startField).toHaveAttribute('data-active', 'true');
  },
};

export const ClearInteraction: Story = {
  render: () => (
    <DatePickerPanel
      defaultMonth={REFERENCE_MONTH}
      today={REFERENCE_TODAY}
      defaultValue={{
        startDate: REFERENCE_DATE,
        endDate: REFERENCE_END_DATE,
        includeEndDate: true,
        includeTime: true,
        startTime: '10:00',
        endTime: '11:00',
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));

    await expect(
      canvas.getByRole('button', { name: 'Start date' })
    ).toHaveTextContent('Select date');
    await expect(
      canvas.queryByRole('button', { name: 'End date' })
    ).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText('Start time')).not.toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-wrap nx:items-start nx:gap-6">
      <DatePickerPanel
        defaultMonth={REFERENCE_MONTH}
        today={REFERENCE_TODAY}
        defaultValue={{ startDate: REFERENCE_DATE }}
      />
      <DatePickerPanel
        defaultMonth={REFERENCE_MONTH}
        today={REFERENCE_TODAY}
        presets={PRESETS}
        defaultValue={{
          startDate: REFERENCE_DATE,
          endDate: REFERENCE_END_DATE,
          includeEndDate: true,
          includeTime: true,
        }}
      />
    </div>
  ),
};
