import * as React from 'react';

import {
  type FilterOperator,
  isValuelessOperator,
  type ValuelessOperator,
} from '../../lib/filter-model';

type ValuelessCondition = { operator: ValuelessOperator };
type AppliedCondition<Condition> = Exclude<Condition, ValuelessCondition>;

function isApplied<Condition extends { operator: FilterOperator }>(
  value: Condition
): value is AppliedCondition<Condition> {
  return !isValuelessOperator(value.operator);
}

/**
 * Editor state every filter block shares. Only a complete condition is ever
 * published: choosing an operator that needs a value waits as `pending` until
 * the editor applies. A controlled replacement closes the editor and drops the
 * pending operator. Removing returns focus to the add button.
 */
export function useConditionEditor<
  Condition extends { operator: FilterOperator },
>({
  value,
  onChange,
  disabled,
  onOpen,
}: {
  value: Condition | null;
  /** Typed to receive the valueless variant, so every block's condition must include it. */
  onChange: (value: NoInfer<Condition> | ValuelessCondition | null) => void;
  disabled: boolean;
  /** Seeds the editor's draft from the applied condition each time it opens. */
  onOpen?: (applied: AppliedCondition<Condition> | null) => void;
}) {
  const applied = value && isApplied(value) ? value : null;
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<
    AppliedCondition<Condition>['operator'] | null
  >(null);
  const addRef = React.useRef<HTMLButtonElement>(null);
  const operatorRef = React.useRef<HTMLButtonElement>(null);
  const restoreAdd = React.useRef(false);
  const nextSnapshot = JSON.stringify([value, disabled]);
  const [snapshot, setSnapshot] = React.useState(nextSnapshot);
  if (snapshot !== nextSnapshot) {
    setSnapshot(nextSnapshot);
    setOpen(false);
    setPending(null);
  }

  function changeOpen(next: boolean) {
    if (disabled && next) return;
    if (next) onOpen?.(applied);
    setOpen(next);
    if (!next) setPending(null);
  }
  function commit(next: AppliedCondition<Condition>) {
    if (disabled) return;
    onChange(next);
    setOpen(false);
    setPending(null);
  }
  function changeOperator(next: Condition['operator']) {
    if (disabled) return;
    if (isValuelessOperator(next)) {
      setPending(null);
      onChange({ operator: next });
      return;
    }
    if (applied) {
      onChange({ ...applied, operator: next });
      return;
    }
    setPending(next);
  }
  function openPending(event: Event) {
    if (!pending) return;
    event.preventDefault();
    changeOpen(true);
  }
  function remove() {
    if (disabled) return;
    restoreAdd.current = true;
    setOpen(false);
    setPending(null);
    onChange(null);
  }
  function focusAdd(node: HTMLButtonElement | null) {
    addRef.current = node;
    if (node && restoreAdd.current) {
      restoreAdd.current = false;
      node.focus();
    }
  }
  function restoreFocus(event: Event) {
    if (!value) {
      event.preventDefault();
      addRef.current?.focus();
    } else if (!applied) {
      event.preventDefault();
      operatorRef.current?.focus();
    }
  }

  return {
    applied,
    open: open && !disabled,
    pending,
    changeOpen,
    changeOperator,
    commit,
    openPending,
    remove,
    focusAdd,
    operatorRef,
    restoreFocus,
  };
}
