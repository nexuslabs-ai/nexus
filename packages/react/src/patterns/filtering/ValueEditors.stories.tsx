import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  DateExample,
  MultipleChoiceExample,
  NumberExample,
  RangeExample,
  Showcase,
  SingleChoiceExample,
  TextExample,
} from './value-editors';
import recipeSource from './value-editors.tsx?raw';
const meta = {
  title: 'Internal/Filtering/Value editors',
  tags: ['!dev', '!autodocs'],
  component: Showcase,
  decorators: [
    (Story) => (
      <main className="nx:w-full nx:min-w-0 nx:max-w-5xl nx:p-4">
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
          'Working, copyable editor recipes built from Nexus components. Field, operator and value are separate segments. Operator changes apply immediately; number, range, date and text value edits stay drafts until Apply. Empty operators hide the value editor. Applied readouts show committed values; no remote data is queried. Applications own filter values, query evaluation, URL state, dates/timezones and fetching. These recipes are not exported as a filtering engine.',
      },
    },
  },
} satisfies Meta<typeof Showcase>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllVariants: Story = {};
export const SingleChoice: Story = {
  render: () => <SingleChoiceExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: /^is not$/ })
    );
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'is not Active'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: /^is empty$/ })
    );
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'is empty'
    );
    await expect(
      canvas.queryByRole('button', { name: /Edit Status/ })
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: /^is$/ }));
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Active' })
    );
    await expect(
      await canvas.findByRole('button', { name: 'Edit Status: Active' })
    ).toBeVisible();
  },
};
export const MultipleChoices: Story = {
  render: () => <MultipleChoiceExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Teams:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await expect(canvas.getByRole('status')).not.toHaveTextContent(
      'Engineering'
    );
    await expect(page.getByRole('dialog')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Design, Engineering'
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /^Edit Teams:/ })).toHaveFocus()
    );
  },
};
export const NumberComparison: Story = {
  render: () => <NumberExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Amount operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is less than' })
    );
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'is less than 500'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Amount:/ })
    );
    await userEvent.clear(page.getByLabelText('Amount'));
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.type(page.getByLabelText('Amount'), '0');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'is less than 500'
    );
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'is less than 0'
    );
  },
};
export const NumericRange: Story = { render: () => <RangeExample /> };
export const DateRange: Story = {
  render: () => <DateExample today={new Date(2026, 8, 25)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Today' }));
    await expect(page.getByRole('dialog')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-09-25');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
  },
};
export const CustomDateRange: Story = {
  render: () => <DateExample today={new Date(2026, 8, 25)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Created filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add created filter' })
      ).toHaveFocus()
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add created filter' })
    );
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.click(
      page.getByRole('button', { name: /Tuesday, September 8th, 2026/ })
    );
    await userEvent.click(
      page.getByRole('button', { name: /Thursday, September 10th, 2026/ })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('Any date');
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-09-08 – 2026-09-10'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: /^Edit Created:/ })
      ).toHaveFocus()
    );
  },
};
export const TextCondition: Story = {
  render: () => <TextExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByLabelText('Name'));
    await userEvent.type(page.getByLabelText('Name'), 'launch');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await expect(page.getByLabelText('Name')).toHaveValue('design');
    await userEvent.clear(page.getByLabelText('Name'));
    await userEvent.type(page.getByLabelText('Name'), 'launch');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'contains “launch”'
    );
  },
};

export const RemoveAndReAdd: Story = {
  render: () => <TextExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Name filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add name filter' })
      ).toHaveFocus()
    );
    await expect(
      canvas.queryByRole('button', { name: 'Change Name operator' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add name filter' })
    );
    await userEvent.type(page.getByLabelText('Name'), 'unsaved');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add name filter' })
      ).toHaveFocus()
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add name filter' })
    );
    await expect(page.getByLabelText('Name')).toHaveValue('');
    await userEvent.type(page.getByLabelText('Name'), 'launch');
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('launch');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /^Edit Name:/ })).toHaveFocus()
    );
  },
};
export const DatePresetDraft: Story = {
  render: () => <DateExample today={new Date(2026, 9, 2)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Today' }));
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-09-26 – 2026-10-02'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Today' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-10-02 – 2026-10-02'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      '2026-09-26 – 2026-10-02'
    );
  },
};
