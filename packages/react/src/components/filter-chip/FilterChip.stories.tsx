import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AppliedFiltersExample } from '../../recipes/filtering/applied-filters-example';

import { FilterChip } from './filter-chip';

const meta = {
  title: 'Components/FilterChip',
  component: FilterChip,
  args: {
    children: 'Status: Active',
    'aria-label': 'Remove status filter: Active',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'A removal-only button representing an applied filter. Clicking the label or × removes the filter; it does not open an editor or toggle a choice. Supply a full accessible removal label. Consumers own filter values and move focus to the next chip, previous chip, or a stable filter control after removal. Long labels truncate visually but retain their full accessible name. One compact size uses the density-aware h-8 token; change the Storybook density setting to see it adapt. Use it in an applied-filter row when filters are chosen elsewhere, such as a menu or panel. For example: Applied filters: [Status: Paid ×] [Country: India ×]. Use Badge for passive metadata. Use FilterCondition with a Popover when the summary should edit and a separate button should remove.',
      },
    },
  },
} satisfies Meta<typeof FilterChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AppliedFilters: Story = {
  render: () => <AppliedFiltersExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Use this when filters are edited in another control and results need a visible, removable summary. These chips remove conditions; they do not reopen the editor. This example demonstrates filter state only, without fetching invoices.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const paid = canvas.getByRole('button', {
      name: 'Remove status filter: Paid',
    });
    paid.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Remove country filter: India' })
    ).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'any status from India'
    );
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('button', { name: 'Filters' })).toHaveFocus();
    await expect(
      canvas.getByRole('group', { name: 'Applied filters' })
    ).toHaveTextContent('None');
    await userEvent.click(canvas.getByRole('button', { name: 'Filters' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Status: Paid' }));
    await userEvent.keyboard('{Escape}');
    await expect(
      canvas.getByRole('button', { name: 'Remove status filter: Paid' })
    ).toBeVisible();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'paid invoices from all countries'
    );
  },
};
export const Default: Story = {};
export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const WithDataAttributes: Story = {
  render: (args) => <FilterChip {...args} data-testid="applied-filter" />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByTestId('applied-filter')
    ).toHaveAttribute('data-slot', 'filter-chip');
  },
};
export const InForm: Story = {
  render: (args) => (
    <form aria-label="Filter form" onSubmit={(event) => event.preventDefault()}>
      <FilterChip {...args} />
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submit = fn();
    const form = canvas.getByRole('form');
    form.addEventListener('submit', submit);
    try {
      await userEvent.click(canvas.getByRole('button'));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
      await expect(submit).not.toHaveBeenCalled();
    } finally {
      form.removeEventListener('submit', submit);
    }
  },
};
export const LongLabel: Story = {
  args: {
    children: 'Owner: InternationalCustomerExperienceOperations',
    'aria-label':
      'Remove owner filter: InternationalCustomerExperienceOperations',
  },
  render: (args) => (
    <div className="nx:w-full nx:max-w-48">
      <FilterChip {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Remove owner filter: InternationalCustomerExperienceOperations',
    });
    await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(
      button.parentElement!.getBoundingClientRect().width
    );
  },
};
export const AllVariants: Story = {
  render: (args) => (
    <div className="nx:flex nx:max-w-full nx:flex-wrap nx:items-center nx:gap-3">
      <FilterChip {...args} />
      <FilterChip aria-label="Remove country filter: India">
        Country: India
      </FilterChip>
      <FilterChip {...args} disabled />
    </div>
  ),
};
