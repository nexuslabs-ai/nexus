import type { NextMDXOptions } from '@next/mdx';

/**
 * Dual-theme Shiki. Given a theme record, rehype-pretty-code asks Shiki for both
 * palettes and writes each token's two colours as `--shiki-light` /
 * `--shiki-dark` custom properties instead of a resolved `color`, so the
 * appearance toggle recolours every block from CSS alone — see the `pre`
 * mapping in mdx-components.tsx. Highlighting runs in the MDX loader, so no
 * highlighter reaches the client.
 */
const SHIKI_OPTIONS = {
  theme: { light: 'github-light', dark: 'github-dark-dimmed' },
  // Shiki's own surface would sit beside the page; the block keeps the Nexus
  // `muted` fill and border from mdx-components.tsx instead.
  keepBackground: false,
  // No line numbers or line highlighting, so the grid wrapper buys nothing.
  grid: false,
  // A fence with no language, or one Shiki has no grammar for, falls back to
  // plaintext instead of failing the build. Inline code is left alone.
  defaultLang: { block: 'plaintext' },
};

const REHYPE_PRETTY_CODE = ['rehype-pretty-code', SHIKI_OPTIONS] satisfies [
  name: string,
  options: unknown,
];

export const MDX_OPTIONS = {
  remarkPlugins: ['remark-gfm'],
  // Registered by name, not by import: Turbopack serialises loader options.
  rehypePlugins: ['rehype-slug', REHYPE_PRETTY_CODE],
  remarkRehypeOptions: {
    footnoteLabelProperties: { className: ['nx:sr-only'] },
  },
} satisfies NonNullable<NextMDXOptions['options']>;
