import type { NextMDXOptions } from '@next/mdx';
import type { Options } from 'rehype-pretty-code';

import { NEXUS_CODE_THEME } from './code-theme';

/**
 * Shiki, themed with `NEXUS_CODE_THEME` so every token colour is a Nexus
 * semantic token reference. Highlighting runs in the MDX loader, so no
 * highlighter reaches the client, and the appearance toggle recolours code
 * through those tokens rather than through a second baked palette.
 */
const SHIKI_OPTIONS = {
  theme: NEXUS_CODE_THEME,
  // Shiki's own surface would sit beside the page; the block keeps the Nexus
  // `muted` fill and border from mdx-components.tsx instead.
  keepBackground: false,
  // No line numbers or line highlighting, so the grid wrapper buys nothing.
  grid: false,
  // Substitutes a language for a fence that declares none. A fence whose
  // language has no grammar is caught by the plugin's own try/catch instead.
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
