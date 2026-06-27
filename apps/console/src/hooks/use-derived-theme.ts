import { useEffect } from 'react';

import { deriveTheme, type NexusThemeContract, themeToCss } from '@nexus/core';

const STYLE_ID = 'nexus-derived-theme';

/**
 * Inject the derived token `<style>` from the Appearance contract — appended
 * last in `<head>` so its `:root` rules win over the preset `<link>`s. The
 * `.dark` class is owned by ThemeProvider's single arbiter, not here. Syncs to
 * an external system (the DOM), so it belongs in an effect.
 */
export function useDerivedTheme(contract: NexusThemeContract): void {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID);
    const style =
      existing instanceof HTMLStyleElement
        ? existing
        : document.createElement('style');
    style.id = STYLE_ID;
    try {
      style.textContent = themeToCss(deriveTheme(contract));
      document.head.appendChild(style);
    } catch {
      // A malformed contract (should be filtered upstream by sanitizeContract)
      // must not crash the app.
      style.remove();
    }
  }, [contract]);
}
