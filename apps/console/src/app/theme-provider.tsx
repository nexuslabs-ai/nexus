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
  /** App-preferences (fonts, motion, cursors…); applied only while a contract is active. */
  codexPrefs: CodexPrefs;
  setCodexPrefs: React.Dispatch<React.SetStateAction<CodexPrefs>>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Mounts the theme engine once at the app root. `useTheme` owns the preset
 * <link> swaps; `useDerivedTheme` owns the runtime-derived <style> + the `.dark`
 * class while a contract is active; `useAppearancePrefs` owns the prefs <style>.
 * Consumers read all of it via `useThemeContext`.
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

  useDerivedTheme(codexContract);
  // Prefs apply only with a derived theme active — otherwise the preset owns the UI.
  useAppearancePrefs(codexContract ? codexPrefs : null);

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
