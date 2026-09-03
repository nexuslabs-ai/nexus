import { useEffect, useMemo, useState } from 'react';

import { useNexusAppearance } from '@nexus_ds/react/appearance';

import { useColorDraftStore } from './color-draft-store';

export type ResolvedTokenValues = Record<string, string>;

function overridesKey(overrides: Record<string, unknown>): string {
  return JSON.stringify(overrides);
}

export function useResolvedTokenValues(
  names: readonly string[]
): ResolvedTokenValues {
  const { resolvedMode, state } = useNexusAppearance();
  const overrides = useColorDraftStore((draftState) => draftState.overrides);
  const [values, setValues] = useState<ResolvedTokenValues>({});
  const namesKey = names.join('|');
  const appearanceKey = JSON.stringify(state);
  const draftKey = useMemo(() => overridesKey(overrides), [overrides]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tokenNames = namesKey ? namesKey.split('|') : [];
    const frame = window.requestAnimationFrame(() => {
      const computed = window.getComputedStyle(document.documentElement);
      const nextValues = Object.fromEntries(
        tokenNames.map((name) => [
          name,
          computed.getPropertyValue(`--nx-color-${name}`).trim(),
        ])
      );

      setValues(nextValues);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [appearanceKey, draftKey, namesKey, resolvedMode]);

  return values;
}
