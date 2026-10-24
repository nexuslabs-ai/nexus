import type { StorybookConfig } from '@storybook/react-vite';

// Radix and the other dependencies sit in the root node_modules, where `react`
// is 19. Resolve every `react` import from this package, which has 18.
const REACT_18 = ['react', 'react-dom'];

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  staticDirs: ['../../react/.storybook/public'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: { dedupe: REACT_18 },
    });
  },
};

export default config;
