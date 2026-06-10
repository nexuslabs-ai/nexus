import { useEffect } from 'react';

import { type CodexPrefs, prefsToCss } from '../lib/codex-prefs';

const STYLE_ID = 'nexus-appearance-prefs';

/**
 * Apply the app-preference CSS at runtime. Injects a single <style> (after the
 * derived-theme <style>) generated from the prefs. Passing `null` removes it.
 */
export function useAppearancePrefs(prefs: CodexPrefs | null): void {
  useEffect(() => {
    const existing = document.getElementById(STYLE_ID);
    if (!prefs) {
      existing?.remove();
      return;
    }
    const style =
      existing instanceof HTMLStyleElement
        ? existing
        : document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = prefsToCss(prefs);
    document.head.appendChild(style);
  }, [prefs]);
}
