import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AppliedFilters } from '../../blocks/filtering/applied-filters';
import {
  type ChoiceCondition,
  ChoiceFilter,
} from '../../blocks/filtering/choice-filter/choice-filter';
import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from '../../blocks/filtering/number-range-filter/number-range-filter';
import { Button } from '../../components/button';

function ContractHarness({
  disabled = false,
  empty = false,
  missing = false,
}: {
  disabled?: boolean;
  empty?: boolean;
  missing?: boolean;
}) {
  const [choice, setChoice] = React.useState<ChoiceCondition | null>(
    empty
      ? { operator: 'isEmpty' }
      : { operator: 'is', value: missing ? 'retired-id' : 'active-id' }
  );
  const [range, setRange] = React.useState<NumberRangeCondition | null>({
    operator: 'between',
    min: -10.5,
    max: 12.5,
  });
  return (
    <section
      aria-label="Controlled filters"
      className="nx:grid nx:w-full nx:max-w-xl nx:gap-4"
    >
      <AppliedFilters>
        <ChoiceFilter
          label="Status"
          value={choice}
          onChange={setChoice}
          disabled={disabled}
          options={[
            { value: 'active-id', label: 'Active' },
            { value: 'invited-id', label: 'Invited' },
            { value: 'restricted-id', label: 'Restricted', disabled: true },
          ]}
        />
        <NumberRangeFilter
          label="Temperature"
          unit="°C"
          value={range}
          onChange={setRange}
          disabled={disabled}
        />
      </AppliedFilters>
      <output aria-label="Choice state">{JSON.stringify(choice)}</output>
      <output aria-label="Range state">{JSON.stringify(range)}</output>
      <Button
        onClick={() => {
          setChoice(null);
          setRange(null);
        }}
      >
        External reset
      </Button>
    </section>
  );
}
const meta = {
  title: 'Internal/Filtering/Block contracts',
  component: ContractHarness,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof ContractHarness>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AtomicChoice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Restricted' })
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Invited' }));
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      '"value":"invited-id"'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'is not' })
    );
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      '{"operator":"isNot","value":"invited-id"}'
    );
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Remove Status filter' })
    );
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      'null'
    );
    await expect(
      await canvas.findByRole('button', { name: 'Add status filter' })
    ).toHaveFocus();
  },
};
export const EmptyToChoice: Story = {
  args: { empty: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'is' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Active' })
    ).toBeVisible();
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      '{"operator":"isEmpty"}'
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Change Status operator' })
    ).toHaveFocus();
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      '{"operator":"isEmpty"}'
    );
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'is not' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    );
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      '{"operator":"isNot","value":"invited-id"}'
    );
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
  },
};
export const SignedRangeDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Temperature: -10.5–12.5 °C' })
    );
    const minimum = await page.findByRole('spinbutton', { name: 'Minimum' });
    await userEvent.clear(minimum);
    await userEvent.type(minimum, '-25.5');
    await expect(canvas.getByLabelText('Range state')).toHaveTextContent(
      '"min":-10.5'
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Edit Temperature: -10.5–12.5 °C',
      })
    );
    await expect(
      await page.findByRole('spinbutton', { name: 'Minimum' })
    ).toHaveValue(-10.5);
    await userEvent.clear(page.getByRole('spinbutton', { name: 'Maximum' }));
    await userEvent.type(
      page.getByRole('spinbutton', { name: 'Maximum' }),
      '-20'
    );
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.clear(page.getByRole('spinbutton', { name: 'Minimum' }));
    await userEvent.type(
      page.getByRole('spinbutton', { name: 'Minimum' }),
      '-25.5'
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Range state')).toHaveTextContent(
      '{"operator":"between","min":-25.5,"max":-20}'
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'External reset' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add temperature filter' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Add status filter' })
    ).toBeVisible();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const button of within(
      canvas.getByRole('group', { name: 'Filters' })
    ).getAllByRole('button'))
      await expect(button).toBeDisabled();
  },
};

export const MissingOption: Story = {
  args: { missing: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expect(
      canvas.getByRole('button', { name: 'Edit Status: retired-id' })
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: retired-id' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Active' })
    );
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(canvas.getByLabelText('Choice state')).toHaveTextContent(
      '"value":"active-id"'
    );
  },
};
export const EmptyToRange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Temperature operator' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'is empty' })
    );
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Temperature operator' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'is between' })
    );
    await expect(
      await page.findByRole('spinbutton', { name: 'Minimum' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Change Temperature operator' })
    ).toHaveTextContent('is between');
    await expect(canvas.getByLabelText('Range state')).toHaveTextContent(
      '{"operator":"isEmpty"}'
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Change Temperature operator' })
    ).toHaveFocus();
    await expect(canvas.getByLabelText('Range state')).toHaveTextContent(
      '{"operator":"isEmpty"}'
    );
  },
};
