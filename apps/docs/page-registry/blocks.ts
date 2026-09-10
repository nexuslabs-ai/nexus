/**
 * Wireframe content blocks — the placeholder body a docs page renders until a
 * real page file lands.
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
