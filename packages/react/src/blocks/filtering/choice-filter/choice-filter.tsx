import * as React from 'react';

import { Button } from '../../../components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../../components/dropdown-menu';
import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '../../../components/filter-condition';
import { ConditionOperator } from '../filter-operator';
import { useConditionEditor } from '../use-condition-editor';

export type ChoiceCondition =
  | { operator: 'is' | 'isNot'; value: string }
  | { operator: 'isEmpty' }
  | { operator: 'isNotEmpty' };
export type ChoiceOption = { value: string; label: string; disabled?: boolean };
export type ChoiceFilterProps = {
  label: string;
  icon?: React.ReactNode;
  value: ChoiceCondition | null;
  options: readonly ChoiceOption[];
  onChange: (value: ChoiceCondition | null) => void;
  disabled?: boolean;
};

function optionLabel(options: readonly ChoiceOption[], value: string) {
  return (
    options.find((option) => option.value === value)?.label ??
    `${value} (unavailable)`
  );
}

/** Copy-source block. The application owns condition state and option IDs. */
export function ChoiceFilter({
  label,
  icon,
  value,
  options,
  onChange,
  disabled = false,
}: ChoiceFilterProps) {
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
  } = useConditionEditor({ value, onChange, disabled });
  const selected = applied?.value ?? '';
  const selectedLabel = selected ? optionLabel(options, selected) : '';
  function select(id: string) {
    if (id === '') {
      remove();
      return;
    }
    const option = options.find((item) => item.value === id && !item.disabled);
    if (!option) return;
    commit({ operator: pending ?? applied?.operator ?? 'is', value: id });
  }
  return (
    <DropdownMenu open={open} onOpenChange={changeOpen}>
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
              triggerRef={operatorRef}
              label={label}
              value={pending ?? value.operator}
              options={['is', 'isNot', 'isEmpty', 'isNotEmpty']}
              onChange={changeOperator}
              disabled={disabled}
              onCloseAutoFocus={openPending}
            />
          </div>
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0 nx:border-s-default nx:border-border-default nx:-ms-(--nx-borderwidth-default)">
            {(applied || pending) && (
              <DropdownMenuTrigger asChild>
                <FilterConditionSegment
                  className="nx:min-w-20"
                  disabled={disabled}
                  aria-label={`Edit ${label}: ${selectedLabel || 'Choose…'}`}
                >
                  {selectedLabel || 'Choose…'}
                </FilterConditionSegment>
              </DropdownMenuTrigger>
            )}
            <FilterConditionRemove
              disabled={disabled}
              aria-label={`Remove ${label} filter`}
              onClick={remove}
            />
          </div>
        </FilterCondition>
      ) : (
        <DropdownMenuTrigger asChild>
          <Button
            ref={focusAdd}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="nx:h-(--nx-spacing-8)"
          >
            Add {label.toLowerCase()} filter
          </Button>
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent
        aria-label={`Filter by ${label.toLowerCase()}`}
        align="start"
        onCloseAutoFocus={restoreFocus}
      >
        <ChoiceEditor
          label={label}
          value={selected}
          options={options}
          onChange={select}
          disabled={disabled}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Controlled menu editor. Compose inside DropdownMenuContent; the owner decides whether onChange edits a draft or applied state. */
export function ChoiceEditor({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: readonly ChoiceOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const listed =
    value === '' || options.some((option) => option.value === value)
      ? options
      : [
          ...options,
          { value, label: optionLabel(options, value), disabled: true },
        ];
  function select(next: string) {
    if (disabled) return;
    if (
      next !== '' &&
      !options.some((option) => option.value === next && !option.disabled)
    )
      return;
    onChange(next);
  }
  return (
    <>
      <DropdownMenuRadioGroup
        aria-label={label}
        value={value}
        onValueChange={select}
      >
        <DropdownMenuRadioItem value="" disabled={disabled}>
          Any {label.toLowerCase()}
        </DropdownMenuRadioItem>
        {listed.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            disabled={disabled || option.disabled}
          >
            {option.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      {!options.length && (
        <p className="nx:p-2 nx:typography-body-default nx:text-muted-foreground">
          No options available
        </p>
      )}
    </>
  );
}
