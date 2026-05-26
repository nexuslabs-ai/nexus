import { useEffect } from 'react';

import type { Decorator, Preview } from '@storybook/react-vite';

import '../src/index.css';

const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.theme;
  const isDocs = context.viewMode === 'docs';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div
      className={`nx:flex nx:items-center nx:justify-center nx:bg-background nx:text-foreground ${isDocs ? 'nx:py-12' : 'nx:min-h-screen'}`}
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
    // A11y violations will fail tests automatically
    a11y: {
      test: 'error',
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
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
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
  },
  decorators: [ThemeDecorator],
};

export default preview;
