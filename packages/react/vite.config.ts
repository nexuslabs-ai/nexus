import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Flat component dirs export a barrel `index.d.ts`; node16/nodenext consumers
// need the explicit `/index` suffix on those relative imports in `dist/index.d.ts`.
function rewriteRootDeclaration(filePath: string, content: string) {
  const normalizedPath = filePath.split(path.sep).join('/');

  if (!normalizedPath.endsWith('/dist/index.d.ts')) return;

  return {
    filePath,
    content: content.replace(
      /from '\.\/components\/([^']+)'/g,
      (match, entry: string) =>
        entry.endsWith('/index') ? match : `from './components/${entry}/index'`
    ),
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
      outDir: 'dist',
      beforeWriteFile: rewriteRootDeclaration,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        appearance: path.resolve(
          __dirname,
          'src/components/appearance/provider/index.ts'
        ),
        'appearance-server': path.resolve(
          __dirname,
          'src/components/appearance/provider/server.ts'
        ),
      },
      name: 'NexusReact',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'js'}`,
      cssFileName: 'react',
    },
    rollupOptions: {
      external: [
        '@nexus/core',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'embla-carousel-react',
        'react-day-picker',
        'react-hook-form',
        'react-resizable-panels',
        'recharts',
        'sonner',
        'vaul',
      ],
      output: {
        banner: (chunk) =>
          chunk.fileName === 'appearance.mjs' ||
          chunk.fileName === 'appearance.js'
            ? "'use client';"
            : '',
        globals: {
          '@nexus/core': 'NexusCore',
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'embla-carousel-react': 'EmblaCarouselReact',
          'react-day-picker': 'ReactDayPicker',
          'react-hook-form': 'ReactHookForm',
          'react-resizable-panels': 'ReactResizablePanels',
          recharts: 'Recharts',
          sonner: 'Sonner',
          vaul: 'Vaul',
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
