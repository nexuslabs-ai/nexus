import { useEffect, useState } from 'react';

export type ThemeConfig = {
  base: string;
  brand: string;
  dark: boolean;
};

/**
 * Load a CSS file dynamically
 */
function loadCSS(href: string, id: string): void {
  // Remove existing stylesheet with same id
  const existing = document.querySelector(`link[data-theme="${id}"]`);
  if (existing) {
    existing.remove();
  }

  // Add new stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.theme = id;
  document.head.appendChild(link);
}

/**
 * Hook to manage theme state and CSS loading
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>({
    base: 'slate',
    brand: 'blue',
    dark: false,
  });

  // Load primitives once on mount
  useEffect(() => {
    loadCSS('/themes/primitives.css', 'primitives');
  }, []);

  // Load base theme when it changes
  useEffect(() => {
    loadCSS(`/themes/base-${theme.base}.css`, 'base');
  }, [theme.base]);

  // Load brand theme when it changes
  useEffect(() => {
    loadCSS(`/themes/brands-${theme.brand}.css`, 'brand');
  }, [theme.brand]);

  // Toggle dark class on html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.dark);
  }, [theme.dark]);

  return { theme, setTheme };
}
