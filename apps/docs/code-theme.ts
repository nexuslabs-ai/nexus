import type { ThemeRegistrationRaw } from 'shiki';

/**
 * Nexus code theme. Every colour is a Nexus token reference rather than a
 * resolved value, so Shiki writes token references into the markup and the
 * appearance toggle recolours code the same way it recolours everything else —
 * each token already carries its own `.dark` override. That is why this is a
 * single theme rather than a light/dark pair.
 *
 * The five hue-bearing roles use `chart-categorical-*` because it is the only
 * shipped family whose members are guaranteed to be distinguishable from each
 * other: the semantic foreground tokens are achromatic under a neutral brand,
 * so keywords would render as plain text. That family is APCA-gated against
 * `container`, which is why the block paints `container` rather than `muted` —
 * on `muted` the green and orange fall under the Lc 60 floor in light mode.
 * The quiet roles stay on the text tiers, which is what they are for.
 */
const SCOPES = {
  // Red — keywords carry the most structural weight, so they lead.
  'chart-categorical-4': [
    'keyword',
    'storage',
    'storage.type',
    'storage.modifier',
    'keyword.control',
    'variable.language',
  ],
  // Green — literal text.
  'chart-categorical-2': [
    'string',
    'constant.character.escape',
    'punctuation.definition.string',
  ],
  // Violet — things that are called.
  'chart-categorical-5': [
    'entity.name.function',
    'support.function',
    'meta.function-call',
    'entity.other.attribute-name',
  ],
  // Teal — things that name a shape.
  'chart-categorical-1': [
    'entity.name.type',
    'entity.name.class',
    'entity.name.tag',
    'support.type',
    'support.class',
  ],
  // Orange — literal values that are not text.
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
  // Same list under both keys: Shiki reads `settings`, while rehype-pretty-code
  // identifies a single inline theme by `tokenColors` and otherwise reads an
  // object theme as a light/dark record.
  tokenColors: TOKEN_COLORS,
} satisfies ThemeRegistrationRaw;
