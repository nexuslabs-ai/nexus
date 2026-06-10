import { useEffect } from 'react';

import { type CodexPrefs, prefsToCss } from '../lib/codex-prefs';

const STYLE_ID = 'nexus-appearance-prefs';

/**
 * Apply the app-preference CSS at runtime. Injects (and on change, updates) a
 * single <style> after the derived-theme <style>, generated from the prefs.
 * Prefs apply app-wide regardless of theme, so the style is never removed.
 */
export function useAppearancePrefs(prefs: CodexPrefs): void {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID);
    const style =
      existing instanceof HTMLStyleElement
        ? existing
        : document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = prefsToCss(prefs);
    document.head.appendChild(style);
  }, [prefs]);
}
