'use client';

import { useEffect, useState } from 'react';

import type { NexusAppearanceState, TokenMap } from '@nexus_ds/core';

/**
 * Computed values of custom properties on `<html>`. Re-reads when the
 * appearance or the overrides change, and when the provider swaps a preset
 * attribute on `<html>`.
 */
export function useRootValues(
  names: readonly string[],
  appearance: NexusAppearanceState,
  overrides: TokenMap
): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    function read() {
      const style = getComputedStyle(document.documentElement);
      setValues(
        Object.fromEntries(
          names.map((name) => [name, style.getPropertyValue(name).trim()])
        )
      );
    }
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [names, appearance, overrides]);

  return values;
}
