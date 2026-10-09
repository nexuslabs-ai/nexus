import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  type ChoiceCondition,
  ChoiceFilter,
} from '../../blocks/choice-filter/choice-filter';
import {
  type DateRangeCondition,
  DateRangeFilter,
} from '../../blocks/date-range-filter/date-range-filter';
import {
  type MultiChoiceCondition,
  MultiChoiceFilter,
} from '../../blocks/multi-choice-filter/multi-choice-filter';
import {
  type NumberComparisonCondition,
  NumberComparisonFilter,
} from '../../blocks/number-comparison-filter/number-comparison-filter';
import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from '../../blocks/number-range-filter/number-range-filter';
import {
  type TextCondition,
  TextFilter,
} from '../../blocks/text-filter/text-filter';
import { Button } from '../../components/button';
import { FilterBuilder } from '../../components/filter-builder';
import { FilterChip } from '../../components/filter-chip';

import { exampleFields, exampleTree } from './advanced-fixtures';

function Audit({ narrow = false }: { narrow?: boolean }) {
  const [tree, setTree] = React.useState(exampleTree);
  const [disabled, setDisabled] = React.useState(false);
  const [choice, setChoice] = React.useState<ChoiceCondition | null>({
    operator: 'is',
    value: 'active',
  });
  const [multi, setMulti] = React.useState<MultiChoiceCondition | null>({
    operator: 'isAnyOf',
    values: ['active'],
  });
  const [range, setRange] = React.useState<NumberRangeCondition | null>({
    operator: 'between',
    min: 1,
    max: 10,
  });
  const [number, setNumber] = React.useState<NumberComparisonCondition | null>({
    operator: 'greaterThan',
    value: 5,
  });
  const [text, setText] = React.useState<TextCondition | null>({
    operator: 'contains',
    value: 'Design operations workspace',
  });
  const [date, setDate] = React.useState<DateRangeCondition | null>({
    operator: 'between',
    from: new Date(2026, 8, 1),
    to: new Date(2026, 8, 20),
  });
  function reset() {
    setChoice(null);
    setMulti(null);
    setRange(null);
    setNumber(null);
    setText(null);
    setDate(null);
  }
  return (
    <div className="nx:grid nx:w-full nx:max-w-3xl nx:min-w-0 nx:gap-4">
      <h2 className="nx:typography-heading-small">Filter audit</h2>
      <div className="nx:flex nx:gap-2">
        <Button onClick={reset}>External reset</Button>
        <Button onClick={() => setDisabled(!disabled)}>Toggle disabled</Button>
      </div>
      <FilterChip
        className="nx:justify-self-start"
        aria-label="Remove summary"
        onClick={() => setChoice(null)}
      >
        Status: Active
      </FilterChip>
      <FilterBuilder
        value={tree}
        fields={exampleFields}
        onValueChange={setTree}
        disabled={disabled}
      />
      <section
        aria-label="Choice contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <ChoiceFilter
          label="Choice"
          value={choice}
          onChange={setChoice}
          disabled={disabled}
          options={[
            {
              value: 'active',
              label: 'Design operations and international partnerships',
            },
            { value: 'other', label: 'Engineering' },
            { value: 'restricted', label: 'Restricted', disabled: true },
          ]}
        />
        <output aria-label="Choice state" className="nx:sr-only">
          {JSON.stringify(choice)}
        </output>
      </section>
      <section
        aria-label="Teams contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <MultiChoiceFilter
          label="Teams"
          value={multi}
          onChange={setMulti}
          disabled={disabled}
          options={[
            {
              value: 'active',
              label: 'Design operations and international partnerships',
            },
            { value: 'other', label: 'Engineering' },
            { value: 'restricted', label: 'Restricted', disabled: true },
          ]}
        />
        <output aria-label="Teams state" className="nx:sr-only">
          {JSON.stringify(multi)}
        </output>
      </section>
      <section
        aria-label="Range contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <NumberRangeFilter
          label="Range"
          value={range}
          onChange={setRange}
          disabled={disabled}
        />
        <output aria-label="Range state" className="nx:sr-only">
          {JSON.stringify(range)}
        </output>
      </section>
      <section
        aria-label="Amount contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <NumberComparisonFilter
          label="Amount"
          value={number}
          onChange={setNumber}
          disabled={disabled}
        />
        <output aria-label="Amount state" className="nx:sr-only">
          {JSON.stringify(number)}
        </output>
      </section>
      <section
        aria-label="Name contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <TextFilter
          label="Name"
          value={text}
          onChange={setText}
          disabled={disabled}
        />
        <output aria-label="Name state" className="nx:sr-only">
          {JSON.stringify(text)}
        </output>
      </section>
      <section
        aria-label="Created contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <DateRangeFilter
          label="Created"
          value={date}
          onChange={setDate}
          disabled={disabled}
        />
        <output aria-label="Created state" className="nx:sr-only">
          {JSON.stringify(date)}
        </output>
      </section>
    </div>
  );
}
async function checkDensity({ canvasElement }: { canvasElement: HTMLElement }) {
  const root = canvasElement.ownerDocument.documentElement;
  const height = parseFloat(
    getComputedStyle(root).getPropertyValue('--nx-spacing-8')
  );
  for (const control of canvasElement.querySelectorAll(
    '[data-slot="filter-condition-segment"], [data-slot="filter-condition-remove"], [data-slot="filter-chip"], [data-slot="filter-rule-editor"] button[role="combobox"], [data-slot="filter-rule-editor"] input'
  )) {
    await expect(control.getBoundingClientRect().height).toBe(height);
  }
}
const meta = {
  title: 'Internal/Filtering/Audit',
  component: Audit,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof Audit>;
export default meta;
type Story = StoryObj<typeof meta>;
function ParentFormAudit() {
  const [submissions, setSubmissions] = React.useState(0);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmissions((count) => count + 1);
  }
  return (
    <form aria-label="Search form" onSubmit={submit}>
      <Audit />
      <Button type="submit">Submit search</Button>
      <output aria-label="Parent submissions">{submissions}</output>
    </form>
  );
}
export const ParentFormSubmission: Story = {
  render: () => <ParentFormAudit />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    for (const label of ['Teams', 'Range', 'Amount', 'Name', 'Created']) {
      await userEvent.click(
        within(
          canvas.getByRole('region', { name: `${label} contract` })
        ).getByRole('button', { name: /^Edit/ })
      );
      await userEvent.click(page.getByRole('button', { name: 'Apply' }));
      await waitFor(() =>
        expect(page.queryByRole('dialog')).not.toBeInTheDocument()
      );
      await expect(
        canvas.getByLabelText('Parent submissions')
      ).toHaveTextContent('0');
    }
    await userEvent.click(
      within(canvas.getByRole('region', { name: 'Name contract' })).getByRole(
        'button',
        { name: /^Edit/ }
      )
    );
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'Updated{Enter}'
    );
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    await expect(canvas.getByLabelText('Name state')).toHaveTextContent(
      'Updated'
    );
    await expect(canvas.getByLabelText('Parent submissions')).toHaveTextContent(
      '0'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Submit search' })
    );
    await expect(canvas.getByLabelText('Parent submissions')).toHaveTextContent(
      '1'
    );
  },
};
export const ExternalReset: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvas.getByRole('region', { name: 'Name contract' })).getByRole(
        'button',
        { name: /^Edit/ }
      )
    );
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'Uncommitted'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'External reset' })
    );
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    for (const label of [
      'Choice',
      'Teams',
      'Range',
      'Amount',
      'Name',
      'Created',
    ]) {
      await expect(canvas.getByLabelText(`${label} state`)).toHaveTextContent(
        'null'
      );
    }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add name filter' })
    );
    await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    await userEvent.keyboard('{Escape}');
  },
};
export const DisabledWhileOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvas.getByRole('region', { name: 'Teams contract' })).getByRole(
        'button',
        { name: /^Edit/ }
      )
    );
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle disabled' })
    );
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument()
    );
    for (const label of [
      'Choice',
      'Teams',
      'Range',
      'Amount',
      'Name',
      'Created',
    ]) {
      for (const button of within(
        canvas.getByRole('region', { name: `${label} contract` })
      ).getAllByRole('button'))
        await expect(button).toBeDisabled();
    }
    await expect(canvas.getByLabelText('Teams state')).not.toHaveTextContent(
      'other'
    );
  },
};
export const NarrowLongContent: Story = {
  args: { narrow: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const label of [
      'Choice',
      'Teams',
      'Range',
      'Amount',
      'Name',
      'Created',
    ]) {
      const region = canvas.getByRole('region', { name: `${label} contract` });
      await expect(region.scrollWidth).toBeLessThanOrEqual(
        region.clientWidth + 1
      );
      const remove = within(region).getByRole('button', { name: /^Remove/ });
      await expect(remove.getBoundingClientRect().right).toBeLessThanOrEqual(
        region.getBoundingClientRect().right + 1
      );
    }
  },
};
export const Tight: Story = {
  play: checkDensity,
  globals: { density: 'tight', corners: 'square' },
  args: { narrow: true },
};
export const Compact: Story = {
  play: checkDensity,
  globals: { density: 'compact', corners: 'subtle' },
};
export const Default: Story = {
  play: checkDensity,
  globals: { density: 'default', corners: 'subtle' },
};
export const Comfortable: Story = {
  play: checkDensity,
  globals: { density: 'comfortable', corners: 'round' },
};
export const Relaxed: Story = {
  play: checkDensity,
  globals: { density: 'relaxed', corners: 'round' },
};
export const Spacious: Story = {
  play: checkDensity,
  globals: { density: 'spacious', corners: 'square' },
  args: { narrow: true },
};

export const DismissalAcrossEditors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    for (const label of [
      'Choice',
      'Teams',
      'Range',
      'Amount',
      'Name',
      'Created',
    ]) {
      const region = within(
        canvas.getByRole('region', { name: `${label} contract` })
      );
      const before = canvas.getByLabelText(`${label} state`).textContent ?? '';
      await userEvent.click(region.getByRole('button', { name: /^Edit/ }));
      if (label === 'Teams')
        await userEvent.click(
          page.getByRole('checkbox', { name: 'Engineering' })
        );
      if (label === 'Created')
        await userEvent.click(page.getByRole('button', { name: 'Today' }));
      if (label === 'Name') {
        await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
        await userEvent.type(
          page.getByRole('textbox', { name: 'Name' }),
          'Uncommitted'
        );
      }
      if (label === 'Range' || label === 'Amount') {
        const input = page.getByRole('spinbutton', {
          name: label === 'Range' ? 'Minimum' : 'Amount',
        });
        await userEvent.clear(input);
        await userEvent.type(input, '99');
      }
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(region.getByRole('button', { name: /^Edit/ })).toHaveFocus()
      );
      await expect(canvas.getByLabelText(`${label} state`)).toHaveTextContent(
        before
      );
      // Choice uses a modal menu; Escape above verifies its dismissal.
      if (label === 'Choice') continue;
      await userEvent.click(region.getByRole('button', { name: /^Edit/ }));
      await userEvent.click(
        canvas.getByRole('heading', { name: 'Filter audit' })
      );
      await waitFor(() =>
        expect(page.queryByRole('dialog')).not.toBeInTheDocument()
      );
      await expect(canvas.getByLabelText(`${label} state`)).toHaveTextContent(
        before
      );
    }
  },
};
export const SmoothCorners: Story = {
  globals: { density: 'default', corners: 'smooth' },
  play: checkDensity,
};
export const ExtraRoundCorners: Story = {
  globals: { density: 'default', corners: 'extra-round' },
  play: checkDensity,
};
export const Dark: Story = {
  globals: { mode: 'dark', density: 'default', corners: 'subtle' },
  play: checkDensity,
};
