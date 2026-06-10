import { useEffect } from 'react';

import { type CodexThemeContract, deriveTheme, themeToCss } from '@nexus/core';

const STYLE_ID = 'nexus-derived-theme';

/** Resolve the contract's appearance to a concrete light/dark, honoring "system". */
function resolveDark(appearance: CodexThemeContract['appearance']): boolean {
  if (appearance === 'dark') return true;
  if (appearance === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Apply a free-form Codex contract at runtime. Derives the token set and injects
 * it as a single <style> appended last in <head>, so its `html` / `html.dark`
 * rules win over the preset base/brand <link>s (equal specificity, later wins),
 * and sets the `.dark` class from the contract's appearance — so while a derived
 * theme is active, the contract owns the rendered light/dark mode. Passing `null`
 * removes the override and restores the preset path. Syncs React state to an
 * external system (the DOM), so it belongs in an effect.
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
    // The contract owns the rendered light/dark mode while it's active.
    document.documentElement.classList.toggle(
      'dark',
      resolveDark(contract.appearance)
    );
  }, [contract]);
}
