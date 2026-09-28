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

/** Copy-source block. The application owns condition state and option IDs. */
export function ChoiceFilter({
  label,
  icon,
  value,
  options,
  onChange,
  disabled = false,
}: ChoiceFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<'is' | 'isNot' | null>(null);
  const [snapshot, setSnapshot] = React.useState(
    JSON.stringify([value, disabled])
  );
  const nextSnapshot = JSON.stringify([value, disabled]);
  // A controlled replacement invalidates an unfinished operator/value edit.
  if (snapshot !== nextSnapshot) {
    setSnapshot(nextSnapshot);
    setOpen(false);
    setPending(null);
  }
  const addRef = React.useRef<HTMLButtonElement>(null);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const restoreAdd = React.useRef(false);
  const selected = value && 'value' in value ? value.value : '';
  const selectedLabel = selected
    ? (options.find((option) => option.value === selected)?.label ??
      `${selected} (unavailable)`)
    : '';
  function focusAdd(node: HTMLButtonElement | null) {
    addRef.current = node;
    if (node && restoreAdd.current) {
      restoreAdd.current = false;
      node.focus();
    }
  }
  function remove() {
    if (disabled) return;
    restoreAdd.current = true;
    setOpen(false);
    setPending(null);
    onChange(null);
  }
  function changeOperator(operator: ChoiceCondition['operator']) {
    if (disabled) return;
    if (operator === 'isEmpty' || operator === 'isNotEmpty') {
      onChange({ operator });
      return;
    }
    if (value && 'value' in value) {
      onChange({ operator, value: value.value });
      return;
    }
    // Never publish an incomplete condition. Cancelling keeps the applied operator.
    setPending(operator);
  }
  function select(id: string) {
    if (disabled) return;
    if (id === '') {
      remove();
      return;
    }
    const option = options.find((item) => item.value === id && !item.disabled);
    if (!option) return;
    onChange({
      operator: pending ?? (value?.operator === 'isNot' ? 'isNot' : 'is'),
      value: id,
    });
    setPending(null);
    setOpen(false);
  }
  function changeOpen(next: boolean) {
    setOpen(next && !disabled);
    if (!next) setPending(null);
  }
  function restoreFocus(event: Event) {
    if (restoreAdd.current || !value) {
      event.preventDefault();
      addRef.current?.focus();
    } else if (!('value' in value)) {
      event.preventDefault();
      operatorRef.current?.focus();
    }
  }
  return (
    <DropdownMenu open={open && !disabled} onOpenChange={changeOpen}>
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
              onCloseAutoFocus={
                pending
                  ? (event) => {
                      event.preventDefault();
                      setOpen(true);
                    }
                  : undefined
              }
            />
          </div>
          <div className="nx:inline-flex nx:max-w-full nx:min-w-0 nx:border-s-default nx:border-border-default nx:-ms-(--nx-borderwidth-default)">
            {('value' in value || pending) && (
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
            type="button"
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
      : [...options, { value, label: `${value} (unavailable)` }];
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
