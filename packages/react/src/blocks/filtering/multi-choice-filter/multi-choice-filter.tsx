import * as React from 'react';

import { Button } from '../../../components/button';
import { Checkbox } from '../../../components/checkbox';
import { ChoiceRow } from '../../../components/choice-row';
import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '../../../components/filter-condition';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/popover';
import { ConditionOperator } from '../filter-operator';
import { useConditionEditor } from '../use-condition-editor';

export type MultiChoiceCondition =
  | { operator: 'isAnyOf' | 'isNoneOf'; values: string[] }
  | { operator: 'isEmpty' | 'isNotEmpty' };
export type MultiChoiceFilterProps = {
  label: string;
  icon?: React.ReactNode;
  value: MultiChoiceCondition | null;
  onChange: (value: MultiChoiceCondition | null) => void;
  disabled?: boolean;
  options: readonly { value: string; label: string; disabled?: boolean }[];
};

export function MultiChoiceFilter({
  label,
  icon,
  value,
  onChange,
  disabled = false,
  options,
}: MultiChoiceFilterProps) {
  const [draft, setDraft] = React.useState<string[]>([]);
  const {
    applied,
    open,
    pending,
    changeOpen,
    changeOperator,
    commit,
    openPending,
    remove,
    focusAdd,
    operatorRef,
    restoreFocus,
  } = useConditionEditor({
    value,
    onChange,
    disabled,
    onOpen: (current) => setDraft(current ? [...current.values] : []),
  });
  const valid = draft.length > 0;
  const summary = applied
    ? applied.values
        .map(
          (item) =>
            options.find((option) => option.value === item)?.label ??
            `${item} (unavailable)`
        )
        .join(', ')
    : 'Choose…';
  const operator = pending ?? applied?.operator ?? 'isAnyOf';
  function apply(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!valid) return;
    commit({ operator, values: [...new Set(draft)] });
  }
  return (
    <Popover open={open} onOpenChange={changeOpen}>
      {value ? (
        <FilterCondition className="nx:flex-wrap nx:gap-y-1">
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0">
            <FilterConditionField
              className="nx:min-w-0 nx:shrink"
              title={label}
            >
              {icon}
              <span className="nx:truncate">{label}</span>
            </FilterConditionField>
            <ConditionOperator
              label={label}
              triggerRef={operatorRef}
              disabled={disabled}
              value={pending ?? value.operator}
              options={['isAnyOf', 'isNoneOf', 'isEmpty', 'isNotEmpty']}
              onChange={changeOperator}
              onCloseAutoFocus={openPending}
            />
          </div>
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0 nx:border-s-default nx:border-border-default nx:-ms-(--nx-borderwidth-default)">
            {(applied || pending) && (
              <PopoverTrigger asChild>
                <FilterConditionSegment
                  className="nx:min-w-20"
                  disabled={disabled}
                  aria-label={`Edit ${label}: ${summary}`}
                >
                  {summary}
                </FilterConditionSegment>
              </PopoverTrigger>
            )}
            <FilterConditionRemove
              disabled={disabled}
              aria-label={`Remove ${label} filter`}
              onClick={remove}
            />
          </div>
        </FilterCondition>
      ) : (
        <PopoverTrigger asChild>
          <Button
            ref={focusAdd}
            type="button"
            size="sm"
            className="nx:h-(--nx-spacing-8)"
            variant="outline"
            disabled={disabled}
          >
            Add {label.toLowerCase()} filter
          </Button>
        </PopoverTrigger>
      )}
      <PopoverContent
        align="start"
        aria-label={`Filter by ${label.toLowerCase()}`}
        onCloseAutoFocus={restoreFocus}
        className="nx:w-72 nx:max-w-(--radix-popover-content-available-width) nx:max-h-(--radix-popover-content-available-height) nx:overflow-y-auto nx:p-0"
      >
        <form onSubmit={apply}>
          <MultiChoiceEditor
            label={label}
            value={draft}
            options={options}
            onChange={setDraft}
            disabled={disabled}
          />
          <div className="nx:flex nx:items-center nx:justify-between nx:gap-2 nx:border-t nx:border-border-default nx:bg-muted-extralight nx:p-3">
            <Button
              type="button"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              variant="ghost"
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="nx:h-(--nx-spacing-8)"
              disabled={!valid || disabled}
            >
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Controlled checklist with no commit controls. An empty list means no selected options; the owner maps it to its condition model. */
export function MultiChoiceEditor({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: readonly string[];
  options: MultiChoiceFilterProps['options'];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const id = React.useId();
  const availableOptions = [
    ...options,
    ...value
      .filter((item) => !options.some((option) => option.value === item))
      .map((item) => ({
        value: item,
        label: `${item} (unavailable)`,
        disabled: false,
      })),
  ];
  function toggle(item: string, checked: boolean) {
    if (
      disabled ||
      options.some((option) => option.value === item && option.disabled)
    )
      return;
    onChange(
      checked
        ? [...new Set([...value, item])]
        : value.filter((entry) => entry !== item)
    );
  }
  return (
    <fieldset
      disabled={disabled}
      className="nx:m-0 nx:min-w-0 nx:border-0 nx:p-1"
    >
      <legend className="nx:sr-only">{label}</legend>
      <div className="nx:max-h-64 nx:overflow-y-auto">
        {availableOptions.map((option, index) => (
          <ChoiceRow
            key={option.value}
            htmlFor={`${id}-${index}`}
            className="nx:not-has-[:disabled]:hover:bg-popover-hover"
          >
            <Checkbox
              id={`${id}-${index}`}
              checked={value.includes(option.value)}
              disabled={disabled || option.disabled}
              onCheckedChange={(checked) =>
                toggle(option.value, checked === true)
              }
            />
            {option.label}
          </ChoiceRow>
        ))}
        {!availableOptions.length && (
          <p className="nx:p-2 nx:typography-body-default nx:text-muted-foreground">
            No options available
          </p>
        )}
      </div>
    </fieldset>
  );
}
