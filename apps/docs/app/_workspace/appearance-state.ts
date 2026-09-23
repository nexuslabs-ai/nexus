'use client';

import { useState } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { DOCS_APPEARANCE_DEFAULT_STATE } from '../_lib/appearance-controls';

const HISTORY_LIMIT = 100;

type ChangeGroup = keyof NexusAppearanceState;

/**
 * The shared docs appearance plus an undo history of the edits made through
 * `change` and `reset`. Consecutive changes in the same `group` share one undo
 * step until `startStep` is called. Edits persist through the docs appearance
 * provider.
 */
export function useAppearanceHistory() {
  const { state, setState } = useNexusAppearance();
  const [history, setHistory] = useState<NexusAppearanceState[]>([]);
  const [lastGroup, setLastGroup] = useState<ChangeGroup | null>(null);

  function commit(next: NexusAppearanceState, group: ChangeGroup | null) {
    if (group === null || group !== lastGroup) {
      setHistory((past) => [...past, state].slice(-HISTORY_LIMIT));
    }
    setLastGroup(group);
    setState(next);
  }

  function change(patch: Partial<NexusAppearanceState>, group?: ChangeGroup) {
    commit({ ...state, ...patch }, group ?? null);
  }

  function reset() {
    commit(DOCS_APPEARANCE_DEFAULT_STATE, null);
  }

  function startStep() {
    setLastGroup(null);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((past) => past.slice(0, -1));
    startStep();
    setState(previous);
  }

  return {
    state,
    change,
    startStep,
    reset,
    undo,
    canUndo: history.length > 0,
  };
}
