import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'config/index': 'src/config/index.ts',
    'types/index': 'src/types/index.ts',
    'utils/index': 'src/utils/index.ts',
    'extractor/index': 'src/extractor/index.ts',
    'generator/index': 'src/generator/index.ts',
    'manifest/index': 'src/manifest/index.ts',
    'processor/index': 'src/processor/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node20',
  // Externalize dependencies that use dynamic requires (breaks ESM bundles)
  // ts-morph and typescript use require('fs'), require('path'), etc.
  external: [
    'ts-morph',
    'typescript',
    'react-docgen-typescript',
    '@anthropic-ai/sdk',
    '@google/genai',
  ],
});
