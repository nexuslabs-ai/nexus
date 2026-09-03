import type { NextMDXOptions } from '@next/mdx';

export const MDX_OPTIONS = {
  remarkPlugins: ['remark-gfm'],
  rehypePlugins: ['rehype-slug'],
  remarkRehypeOptions: {
    footnoteLabelProperties: { className: ['nx:sr-only'] },
  },
} satisfies NonNullable<NextMDXOptions['options']>;
