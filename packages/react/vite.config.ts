import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const APPEARANCE_DECLARATION_ENTRIES = [
  {
    source: '/dist/appearance/index.d.ts',
    sourceMap: '/dist/appearance/index.d.ts.map',
    output: 'appearance.d.ts',
    outputMap: 'appearance.d.ts.map',
    mapSource: 'index.d.ts.map',
  },
  {
    source: '/dist/appearance/server.d.ts',
    sourceMap: '/dist/appearance/server.d.ts.map',
    output: 'appearance-server.d.ts',
    outputMap: 'appearance-server.d.ts.map',
    mapSource: 'server.d.ts.map',
  },
] as const;

function rewriteAppearanceDeclaration(filePath: string, content: string) {
  const normalizedPath = filePath.split(path.sep).join('/');

  for (const entry of APPEARANCE_DECLARATION_ENTRIES) {
    if (normalizedPath.endsWith(entry.source)) {
      return {
        filePath: path.resolve(__dirname, 'dist', entry.output),
        content: content
          .replace(/from '\.\/([^']+)'/g, "from './appearance/$1'")
          .replace(
            `//# sourceMappingURL=${entry.mapSource}`,
            `//# sourceMappingURL=${entry.outputMap}`
          ),
      };
    }

    if (normalizedPath.endsWith(entry.sourceMap)) {
      const outputMapPath = path.resolve(__dirname, 'dist', entry.outputMap);

      try {
        const sourceMap = JSON.parse(content) as { file?: string };

        sourceMap.file = entry.output;

        return {
          filePath: outputMapPath,
          content: JSON.stringify(sourceMap),
        };
      } catch {
        return {
          filePath: outputMapPath,
          content,
        };
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
      outDir: 'dist',
      beforeWriteFile(filePath, content) {
        return rewriteAppearanceDeclaration(filePath, content);
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
        'appearance-server': path.resolve(
          __dirname,
          'src/appearance/server.ts'
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
