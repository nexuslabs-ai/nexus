'use client';

import { useEffect, useState } from 'react';

import type { TokenMap } from '@nxds/core';

/**
 * Computed values of custom properties on `<html>`. Re-reads when the
 * overrides change, when the provider swaps a preset attribute or the dark
 * class on `<html>`, and when it rewrites its runtime styles in `<head>`.
 */
export function useRootValues(
  names: readonly string[],
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
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [names, overrides]);

  return values;
}
