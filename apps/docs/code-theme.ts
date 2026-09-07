import type { ThemeRegistrationRaw } from 'shiki';

const SCOPES = {
  'chart-categorical-4': [
    'keyword',
    'storage',
    'storage.type',
    'storage.modifier',
    'keyword.control',
    'variable.language',
  ],
  'chart-categorical-2': [
    'string',
    'constant.character.escape',
    'punctuation.definition.string',
  ],
  'chart-categorical-5': [
    'entity.name.function',
    'support.function',
    'meta.function-call',
    'entity.other.attribute-name',
  ],
  'chart-categorical-1': [
    'entity.name.type',
    'entity.name.class',
    'entity.name.tag',
    'support.type',
    'support.class',
  ],
  'chart-categorical-3': [
    'constant.numeric',
    'constant.language',
    'constant.other',
  ],
  'muted-foreground': ['comment', 'punctuation.definition.comment'],
  'muted-foreground-subtle': ['punctuation', 'keyword.operator', 'meta.brace'],
} satisfies Record<string, readonly string[]>;

const TOKEN_COLORS = Object.entries(SCOPES).map(([token, scope]) => ({
  scope: [...scope],
  settings: { foreground: `var(--nx-color-${token})` },
}));

export const NEXUS_CODE_THEME = {
  name: 'nexus',
  colors: { 'editor.foreground': 'var(--nx-color-foreground)' },
  settings: TOKEN_COLORS,
  // rehype-pretty-code reads a theme as a light/dark record unless it carries
  // `tokenColors`; Shiki itself reads `settings`.
  tokenColors: TOKEN_COLORS,
} satisfies ThemeRegistrationRaw;
