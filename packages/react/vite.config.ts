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
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
      outDir: 'dist',
      rollupTypes: true,
      beforeWriteFile(filePath, content) {
        const normalizedPath = filePath.split(path.sep).join('/');

        if (normalizedPath.endsWith('/dist/appearance/index.d.ts')) {
          return {
            filePath: path.resolve(__dirname, 'dist/appearance.d.ts'),
            content: content
              .replace(
                /export \* from '\.\/([^']+)';/g,
                "export * from './appearance/$1';"
              )
              .replace(
                '//# sourceMappingURL=index.d.ts.map',
                '//# sourceMappingURL=appearance.d.ts.map'
              ),
          };
        }

        if (normalizedPath.endsWith('/dist/appearance/index.d.ts.map')) {
          const appearanceMapPath = path.resolve(
            __dirname,
            'dist/appearance.d.ts.map'
          );

          try {
            const sourceMap = JSON.parse(content) as { file?: string };

            sourceMap.file = 'appearance.d.ts';

            return {
              filePath: appearanceMapPath,
              content: JSON.stringify(sourceMap),
            };
          } catch {
            return {
              filePath: appearanceMapPath,
              content,
            };
          }
        }
      },
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
        appearance: path.resolve(__dirname, 'src/appearance/index.ts'),
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
