'use client';

import { useState } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { DOCS_APPEARANCE_DEFAULT_STATE } from '../_lib/appearance-controls';

const HISTORY_LIMIT = 100;

/**
 * The shared docs appearance plus an undo history of the edits made through
 * `change` and `reset`. Edits persist through the docs appearance provider.
 */
export function useAppearanceHistory() {
  const { state, setState } = useNexusAppearance();
  const [history, setHistory] = useState<NexusAppearanceState[]>([]);

  function commit(next: NexusAppearanceState) {
    setHistory((past) => [...past, state].slice(-HISTORY_LIMIT));
    setState(next);
  }

  function change(patch: Partial<NexusAppearanceState>) {
    commit({ ...state, ...patch });
  }

  function reset() {
    commit(DOCS_APPEARANCE_DEFAULT_STATE);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((past) => past.slice(0, -1));
    setState(previous);
  }

  return { state, change, reset, undo, canUndo: history.length > 0 };
}
