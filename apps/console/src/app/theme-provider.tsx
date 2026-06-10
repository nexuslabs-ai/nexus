import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { CodexThemeContract } from '@nexus/core';

import { useAppearancePrefs } from '../hooks/use-appearance-prefs';
import { useDerivedTheme } from '../hooks/use-derived-theme';
import { type ThemeConfig, useTheme } from '../hooks/useTheme';
import { loadCodexContract, saveCodexContract } from '../lib/codex-contract';
import {
  type CodexPrefs,
  loadCodexPrefs,
  saveCodexPrefs,
} from '../lib/codex-prefs';

type ThemeContextValue = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  /** Active free-form Codex theme, or null when the curated preset path is active. */
  codexContract: CodexThemeContract | null;
  setCodexContract: React.Dispatch<
    React.SetStateAction<CodexThemeContract | null>
  >;
  /** App-preferences (fonts, motion, cursors…) — applied app-wide regardless of theme. */
  codexPrefs: CodexPrefs;
  setCodexPrefs: React.Dispatch<React.SetStateAction<CodexPrefs>>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Resolve a contract appearance to a concrete light/dark, honoring "system". */
function appearanceDark(appearance: CodexThemeContract['appearance']): boolean {
  if (appearance === 'dark') return true;
  if (appearance === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Mounts the theme engine once at the app root. `useTheme` owns the preset
 * <link> swaps; `useDerivedTheme` injects the derived <style>; `useAppearancePrefs`
 * injects the prefs <style>. A single arbiter effect below owns the `.dark` class:
 * the active contract's appearance while a derived theme is live, otherwise the
 * preset's `theme.dark`. Consumers read everything via `useThemeContext`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [codexContract, setCodexContract] = useState<CodexThemeContract | null>(
    loadCodexContract
  );
  const [codexPrefs, setCodexPrefs] = useState<CodexPrefs>(loadCodexPrefs);

  // Persist on change — writing to localStorage is an external-system sync.
  useEffect(() => {
    saveCodexContract(codexContract);
  }, [codexContract]);
  useEffect(() => {
    saveCodexPrefs(codexPrefs);
  }, [codexPrefs]);

  // Single `.dark` arbiter — the contract owns it while active, else the preset.
  useEffect(() => {
    const apply = () => {
      const dark = codexContract
        ? appearanceDark(codexContract.appearance)
        : theme.dark;
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    if (codexContract?.appearance === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [codexContract, theme.dark]);

  useDerivedTheme(codexContract);
  useAppearancePrefs(codexPrefs);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        codexContract,
        setCodexContract,
        codexPrefs,
        setCodexPrefs,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within <ThemeProvider>');
  }
  return ctx;
}
