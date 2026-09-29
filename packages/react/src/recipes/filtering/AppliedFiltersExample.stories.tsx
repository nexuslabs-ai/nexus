import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { AppliedFiltersExample } from './applied-filters-example';
import recipeSource from './applied-filters-example.tsx?raw';
const meta = {
  title: 'Internal/Filtering/Applied filter chips',
  tags: ['!dev', '!autodocs'],
  component: AppliedFiltersExample,
  parameters: {
    docs: {
      source: { code: recipeSource, language: 'tsx', type: 'code' },
      description: {
        component:
          'Use this when filters are edited in another control and results need a visible, removable summary. FilterChip removes conditions; it does not reopen the editor. This example demonstrates filter state only, without fetching invoices.',
      },
    },
  },
} satisfies Meta<typeof AppliedFiltersExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const RemoveAndRestore: Story = {
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
