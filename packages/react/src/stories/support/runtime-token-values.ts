import { useEffect, useMemo, useState } from 'react';

import { nexusRootScope } from '@nexus_ds/core';

import { useNexusAppearance } from '../../components/appearance/provider';
import { useNexusRootAttributes } from '../../lib/nexus-root-context';

export function useRuntimeTokenValues(
  tokenNames: readonly string[]
): Record<string, string> {
  const { mounted, resolvedMode, state } = useNexusAppearance();
  const rootKey = useNexusRootAttributes()['data-nexus-root'];
  const tokenKey = tokenNames.join('\n');
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!mounted || rootKey === undefined) return;

    const frame = window.requestAnimationFrame(() => {
      const root = document.querySelector(nexusRootScope(rootKey));
      if (!root) return;
      const styles = window.getComputedStyle(root);
      const nextValues: Record<string, string> = {};

      for (const tokenName of tokenNames) {
        nextValues[tokenName] = styles.getPropertyValue(tokenName).trim();
      }

      setValues(nextValues);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mounted, resolvedMode, rootKey, state, tokenKey, tokenNames]);

  return useMemo(() => values, [values]);
}

export function tokenValue(
  values: Record<string, string>,
  tokenName: string
): string {
  return values[tokenName] || '...';
}
