import * as React from 'react';

import {
  IconCalendar,
  IconFile,
  IconHash,
  IconLetterCase,
  IconList,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { IconCheck } from '@tabler/icons-react';

import { Button } from '../../components/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/command';
import {
  type FilterOperator,
  filterOperatorLabels,
  isValuelessOperator,
} from '../../components/filter-builder';
import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '../../components/filter-condition';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/popover';

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
import { ConditionOperator } from './filter-operator';

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
function Editor({
  icon,
  label,
  summary,
  operator,
  operators,
  onOperatorChange,
  open,
  onOpenChange,
  onRemove,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  summary: string;
  operator: FilterOperator;
  operators: readonly [FilterOperator, ...FilterOperator[]];
  onOperatorChange: (operator: FilterOperator) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const [removed, setRemoved] = React.useState(false);
  const restoreAfterRemove = React.useRef(false);
  const absent = removed && !summary && !isValuelessOperator(operator);
  const focusAdd = React.useCallback((node: HTMLButtonElement | null) => {
    addRef.current = node;
    if (node && restoreAfterRemove.current) {
      restoreAfterRemove.current = false;
      node.focus();
    }
  }, []);
  function remove() {
    restoreAfterRemove.current = true;
    onOpenChange(false);
    onRemove();
    onOperatorChange(operators[0]);
    setRemoved(true);
  }
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {absent ? (
        <PopoverTrigger asChild>
          <Button ref={focusAdd} variant="outline" size="sm">
            Add {label} filter
          </Button>
        </PopoverTrigger>
      ) : (
        <FilterCondition>
          <FilterConditionField>
            {icon}
            {label}
          </FilterConditionField>
          <ConditionOperator
            triggerRef={operatorRef}
            label={label}
            value={operator}
            options={operators}
            onChange={onOperatorChange}
          />
          {!isValuelessOperator(operator) && (
            <PopoverTrigger asChild>
              <FilterConditionSegment
                ref={triggerRef}
                aria-label={`Edit ${label}`}
              >
                {summary || 'Choose…'}
              </FilterConditionSegment>
            </PopoverTrigger>
          )}
          <FilterConditionRemove
            aria-label={`Remove ${label} filter`}
            onClick={remove}
          />
        </FilterCondition>
      )}
      <PopoverContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (absent ? addRef.current : triggerRef.current)?.focus();
        }}
        aria-label={`Filter ${label}`}
        align="start"
        className="nx:w-72 nx:max-w-(--radix-popover-content-available-width) nx:overflow-hidden nx:p-0"
      >
        {children}
      </PopoverContent>
    </Popover>
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
const owners = [
  'Priya Shah',
  'Alex Morgan',
  'Maya Chen',
  'Noor Ahmed',
  'Sam Rivera',
  'Leo Martin',
  'Amara Okafor',
  'Elena Garcia',
];
export function SearchableExample() {
  const [operator, setOperator] = React.useState<FilterOperator>('is');
  const [value, setValue] = React.useState('Priya Shah');
  const [open, setOpen] = React.useState(false);
  function select(value: string) {
    setValue(value);
    setOpen(false);
  }
  return (
    <Example
      title="Searchable choice"
      description="Find a person in a longer list."
    >
      <Editor
        label="Owner"
        icon={<IconUser aria-hidden="true" />}
        operator={operator}
        operators={['is', 'isNot', 'isEmpty', 'isNotEmpty']}
        onOperatorChange={setOperator}
        summary={value}
        open={open}
        onOpenChange={setOpen}
        onRemove={() => setValue('')}
      >
        <Command label="Search owners">
          <CommandInput
            aria-label="Search owners"
            placeholder="Search owners…"
          />
          <CommandList className="nx:max-h-56 nx:p-1">
            <CommandEmpty>No owners found.</CommandEmpty>
            {owners.map((owner) => (
              <CommandItem
                key={owner}
                value={owner}
                onSelect={() => select(owner)}
              >
                {owner}
                {value === owner && (
                  <IconCheck
                    aria-label="Current"
                    className="nx:ml-auto nx:size-4 nx:shrink-0"
                  />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </Editor>
      <Applied>
        {filterOperatorLabels[operator]}
        {!isValuelessOperator(operator) && ` ${value || 'Any owner'}`}
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
      <div className="nx:divide-border-default">
        <SingleChoiceExample />
        <MultipleChoiceExample />
        <SearchableExample />
        <NumberExample />
        <RangeExample />
        <DateExample />
        <TextExample />
      </div>
    </div>
  );
}
