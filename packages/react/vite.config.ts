import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.tsx',
        'src/stories/**',
        'src/blocks/**',
        'src/patterns/**',
      ],
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        utils: path.resolve(__dirname, 'src/lib/utils.ts'),
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
        '@nexus_ds/core',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'embla-carousel-react',
        'react-day-picker',
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
          '@nexus_ds/core': 'NexusCore',
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'embla-carousel-react': 'EmblaCarouselReact',
          'react-day-picker': 'ReactDayPicker',
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
