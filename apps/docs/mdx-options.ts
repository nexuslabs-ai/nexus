import type { NextMDXOptions } from '@next/mdx';
import type { Options } from 'rehype-pretty-code';

import { NEXUS_CODE_THEME } from './code-theme';

const SHIKI_OPTIONS = {
  theme: NEXUS_CODE_THEME,
  keepBackground: false,
  grid: false,
  // Only fills in a fence that declares no language; an unknown grammar is
  // caught by the plugin's own try/catch.
  defaultLang: { block: 'plaintext' },
} satisfies Options;

export const MDX_OPTIONS = {
  remarkPlugins: ['remark-gfm'],
  // Registered by name, not by import: Turbopack serialises loader options.
  rehypePlugins: ['rehype-slug', ['rehype-pretty-code', SHIKI_OPTIONS]],
  remarkRehypeOptions: {
    footnoteLabelProperties: { className: ['nx:sr-only'] },
  },
} satisfies NonNullable<NextMDXOptions['options']>;
