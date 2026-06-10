import { useEffect } from 'react';

import { type CodexThemeContract, deriveTheme, themeToCss } from '@nexus/core';

const STYLE_ID = 'nexus-derived-theme';

/**
 * Inject the derived token `<style>` from a free-form contract — appended last
 * in `<head>` so its `:root` rules win over the preset `<link>`s. Passing `null`
 * removes the override and restores the preset path. The `.dark` class is owned
 * by ThemeProvider's single arbiter, not here. Syncs to an external system (the
 * DOM), so it belongs in an effect.
 */
export function useDerivedTheme(contract: CodexThemeContract | null): void {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID);
    if (!contract) {
      existing?.remove();
      return;
    }
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
      // must not crash the app — drop the override and fall back to the preset.
      style.remove();
    }
  }, [contract]);
}
