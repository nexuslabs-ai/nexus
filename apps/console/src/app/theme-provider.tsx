import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { CodexThemeContract } from '@nexus/core';

import { useDerivedTheme } from '../hooks/use-derived-theme';
import { type ThemeConfig, useTheme } from '../hooks/useTheme';
import { loadCodexContract, saveCodexContract } from '../lib/codex-contract';

type ThemeContextValue = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  /** Active free-form Codex theme, or null when the curated preset path is active. */
  codexContract: CodexThemeContract | null;
  setCodexContract: React.Dispatch<
    React.SetStateAction<CodexThemeContract | null>
  >;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Mounts the theme engine once at the app root. `useTheme` owns the preset
 * <link> swaps and the `.dark` class; `useDerivedTheme` owns the runtime-derived
 * <style> override. Consumers read both via `useThemeContext`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [codexContract, setCodexContract] = useState<CodexThemeContract | null>(
    loadCodexContract
  );

  // Persist the contract — writing to localStorage is an external-system sync.
  useEffect(() => {
    saveCodexContract(codexContract);
  }, [codexContract]);

  useDerivedTheme(codexContract);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, codexContract, setCodexContract }}
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
