import { useEffect } from 'react';

import type { Decorator, Preview } from '@storybook/react-vite';

import { SPACING_MODES, type SpacingMode } from '../src/stories/spacing-modes';

// Storybook needs the full token set to render. The shipped component CSS
// (src/index.css) is utilities-only by design — tokens come from the consumer's
// @nexus/tailwind — so Storybook loads them via preview.css (a CSS @import, so
// the production build can resolve @nexus/tailwind's .css package entry).
import './preview.css';

const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.theme;
  const style = context.globals.style as SpacingMode | undefined;
  const isDocs = context.viewMode === 'docs';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (typeof style === 'string') {
      document.documentElement.setAttribute('data-style', style);
    }
  }, [style]);

  return (
    <div
      className={`nx:flex nx:items-center nx:justify-center nx:bg-background nx:text-foreground ${isDocs ? 'nx:py-12' : 'nx:min-h-svh'}`}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  // Enable autodocs for all stories globally
  tags: ['autodocs'],
  parameters: {
    // Enable Table of Contents for docs pages
    docs: {
      toc: {
        headingSelector: 'h2, h3',
        title: 'On this page',
      },
    },
    // A11y violations will fail tests automatically.
    // Color-contrast is APCA-gated via `yarn workspace @nexus/core audit:contrast`
    // (see .claude/rules/tokens.md § APCA contrast gate), not WCAG 2 — disable
    // axe-core's WCAG-based contrast rules so the two gates don't conflict.
    a11y: {
      test: 'error',
      config: {
        rules: [
          { id: 'color-contrast', enabled: false },
          { id: 'color-contrast-enhanced', enabled: false },
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Disable Storybook's built-in background selector
    // Theme switching is handled by the decorator which applies
    // nx:bg-background class that uses CSS variables
    backgrounds: { disable: true },
    // Use fullscreen layout so our theme wrapper fills the entire canvas
    layout: 'fullscreen',
    viewport: {
      options: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    style: 'vega' satisfies SpacingMode,
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    style: {
      name: 'Style',
      description: 'Spacing mode — sets data-style on <html>',
      toolbar: {
        icon: 'expand',
        items: [...SPACING_MODES],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [ThemeDecorator],
};

export default preview;
