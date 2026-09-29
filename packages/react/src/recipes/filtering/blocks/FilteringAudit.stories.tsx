import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { FilterBuilder } from '../../../components/filter-builder';
import { FilterChip } from '../../../components/filter-chip';
import { exampleFields, exampleTree } from '../advanced-fixtures';

import { type ChoiceCondition, ChoiceFilter } from './choice-filter';
import { type DateRangeCondition, DateRangeFilter } from './date-range-filter';
import {
  type MultiChoiceCondition,
  MultiChoiceFilter,
} from './multi-choice-filter';
import {
  type NumberComparisonCondition,
  NumberComparisonFilter,
} from './number-comparison-filter';
import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from './number-range-filter';
import { type TextCondition, TextFilter } from './text-filter';

function Audit({ narrow = false }: { narrow?: boolean }) {
  const [tree, setTree] = React.useState(exampleTree);
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
  return (
    <div className="nx:grid nx:w-full nx:max-w-3xl nx:min-w-0 nx:gap-4">
      <h2 className="nx:typography-heading-small">Filter audit</h2>
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
      />
      <section
        aria-label="Choice contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <ChoiceFilter
          label="Choice"
          value={choice}
          onChange={setChoice}
          options={[
            {
              value: 'active',
              label: 'Design operations and international partnerships',
            },
            { value: 'other', label: 'Engineering' },
            { value: 'restricted', label: 'Restricted', disabled: true },
          ]}
        />
      </section>
      <section
        aria-label="Teams contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <MultiChoiceFilter
          label="Teams"
          value={multi}
          onChange={setMulti}
          options={[
            {
              value: 'active',
              label: 'Design operations and international partnerships',
            },
            { value: 'other', label: 'Engineering' },
            { value: 'restricted', label: 'Restricted', disabled: true },
          ]}
        />
      </section>
      <section
        aria-label="Range contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <NumberRangeFilter label="Range" value={range} onChange={setRange} />
      </section>
      <section
        aria-label="Amount contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <NumberComparisonFilter
          label="Amount"
          value={number}
          onChange={setNumber}
        />
      </section>
      <section
        aria-label="Name contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <TextFilter label="Name" value={text} onChange={setText} />
      </section>
      <section
        aria-label="Created contract"
        className={narrow ? 'nx:w-64 nx:max-w-full nx:min-w-0' : 'nx:min-w-0'}
      >
        <DateRangeFilter label="Created" value={date} onChange={setDate} />
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
