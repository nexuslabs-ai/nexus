'use client';

import { useState } from 'react';

import type { NexusAppearanceState } from '@nexus_ds/core';
import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { DOCS_APPEARANCE_DEFAULT_STATE } from '../_lib/appearance-controls';

const HISTORY_LIMIT = 100;

type AppearancePatch = Partial<NexusAppearanceState>;
type AppearanceKey = keyof NexusAppearanceState;

function isShallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  const aEntries = Object.entries(a);
  const bRecord = b as Record<string, unknown>;
  return (
    aEntries.length === Object.keys(b).length &&
    aEntries.every(([key, value]) => Object.is(value, bRecord[key]))
  );
}

/** The current values of the keys `patch` would change. */
function inverseOf(
  state: NexusAppearanceState,
  patch: AppearancePatch
): AppearancePatch {
  const changedKeys = (Object.keys(patch) as AppearanceKey[]).filter(
    (key) => !isShallowEqual(state[key], patch[key])
  );
  return Object.fromEntries(
    changedKeys.map((key) => [key, state[key]])
  ) as AppearancePatch;
}

/**
 * The shared docs appearance plus an undo history of the edits made through
 * `change` and `reset`. Each step stores only the previous values of the keys
 * it changed, so Undo leaves writes made elsewhere (such as the top-nav mode
 * toggle) in place. Consecutive changes in the same `group` share one undo
 * step until `startStep` is called. Edits persist through the docs appearance
 * provider.
 */
export function useAppearanceHistory() {
  const { state, setState } = useNexusAppearance();
  const [history, setHistory] = useState<AppearancePatch[]>([]);
  const [lastGroup, setLastGroup] = useState<AppearanceKey | null>(null);

  function change(patch: AppearancePatch, group?: AppearanceKey) {
    const inverse = inverseOf(state, patch);
    if (Object.keys(inverse).length === 0) return;

    const extendsStep = group !== undefined && group === lastGroup;
    setHistory((past) => {
      const step = past.at(-1);
      if (!extendsStep || !step)
        return [...past, inverse].slice(-HISTORY_LIMIT);
      // The open step keeps the value each key had before the group began.
      return [...past.slice(0, -1), { ...inverse, ...step }];
    });
    setLastGroup(group ?? null);
    setState((current) => ({ ...current, ...patch }));
  }

  function reset() {
    change(DOCS_APPEARANCE_DEFAULT_STATE);
  }

  function startStep() {
    setLastGroup(null);
  }

  function undo() {
    const inverse = history.at(-1);
    if (!inverse) return;
    setHistory((past) => past.slice(0, -1));
    startStep();
    setState((current) => ({ ...current, ...inverse }));
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
