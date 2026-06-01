import { createContext, type ReactNode, useContext } from 'react';

import { type ThemeConfig, useTheme } from '../hooks/useTheme';

type ThemeContextValue = {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Mounts the theme engine exactly once at the app root. `useTheme` owns the
 * dynamic <link> swaps and the <html> `data-style` / `.dark` mutations, so a
 * single mount keeps the document head from thrashing across navigations.
 * Consumers read the live theme via `useThemeContext`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme();
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within <ThemeProvider>');
  }
  return ctx;
}
