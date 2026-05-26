import { useEffect, useState } from 'react';

export type ThemeConfig = {
  // Color themes
  base: string;
  brand: string;
  dark: boolean;
  // Design token modes
  spacing: string;
  typography: string;
  shadow: string;
  radius: string;
  borderWidth: string;
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
    // Color themes
    base: 'slate',
    brand: 'blue',
    dark: false,
    // Design token modes
    spacing: 'vega',
    typography: 'vega',
    shadow: 'vega',
    radius: 'subtle',
    borderWidth: 'vega',
  });

  // Load base theme when it changes
  useEffect(() => {
    loadCSS(`/themes/base-${theme.base}.css`, 'base');
  }, [theme.base]);

  // Load brand theme when it changes
  useEffect(() => {
    loadCSS(`/themes/brands-${theme.brand}.css`, 'brand');
  }, [theme.brand]);

  useEffect(() => {
    document.documentElement.setAttribute('data-style', theme.spacing);
  }, [theme.spacing]);

  // Load typography mode when it changes
  useEffect(() => {
    loadCSS(`/themes/typography-${theme.typography}.css`, 'typography');
  }, [theme.typography]);

  // Load shadow mode when it changes
  useEffect(() => {
    loadCSS(`/themes/shadow-${theme.shadow}.css`, 'shadow');
  }, [theme.shadow]);

  // Load radius mode when it changes
  useEffect(() => {
    loadCSS(`/themes/radius-${theme.radius}.css`, 'radius');
  }, [theme.radius]);

  // Load border width mode when it changes
  useEffect(() => {
    loadCSS(`/themes/borderwidth-${theme.borderWidth}.css`, 'borderwidth');
  }, [theme.borderWidth]);

  // Toggle dark class on html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.dark);
  }, [theme.dark]);

  return { theme, setTheme };
}
