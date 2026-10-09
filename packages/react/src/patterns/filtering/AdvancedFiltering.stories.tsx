import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { AdvancedFiltering } from './advanced-filters';
import recipeSource from './advanced-filters.tsx?raw';
const meta = {
  title: 'Internal/Filtering/Grouped conditions',
  tags: ['!dev', '!autodocs'],
  component: AdvancedFiltering,
  parameters: {
    layout: 'padded',
    docs: {
      source: { code: recipeSource, language: 'tsx', type: 'code' },
      description: {
        component:
          'A working application recipe using the exported FilterBuilder. Nexus owns field/operator/value editing, All/Any nesting, input validation and keyboard focus. This recipe owns draft versus applied state and filters five local records. Apply commits the whole tree; Cancel restores the applied tree. Incomplete rules never change results. All means AND; Any means OR. The initial rule is Status is Active AND (Team is Design OR Projects is greater than 3). Backend translation, remote options, saved views and URL persistence are application concerns.',
      },
    },
  },
  decorators: [
    (Story) => (
      <main className="nx:mx-auto nx:w-full nx:max-w-3xl nx:p-4">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof AdvancedFiltering>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ApplyAndCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('2 of 5 members')).toBeVisible();
    await expect(canvas.queryByText('Alex Morgan')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Filters match' })
    );
    await userEvent.click(page.getByRole('option', { name: 'Any' }));
    await expect(canvas.getByText('2 of 5 members')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(
      canvas.getByRole('combobox', { name: 'Filters match' })
    ).toHaveTextContent('All');
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Filters match' })
    );
    await userEvent.click(page.getByRole('option', { name: 'Any' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply filters' })
    );
    await expect(canvas.getByText('4 of 5 members')).toBeVisible();
    await expect(canvas.getByText('Alex Morgan')).toBeVisible();
    await expect(canvas.getByText('Noor Ahmed')).toBeVisible();
    await userEvent.clear(
      canvas.getByRole('spinbutton', { name: 'Projects value' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Apply filters' })
    ).toBeDisabled();
    await expect(canvas.getByText('4 of 5 members')).toBeVisible();
  },
};
export const ClearAndEmptyResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Status value' })
    );
    await userEvent.click(page.getByRole('option', { name: 'Suspended' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply filters' })
    );
    await expect(canvas.getByText('No matching members')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear conditions' })
    );
    await expect(canvas.getByText('No matching members')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply filters' })
    );
    await expect(canvas.getByText('5 of 5 members')).toBeVisible();
  },
};
export const NarrowContainer: Story = {
  render: () => (
    <div className="nx:w-full nx:max-w-sm">
      <AdvancedFiltering />
    </div>
  ),
};
