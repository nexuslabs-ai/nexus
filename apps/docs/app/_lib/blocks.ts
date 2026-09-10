/**
 * Wireframe content blocks — the placeholder body a docs page renders until a
 * real page file lands. Kept out of `scripts/page-registry.ts` so the generated
 * `page-content.generated.ts` does not type-depend on the section registry.
 */

export type PlaceholderVariant =
  | 'default'
  | 'code'
  | 'storybook'
  | 'swatches'
  | 'diagram'
  | 'table'
  | 'tall'
  | 'hero';

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'placeholder'; variant?: PlaceholderVariant; label: string }
  | {
      type: 'row';
      blocks: { variant?: PlaceholderVariant; label: string }[];
    };
