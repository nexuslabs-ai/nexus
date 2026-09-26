import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/defaults';

import plugin from './index.js';

export const componentRuleSet = {
  '@nexus_ds/nx-class-conventions': 'error',
  '@nexus_ds/no-render-prop-types': 'error',
  '@nexus_ds/no-multi-statement-jsx-handler': 'error',
};

export const spacingTokenRuleSet = {
  '@nexus_ds/canonical-spacing-steps': 'error',
};

export function nexusComponentConfig(options = {}) {
  const { files } = options;

  return {
    ...(files ? { files } : {}),
    plugins: {
      '@nexus_ds': plugin,
    },
    rules: componentRuleSet,
  };
}

export function nexusSpacingTokenConfig(options = {}) {
  const { files, parser } = options;

  return {
    ...(files ? { files } : {}),
    ...(parser
      ? {
          languageOptions: {
            parser,
          },
        }
      : {}),
    plugins: {
      '@nexus_ds': plugin,
    },
    rules: spacingTokenRuleSet,
  };
}

// The plugin's default positions, plus Nexus's naming conventions: string
// `*ClassName` props, `*Class` / `*ClassName` / `*Classes` variables,
// `SCREAMING_CLASSES` maps, and `className` keys in config objects.
// `matchesName` requires a full match, hence the leading `.*`.
const tailwindClassSelectors = [
  ...getDefaultSelectors(),
  {
    kind: 'attribute',
    name: '.*ClassName',
    match: [{ type: 'strings' }],
  },
  {
    kind: 'variable',
    name: '.*(?:ClassName|Class|Classes)',
    match: [{ type: 'strings' }],
  },
  {
    kind: 'variable',
    name: '.*CLASSES',
    match: [{ type: 'objectValues' }],
  },
  {
    kind: 'variable',
    name: '.*',
    match: [{ type: 'objectValues', path: '(?:^|\\.)className$' }],
  },
];

// Under `prefix(nx)` Tailwind only resolves `nx:` classes, so this reports a
// bare utility as well as a typo or a class the theme no longer emits.
// `entryPoint` is the stylesheet that builds `files`; pass an absolute path.
export function nexusTailwindClassesConfig(options) {
  const { files, entryPoint } = options;

  return {
    ...(files ? { files } : {}),
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': { entryPoint, selectors: tailwindClassSelectors },
    },
    rules: {
      // `dark` is the hook for the `@custom-variant dark` in nexus.css.
      'better-tailwindcss/no-unknown-classes': [
        'error',
        { ignore: ['^dark$'] },
      ],
    },
  };
}

export default {
  plugin,
  componentRuleSet,
  spacingTokenRuleSet,
  nexusComponentConfig,
  nexusSpacingTokenConfig,
  nexusTailwindClassesConfig,
};
