import * as React from 'react';

import {
  IconCalendar,
  IconFile,
  IconHash,
  IconLetterCase,
  IconList,
  IconUsers,
} from '@tabler/icons-react';

import { filterOperatorLabels } from '../../components/filter-model';

import { type ChoiceCondition, ChoiceFilter } from './blocks/choice-filter';
import {
  type DateRangeCondition,
  DateRangeFilter,
} from './blocks/date-range-filter';
import {
  type MultiChoiceCondition,
  MultiChoiceFilter,
} from './blocks/multi-choice-filter';
import {
  type NumberComparisonCondition,
  NumberComparisonFilter,
} from './blocks/number-comparison-filter';
import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from './blocks/number-range-filter';
import { type TextCondition, TextFilter } from './blocks/text-filter';

function Example({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="nx:grid nx:min-w-0 nx:items-start nx:gap-4 nx:border-b nx:border-border-default nx:py-5 nx:last:border-b-0 nx:@xl/editors:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
    >
      <div>
        <h2 className="nx:typography-label-default">{title}</h2>
        <p className="nx:mt-1 nx:typography-body-small nx:text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="nx:grid nx:min-w-0 nx:justify-items-start nx:gap-2">
        {children}
      </div>
    </section>
  );
}
function Applied({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="nx:typography-body-small nx:text-muted-foreground"
    >
      Applied: {children}
    </p>
  );
}
export function SingleChoiceExample() {
  const [value, setValue] = React.useState<ChoiceCondition | null>({
    operator: 'is',
    value: 'Active',
  });
  return (
    <Example
      title="Single choice"
      description="A short list with one selected value."
    >
      <ChoiceFilter
        label="Status"
        icon={<IconList aria-hidden="true" />}
        value={value}
        options={['Active', 'Invited', 'Suspended'].map((value) => ({
          value,
          label: value,
        }))}
        onChange={setValue}
      />
      <Applied>
        {value
          ? `${filterOperatorLabels[value.operator]}${'value' in value ? ` ${value.value}` : ''}`
          : 'Any status'}
      </Applied>
    </Example>
  );
}
export function MultipleChoiceExample() {
  const [value, setValue] = React.useState<MultiChoiceCondition | null>({
    operator: 'isAnyOf',
    values: ['Design'],
  });
  return (
    <Example
      title="Multiple choices"
      description="Choose several values, then Apply."
    >
      <MultiChoiceFilter
        label="Teams"
        icon={<IconUsers aria-hidden="true" />}
        value={value}
        onChange={setValue}
        options={['Design', 'Engineering', 'Operations'].map((value) => ({
          value,
          label: value,
        }))}
      />
      <Applied>
        {value
          ? `${filterOperatorLabels[value.operator]}${'values' in value ? ` ${value.values.join(', ')}` : ''}`
          : 'Any team'}
      </Applied>
    </Example>
  );
}
export function NumberExample() {
  const [value, setValue] = React.useState<NumberComparisonCondition | null>({
    operator: 'greaterThan',
    value: 500,
  });
  return (
    <Example
      title="Number comparison"
      description="Enter a number, then Apply."
    >
      <NumberComparisonFilter
        label="Amount"
        icon={<IconHash aria-hidden="true" />}
        value={value}
        onChange={setValue}
        lowerBound={0}
      />
      <Applied>
        {value
          ? `${filterOperatorLabels[value.operator]}${'value' in value ? ` ${value.value}` : ''}`
          : 'Any amount'}
      </Applied>
    </Example>
  );
}
export function RangeExample() {
  const [value, setValue] = React.useState<NumberRangeCondition | null>({
    operator: 'between',
    min: 100,
    max: 500,
  });
  return (
    <Example title="Numeric range" description="A lower and upper limit.">
      <NumberRangeFilter
        label="Size"
        icon={<IconFile aria-hidden="true" />}
        unit="KB"
        lowerBound={0}
        value={value}
        onChange={setValue}
      />
      <Applied>
        {value
          ? `${filterOperatorLabels[value.operator]}${value.operator === 'between' ? ` ${value.min}–${value.max} KB` : ''}`
          : 'Any size'}
      </Applied>
    </Example>
  );
}

export function DateExample({ today }: { today?: Date } = {}) {
  const [value, setValue] = React.useState<DateRangeCondition | null>(() => {
    const to = today ?? new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    return { operator: 'between', from, to };
  });
  return (
    <Example
      title="Date / date range"
      description="Choose dates or a preset, then Apply."
    >
      <DateRangeFilter
        label="Created"
        icon={<IconCalendar aria-hidden="true" />}
        value={value}
        onChange={setValue}
        today={today}
      />
      <Applied>
        {value
          ? `${filterOperatorLabels[value.operator]}${'from' in value ? ` ${value.from.toLocaleDateString()} – ${value.to.toLocaleDateString()}` : ''}`
          : 'Any date'}
      </Applied>
    </Example>
  );
}
export function TextExample() {
  const [value, setValue] = React.useState<TextCondition | null>({
    operator: 'contains',
    value: 'design',
  });
  return (
    <Example
      title="Text condition"
      description="Finish entering text, then Apply."
    >
      <TextFilter
        label="Name"
        icon={<IconLetterCase aria-hidden="true" />}
        value={value}
        onChange={setValue}
      />
      <Applied>
        {value
          ? `${filterOperatorLabels[value.operator]}${'value' in value ? ` “${value.value}”` : ''}`
          : 'Any name'}
      </Applied>
    </Example>
  );
}
export function Showcase() {
  return (
    <div className="nx:@container/editors nx:mx-auto nx:w-full nx:min-w-0 nx:max-w-3xl">
      <header className="nx:mb-3">
        <h2 className="nx:typography-heading-small">Filter editors</h2>
        <p className="nx:mt-1 nx:typography-body-default nx:text-muted-foreground">
          One condition. An editor that fits the value.
        </p>
      </header>
      <div>
        <SingleChoiceExample />
        <MultipleChoiceExample />
        <NumberExample />
        <RangeExample />
        <DateExample />
        <TextExample />
      </div>
    </div>
  );
}
