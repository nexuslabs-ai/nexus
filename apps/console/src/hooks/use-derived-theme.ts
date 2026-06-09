import { useEffect } from 'react';

import { type CodexThemeContract, deriveTheme, themeToCss } from '@nexus/core';

const STYLE_ID = 'nexus-derived-theme';

/**
 * Apply a free-form Codex contract at runtime. Derives the token set and injects
 * it as a single <style> appended last in <head>, so its `html` / `html.dark`
 * rules win over the preset base/brand <link>s (equal specificity, later wins).
 * Passing `null` removes the override and restores the preset path. This syncs
 * React state to an external system (the DOM <head>), so it belongs in an effect.
 *
 * Note: the `.dark` class stays owned by `useTheme` (the preset hook); the toggle
 * that sets the contract also sets `theme.dark` to match the contract appearance.
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
    style.textContent = themeToCss(deriveTheme(contract));
    // appendChild on an already-attached node moves it to the end → stays last.
    document.head.appendChild(style);
  }, [contract]);
}
