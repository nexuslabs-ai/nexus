import * as React from 'react';

import {
  IconCalendar,
  IconHash,
  IconLetterCase,
  IconList,
  IconPlus,
} from '@tabler/icons-react';

import { IconChevronDown, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { ChoiceRow } from '../choice-row';
import { Input } from '../input';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

import {
  emptyFilterValue,
  type FilterField,
  type FilterGroup,
  type FilterOperator,
  filterOperatorLabels,
  type FilterOption,
  type FilterRule,
  getFilterErrors,
  getFilterOperators,
  isValuelessOperator,
} from './filter-model';

const fieldIcons: Record<FilterField['type'], React.ReactNode> = {
  text: (
    <IconLetterCase
      aria-hidden="true"
      className="nx:size-3.5 nx:shrink-0 nx:text-muted-foreground"
    />
  ),
  number: (
    <IconHash
      aria-hidden="true"
      className="nx:size-3.5 nx:shrink-0 nx:text-muted-foreground"
    />
  ),
  date: (
    <IconCalendar
      aria-hidden="true"
      className="nx:size-3.5 nx:shrink-0 nx:text-muted-foreground"
    />
  ),
  choice: (
    <IconList
      aria-hidden="true"
      className="nx:size-3.5 nx:shrink-0 nx:text-muted-foreground"
    />
  ),
};

interface PickerProps {
  className?: string;
  leading?: React.ReactNode;
  label: string;
  value: string;
  options: readonly FilterOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  triggerRef?: React.Ref<HTMLButtonElement>;
}
function Picker({
  label,
  value,
  options,
  onValueChange,
  disabled,
  invalid,
  describedBy,
  triggerRef,
  className,
  leading,
}: PickerProps) {
  const available = options.some((option) => option.value === value);
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        ref={triggerRef}
        aria-label={label}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(
          'nx:h-(--nx-spacing-8) nx:w-auto nx:min-w-0 nx:max-w-full nx:px-2.5 nx:[&>span]:flex-1 nx:[&>span]:text-left',
          className
        )}
      >
        {leading}
        <SelectValue placeholder="Choose…">
          {!available && value ? 'Unavailable selection' : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="nx:max-w-(--radix-select-content-available-width)">
        {options
          .filter((option) => option.value !== '')
          .map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
function MultipleValues({
  field,
  value,
  onValueChange,
  disabled,
  invalid,
  describedBy,
}: {
  field: Extract<FilterField, { type: 'choice' }>;
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const id = React.useId();
  const [search, setSearch] = React.useState('');
  const options = field.options.filter((option) =>
    option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );
  function toggle(option: string) {
    onValueChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option]
    );
  }
  const summary = value
    .map(
      (item) =>
        field.options.find((option) => option.value === item)?.label ?? item
    )
    .join(', ');
  return (
    <Popover onOpenChange={() => setSearch('')}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          aria-label={`${field.label} values`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="nx:h-(--nx-spacing-8) nx:w-full nx:min-w-0 nx:justify-between"
        >
          <span className="nx:truncate">{summary || 'Choose values…'}</span>
          <IconChevronDown aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={`${field.label} values`}
        className="nx:w-64 nx:max-w-(--radix-popover-content-available-width) nx:overflow-hidden nx:p-0"
      >
        <div className="nx:border-b nx:border-border-default nx:p-2">
          <Input
            size="sm"
            aria-label={`Search ${field.label} options`}
            placeholder="Search options…"
            value={search}
            disabled={disabled}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="nx:max-h-48 nx:overflow-y-auto nx:p-1">
          {options.map((option, index) => (
            <ChoiceRow key={option.value} htmlFor={`${id}-${index}`}>
              <Checkbox
                id={`${id}-${index}`}
                checked={value.includes(option.value)}
                disabled={disabled}
                onCheckedChange={() => toggle(option.value)}
              />
              <span className="nx:min-w-0 nx:break-words">{option.label}</span>
            </ChoiceRow>
          ))}
          {!options.length && (
            <p className="nx:p-2 nx:typography-body-small nx:text-muted-foreground">
              No options found.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
function RuleValue({
  field,
  rule,
  onValueChange,
  disabled,
  errorId,
  invalid,
}: {
  field: FilterField;
  rule: FilterRule;
  onValueChange: (value: string | string[]) => void;
  disabled?: boolean;
  errorId?: string;
  invalid: boolean;
}) {
  if (isValuelessOperator(rule.operator))
    return (
      <span className="nx:self-center nx:typography-body-small nx:text-muted-foreground">
        No value needed
      </span>
    );
  if (field.type === 'choice') {
    if (rule.operator === 'isAnyOf' || rule.operator === 'isNoneOf')
      return (
        <MultipleValues
          field={field}
          value={Array.isArray(rule.value) ? rule.value : []}
          onValueChange={onValueChange}
          disabled={disabled}
          invalid={invalid}
          describedBy={errorId}
        />
      );
    return (
      <Picker
        className="nx:w-full nx:bg-container"
        label={`${field.label} value`}
        options={field.options}
        value={typeof rule.value === 'string' ? rule.value : ''}
        onValueChange={onValueChange}
        disabled={disabled}
        invalid={invalid}
        describedBy={errorId}
      />
    );
  }
  const type = field.type === 'text' ? 'text' : field.type;
  if (rule.operator === 'between') {
    const values = Array.isArray(rule.value) ? rule.value : ['', ''];
    function changeStart(event: React.ChangeEvent<HTMLInputElement>) {
      onValueChange([event.target.value, values[1] ?? '']);
    }
    function changeEnd(event: React.ChangeEvent<HTMLInputElement>) {
      onValueChange([values[0] ?? '', event.target.value]);
    }
    return (
      <div className="nx:flex nx:min-w-0 nx:max-w-full nx:flex-wrap nx:items-center nx:gap-2 nx:@lg/rule:flex-nowrap nx:@lg/rule:gap-0 nx:@lg/rule:[&>input]:flex-1 nx:@lg/rule:[&>input:first-child]:rounded-e-none">
        <Input
          size="sm"
          type={type}
          step={type === 'number' ? 'any' : undefined}
          aria-label={`${field.label} start`}
          placeholder="From"
          value={values[0] ?? ''}
          onChange={changeStart}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={errorId}
          className="nx:min-w-0 nx:w-36 nx:max-w-full nx:typography-body-default nx:h-(--nx-spacing-8)"
        />
        <Input
          size="sm"
          type={type}
          step={type === 'number' ? 'any' : undefined}
          aria-label={`${field.label} end`}
          placeholder="To"
          value={values[1] ?? ''}
          onChange={changeEnd}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={errorId}
          className="nx:min-w-0 nx:w-36 nx:max-w-full nx:typography-body-default nx:h-(--nx-spacing-8)"
        />
      </div>
    );
  }
  return (
    <Input
      size="sm"
      type={type}
      step={type === 'number' ? 'any' : undefined}
      aria-label={`${field.label} value`}
      placeholder={type === 'date' ? undefined : 'Enter a value…'}
      value={typeof rule.value === 'string' ? rule.value : ''}
      onChange={(event) => onValueChange(event.target.value)}
      disabled={disabled}
      aria-invalid={invalid}
      aria-describedby={errorId}
      className="nx:min-w-0 nx:w-full nx:max-w-full nx:bg-container nx:typography-body-default nx:h-(--nx-spacing-8)"
    />
  );
}
interface RuleEditorProps {
  value: FilterRule;
  fields: readonly FilterField[];
  onValueChange: (value: FilterRule) => void;
  onRemove: () => void;
  disabled?: boolean;
  error?: string;
  focusRef?: React.Ref<HTMLButtonElement>;
}
/** Edits one controlled condition; numeric and date operands remain draft strings. */
function FilterRuleEditor({
  value,
  fields,
  onValueChange,
  onRemove,
  disabled,
  error,
  focusRef,
}: RuleEditorProps) {
  const errorId = React.useId();
  const field = fields.find((item) => item.id === value.field);
  const operators = field ? getFilterOperators(field) : [];
  function changeField(fieldId: string) {
    const nextField = fields.find((item) => item.id === fieldId);
    if (!nextField) return;
    const operator = getFilterOperators(nextField)[0];
    if (!operator) return;
    onValueChange({
      ...value,
      field: fieldId,
      operator,
      value: emptyFilterValue(operator),
    });
  }
  function changeOperator(next: string) {
    const operator = next as FilterOperator;
    const empty = emptyFilterValue(operator);
    const previousEmpty = emptyFilterValue(value.operator);
    const sameShape =
      Array.isArray(empty) === Array.isArray(previousEmpty) &&
      (!Array.isArray(empty) || empty.length === previousEmpty.length);
    const keepValue =
      sameShape &&
      !isValuelessOperator(operator) &&
      !isValuelessOperator(value.operator);
    onValueChange({
      ...value,
      operator,
      value: keepValue ? value.value : empty,
    });
  }
  return (
    <div
      data-slot="filter-rule-editor"
      className="nx:@container/rule nx:min-w-0"
    >
      <div className="nx:flex nx:min-w-0 nx:items-start nx:gap-1">
        <div className="nx:grid nx:min-w-0 nx:flex-1 nx:grid-cols-1 nx:gap-1.5 nx:@sm/rule:grid-cols-2 nx:@lg/rule:gap-0 nx:@lg/rule:grid-cols-[minmax(0,1fr)_max-content_minmax(0,1.3fr)] nx:[&_button:focus-visible]:relative nx:[&_button:focus-visible]:z-10 nx:[&_input:focus-visible]:relative nx:[&_input:focus-visible]:z-10">
          <Picker
            className="nx:w-full nx:bg-container nx:@lg/rule:rounded-e-none"
            leading={field ? fieldIcons[field.type] : undefined}
            label="Field"
            value={value.field}
            options={fields
              .filter((item) => getFilterOperators(item).length)
              .map((item) => ({ value: item.id, label: item.label }))}
            onValueChange={changeField}
            disabled={disabled}
            triggerRef={focusRef}
            invalid={!field}
            describedBy={error ? errorId : undefined}
          />
          <Picker
            className={cn(
              'nx:w-full nx:@lg/rule:rounded-s-none nx:@lg/rule:border-s-0',
              !isValuelessOperator(value.operator) &&
                'nx:@lg/rule:rounded-e-none'
            )}
            label={`${field?.label ?? 'Condition'} operator`}
            value={value.operator}
            options={operators.map((operator) => ({
              value: operator,
              label: filterOperatorLabels[operator],
            }))}
            onValueChange={changeOperator}
            disabled={disabled || !field}
            invalid={!operators.includes(value.operator)}
            describedBy={error ? errorId : undefined}
          />
          {field && (
            <div className="nx:min-w-0 nx:@sm/rule:col-span-2 nx:@lg/rule:col-span-1 nx:@lg/rule:[&_input]:rounded-s-none nx:@lg/rule:[&_input]:border-s-0 nx:@lg/rule:[&_button]:rounded-s-none nx:@lg/rule:[&_button]:border-s-0">
              <RuleValue
                field={field}
                rule={value}
                onValueChange={(next) =>
                  onValueChange({ ...value, value: next })
                }
                disabled={disabled}
                errorId={error ? errorId : undefined}
                invalid={!!error}
              />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="nx:size-(--nx-spacing-8) nx:shrink-0 nx:text-muted-foreground"
          aria-label={`Remove ${field?.label ?? 'unavailable'} condition`}
          disabled={disabled}
          onClick={onRemove}
        >
          <IconX aria-hidden="true" />
        </Button>
      </div>
      {error && (
        <p
          id={errorId}
          className="nx:mt-1 nx:typography-body-small nx:text-error-subtle-foreground"
        >
          {error}
        </p>
      )}
    </div>
  );
}
interface GroupEditorProps {
  value: FilterGroup;
  fields: readonly FilterField[];
  onValueChange: (value: FilterGroup) => void;
  onRemove?: () => void;
  disabled?: boolean;
  depth: number;
  maxDepth: number;
  errors: ReturnType<typeof getFilterErrors>;
  label: string;
}
function GroupEditor({
  value,
  fields,
  onValueChange,
  onRemove,
  disabled,
  depth,
  maxDepth,
  errors,
  label,
}: GroupEditorProps) {
  const addRef = React.useRef<HTMLButtonElement>(null);
  const focusId = React.useRef<string | null>(null);
  const firstField = fields.find((field) => getFilterOperators(field).length);
  const groupError = errors.find((error) => error.id === value.id)?.message;
  function newRule(): FilterRule {
    const operator = firstField
      ? (getFilterOperators(firstField)[0] ?? 'is')
      : 'is';
    return {
      kind: 'rule',
      id: crypto.randomUUID(),
      field: firstField?.id ?? '',
      operator,
      value: emptyFilterValue(operator),
    };
  }
  function addRule() {
    const rule = newRule();
    focusId.current = rule.id;
    onValueChange({ ...value, children: [...value.children, rule] });
  }
  function addGroup() {
    const group: FilterGroup = {
      kind: 'group',
      id: crypto.randomUUID(),
      conjunction: 'any',
      children: [newRule()],
    };
    focusId.current = group.id;
    onValueChange({ ...value, children: [...value.children, group] });
  }
  function replace(next: FilterGroup | FilterRule) {
    onValueChange({
      ...value,
      children: value.children.map((child) =>
        child.id === next.id ? next : child
      ),
    });
  }
  function remove(id: string) {
    onValueChange({
      ...value,
      children: value.children.filter((child) => child.id !== id),
    });
    addRef.current?.focus();
  }
  function focusNewGroup(node: HTMLDivElement | null) {
    if (!node || focusId.current !== node.dataset.nodeId) return;
    node.querySelector<HTMLButtonElement>('button[role="combobox"]')?.focus();
    focusId.current = null;
  }
  return (
    <div
      data-slot="filter-group"
      role="group"
      aria-label={label}
      className={cn(
        'nx:min-w-0',
        depth > 0 &&
          'nx:rounded-md nx:border-default nx:border-border-default nx:bg-control-background/20 nx:p-3'
      )}
    >
      <div className="nx:mb-3 nx:flex nx:items-center nx:gap-2">
        <div className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-wrap nx:items-center nx:gap-2">
          <span className="nx:shrink-0 nx:@2xl/builder:w-12 nx:typography-body-default nx:text-muted-foreground">
            Match
          </span>
          <div className="nx:shrink-0">
            <Picker
              className="nx:bg-container"
              label={`${label} match`}
              value={value.conjunction}
              options={[
                { value: 'all', label: 'All' },
                { value: 'any', label: 'Any' },
              ]}
              onValueChange={(next) =>
                onValueChange({ ...value, conjunction: next as 'all' | 'any' })
              }
              disabled={disabled}
            />
          </div>
          <span className="nx:typography-body-default nx:text-muted-foreground">
            conditions
          </span>
        </div>
        {onRemove && (
          <Button
            className="nx:size-(--nx-spacing-8) nx:shrink-0 nx:text-muted-foreground"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${label}`}
            onClick={onRemove}
            disabled={disabled}
          >
            <IconX aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="nx:grid nx:gap-2">
        {value.children.map((child, index) => (
          <div
            key={child.id}
            data-node-id={child.id}
            ref={focusNewGroup}
            className="nx:flex nx:min-w-0 nx:items-start nx:gap-2"
          >
            <span
              aria-hidden="true"
              className="nx:hidden nx:h-(--nx-spacing-8) nx:w-12 nx:shrink-0 nx:@2xl/builder:flex nx:items-center nx:typography-body-default nx:text-muted-foreground"
            >
              {index === 0
                ? 'Where'
                : value.conjunction === 'all'
                  ? 'And'
                  : 'Or'}
            </span>
            <div className="nx:min-w-0 nx:flex-1">
              {child.kind === 'group' ? (
                <GroupEditor
                  value={child}
                  fields={fields}
                  onValueChange={replace}
                  onRemove={() => remove(child.id)}
                  disabled={disabled}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  errors={errors}
                  label={`${label} group ${index + 1}`}
                />
              ) : (
                <FilterRuleEditor
                  value={child}
                  fields={fields}
                  onValueChange={replace}
                  onRemove={() => remove(child.id)}
                  disabled={disabled}
                  error={errors.find((error) => error.id === child.id)?.message}
                  focusRef={(node) => {
                    if (node && focusId.current === child.id) {
                      node.focus();
                      focusId.current = null;
                    }
                  }}
                />
              )}
            </div>
          </div>
        ))}
        {!value.children.length && (
          <p className="nx:py-2 nx:typography-body-small nx:text-muted-foreground">
            {depth === 0
              ? 'No conditions. All results are included.'
              : 'Add a condition to this group.'}
          </p>
        )}
      </div>
      {groupError && (
        <p className="nx:mt-2 nx:typography-body-small nx:text-error-subtle-foreground">
          {groupError}
        </p>
      )}
      <div className="nx:mt-3 nx:flex nx:flex-wrap nx:gap-1">
        <Button
          ref={addRef}
          size="sm"
          className="nx:h-(--nx-spacing-8) nx:text-muted-foreground"
          variant="ghost"
          disabled={disabled || !firstField}
          onClick={addRule}
        >
          <IconPlus aria-hidden="true" />
          Add condition
        </Button>
        {depth < maxDepth && (
          <Button
            className="nx:h-(--nx-spacing-8) nx:text-muted-foreground"
            variant="ghost"
            disabled={disabled || !firstField}
            onClick={addGroup}
            size="sm"
          >
            <IconPlus aria-hidden="true" />
            Add group
          </Button>
        )}
      </div>
    </div>
  );
}
interface FilterBuilderProps extends Omit<
  React.ComponentProps<'div'>,
  'onChange' | 'children'
> {
  fields: readonly FilterField[];
  value: FilterGroup;
  onValueChange: (value: FilterGroup) => void;
  disabled?: boolean;
  /** Root depth is zero. Controls creation; existing deeper groups remain visible and invalid. */
  maxDepth?: number;
}
function FilterBuilder({
  fields,
  value,
  onValueChange,
  disabled = false,
  maxDepth = 3,
  className,
  'aria-label': label = 'Filters',
  ...props
}: FilterBuilderProps) {
  const errors = getFilterErrors(value, fields, maxDepth);
  return (
    <div
      data-slot="filter-builder"
      data-disabled={disabled || undefined}
      className={cn(
        'nx:@container/builder nx:w-full nx:min-w-0 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-4',
        className
      )}
      {...props}
    >
      <GroupEditor
        fields={fields}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        depth={0}
        maxDepth={maxDepth}
        errors={errors}
        label={label}
      />
    </div>
  );
}
export { FilterBuilder, type FilterBuilderProps };
