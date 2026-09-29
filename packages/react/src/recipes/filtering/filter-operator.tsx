import type * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu';
import { FilterConditionSegment } from '../../components/filter-condition';
import {
  type FilterOperator,
  filterOperatorLabels,
} from '../../components/filter-model';

/** Recipe wiring; applications control the operator alongside the value. */
export function ConditionOperator<Operator extends FilterOperator>({
  label,
  value,
  options,
  onChange,
  triggerRef,
  disabled = false,
  onCloseAutoFocus,
}: {
  triggerRef?: React.Ref<HTMLButtonElement>;
  disabled?: boolean;
  onCloseAutoFocus?: (event: Event) => void;
  label: string;
  value: Operator;
  options: readonly Operator[];
  onChange: (value: Operator) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FilterConditionSegment
          ref={triggerRef}
          disabled={disabled}
          className="nx:min-w-16 nx:text-muted-foreground"
          title={filterOperatorLabels[value]}
          aria-label={`Change ${label} operator`}
        >
          {filterOperatorLabels[value]}
        </FilterConditionSegment>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        aria-label={`${label} operators`}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => !disabled && onChange(next as Operator)}
        >
          {options.map((operator) => (
            <DropdownMenuRadioItem
              key={operator}
              value={operator}
              disabled={disabled}
            >
              {filterOperatorLabels[operator]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
