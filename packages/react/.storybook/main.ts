import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));
const worktreeTailwindCss = path.resolve(
  storybookDir,
  '../../tailwind/nexus.css'
);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const tailwindcss = (await import('@tailwindcss/vite')).default;

    return mergeConfig(config, {
      resolve: {
        alias: {
          // Worktrees share node_modules with the main checkout, so force
          // Storybook to read the current worktree's generated Nexus CSS.
          '@nexus/tailwind': worktreeTailwindCss,
        },
      },
      plugins: [tailwindcss()],
    });
  },
};

export default config;
