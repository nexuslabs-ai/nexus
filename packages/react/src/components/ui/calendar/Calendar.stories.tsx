import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Calendar } from './calendar';

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
};

export default meta;
type Story = StoryObj<typeof Calendar>;

// Fixed reference month keeps day-grid layout deterministic across runs.
const REFERENCE_MONTH = new Date(2025, 0, 1);

// Single-date selection — the default mode.
export const Default: Story = {
  render: () => (
    <Calendar
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      selected={new Date(2025, 0, 15)}
    />
  ),
};

// Range selection — the connected rail spans start → middle → end.
export const Range: Story = {
  render: () => (
    <Calendar
      mode="range"
      defaultMonth={REFERENCE_MONTH}
      selected={{ from: new Date(2025, 0, 8), to: new Date(2025, 0, 16) }}
    />
  ),
};

// Multiple discrete dates.
export const Multiple: Story = {
  render: () => (
    <Calendar
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

// Month / year dropdown caption instead of the static label.
export const DropdownCaption: Story = {
  render: () => (
    <Calendar
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
    <Calendar
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      disabled={[new Date(2025, 0, 10), new Date(2025, 0, 11)]}
    />
  ),
};

// Clicking a day selects it (data-selected-single flips true).
export const ClickInteraction: Story = {
  render: () => <Calendar mode="single" defaultMonth={REFERENCE_MONTH} />,
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
  render: () => <Calendar mode="single" defaultMonth={REFERENCE_MONTH} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('15').closest('button')!);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('16').closest('button')).toHaveFocus();
  },
};

// data-slot identifies the root; each day button carries data-day.
export const WithDataAttributes: Story = {
  render: () => <Calendar mode="single" defaultMonth={REFERENCE_MONTH} />,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="calendar"]')
    ).toBeInTheDocument();
    const canvas = within(canvasElement);
    const day15 = canvas.getByText('15').closest('button');
    await expect(day15).toHaveAttribute('data-day');
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
      <Calendar
        mode="single"
        selected={new Date()}
        labels={{ labelNav: () => 'Single date navigation' }}
      />
      <Calendar
        mode="range"
        defaultMonth={REFERENCE_MONTH}
        selected={{ from: new Date(2025, 0, 8), to: new Date(2025, 0, 16) }}
        labels={{ labelNav: () => 'Date range navigation' }}
      />
    </div>
  ),
};
