import { useEffect, useMemo, useState } from 'react';

import { useNexusAppearance } from '../../components/appearance/provider';

export function useRuntimeTokenValues(
  tokenNames: readonly string[]
): Record<string, string> {
  const { mounted, resolvedMode, state } = useNexusAppearance();
  const tokenKey = tokenNames.join('\n');
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const frame = window.requestAnimationFrame(() => {
      const styles = window.getComputedStyle(document.documentElement);
      const nextValues: Record<string, string> = {};

      for (const tokenName of tokenNames) {
        nextValues[tokenName] = styles.getPropertyValue(tokenName).trim();
      }

      setValues(nextValues);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mounted, resolvedMode, state, tokenKey, tokenNames]);

  return useMemo(() => values, [values]);
}

export function tokenValue(
  values: Record<string, string>,
  tokenName: string
): string {
  return values[tokenName] || '...';
}
