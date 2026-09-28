import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  CardFilters,
  FileFiltersExample,
  TableFilters,
} from '../../recipes/filtering/quick-filters';
import recipeSource from '../../recipes/filtering/quick-filters.tsx?raw';
const meta = {
  title: 'Internal/Filtering/Quick filters',
  tags: ['!dev', '!autodocs'],
  component: TableFilters,
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:min-w-0 nx:max-w-3xl nx:p-4">
        <Story />
      </main>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      source: { code: recipeSource, language: 'tsx', type: 'code' },
      description: {
        component:
          'One editable condition anatomy across tables, card grids and file lists. Click the summary to edit; × removes. Simple choices open a direct option menu; selecting applies and closes it. A multi-input size range keeps a draft until Apply; Cancel, Escape and outside dismissal discard it. Removing restores focus to the corresponding Add control. FilterCondition provides the visuals; DropdownMenu and Popover provide focus/dismissal. Applications own values, validation, query logic, URL state, fetching and pagination. These are copyable recipes using local data, not a packaged FilterBar. FilterChip remains removal-only.',
      },
    },
  },
} satisfies Meta<typeof TableFilters>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TableView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Invited' }));
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(canvas.getByRole('cell', { name: 'Maya Chen' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Status: Invited' })
      ).toHaveFocus()
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add status filter' })
      ).toHaveFocus()
    );
  },
};
export const ChoiceKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Status: Active' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(
      page.getByRole('menuitemradio', { name: 'Active' })
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{End}{Enter}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Edit Status: Invited' })
    ).toHaveFocus();
    await expect(canvas.getByRole('cell', { name: 'Maya Chen' })).toBeVisible();
    await userEvent.keyboard('{Enter}{Home}{Enter}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Add status filter' })
    ).toHaveFocus();
  },
};
export const CardGrid: Story = {
  render: () => <CardFilters />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add format filter' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'Document' })
    );
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '1 of 4 templates'
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Format: Document' })
      ).toHaveFocus()
    );
  },
};
export const FileList: Story = {
  render: () => <FileFiltersExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    await userEvent.clear(page.getByLabelText('Maximum'));
    await userEvent.type(page.getByLabelText('Maximum'), '1000');
    await expect(canvas.queryByText('Brand guide.pdf')).not.toBeInTheDocument();
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByText('Brand guide.pdf')).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Size: 100–1000 KB' })
      ).toHaveFocus()
    );
  },
};
export const DraftReset: Story = {
  render: () => <FileFiltersExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Edit Size: 100–500 KB',
    });
    await userEvent.click(trigger);
    await userEvent.clear(page.getByLabelText('Maximum'));
    await userEvent.type(page.getByLabelText('Maximum'), '50');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await userEvent.click(trigger);
    await expect(page.getByLabelText('Maximum')).toHaveValue(500);
    await userEvent.clear(page.getByLabelText('Maximum'));
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('heading', { name: 'Shared files' })
    );
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await userEvent.click(trigger);
    await expect(page.getByLabelText('Maximum')).toHaveValue(500);
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RangeKeyboardAndRemoval: Story = {
  render: () => <FileFiltersExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    await userEvent.clear(page.getByLabelText('Minimum'));
    await userEvent.type(page.getByLabelText('Minimum'), '0');
    await userEvent.clear(page.getByLabelText('Maximum'));
    await userEvent.type(page.getByLabelText('Maximum'), '0');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeEnabled();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('0 of 5 files');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Size: 0–0 KB' })
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Size filter' })
    );
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Add size filter' })
    ).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('3 of 5 files');
  },
};
export const EmptyResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox'), 'Nobody');
    await expect(canvas.getByText(/No matches/)).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));
    await waitFor(() => expect(canvas.getByRole('searchbox')).toHaveFocus());
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '6 of 6 members'
    );
  },
};
export const NarrowContainers: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:max-w-72 nx:gap-10">
      <TableFilters />
      <CardFilters />
      <FileFiltersExample />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const section of within(canvasElement).getAllByRole('region'))
      await expect(section.scrollWidth).toBeLessThanOrEqual(
        section.clientWidth + 1
      );
  },
};
export const AllVariants: Story = {
  render: () => (
    <div className="nx:grid nx:gap-12">
      <TableFilters />
      <CardFilters />
      <FileFiltersExample />
    </div>
  ),
};

export const OperatorChanges: Story = {
  render: () => <TableFilters />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: /^is not$/ })
    );
    await expect(await canvas.findByText('1 of 6 members')).toBeVisible();
    await expect(canvas.getByText('Maya Chen')).toBeVisible();
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: /^is empty$/ })
    );
    await expect(await canvas.findByText('0 of 6 members')).toBeVisible();
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Clear all' })
    );
    await expect(canvas.getByText('6 of 6 members')).toBeVisible();
  },
};

export const ProjectCount: Story = {
  name: 'Table with draft filter',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /^Projects$/ }));
    await userEvent.type(page.getByRole('spinbutton'), '-1');
    await expect(page.getByRole('alert')).toHaveTextContent('whole number');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.clear(page.getByRole('spinbutton'));
    await userEvent.type(page.getByRole('spinbutton'), '3');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2 of 6 members'
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Projects value' })
      ).toHaveFocus()
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '1 of 6 members'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Projects value' })
    );
    await userEvent.clear(page.getByRole('spinbutton'));
    await userEvent.type(page.getByRole('spinbutton'), '9');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Projects value' })
    );
    await expect(page.getByRole('spinbutton')).toHaveValue(3);
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Projects filter' })
    );
    await expect(
      canvas.getByRole('button', { name: /^Projects$/ })
    ).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2 of 6 members'
    );
  },
};
