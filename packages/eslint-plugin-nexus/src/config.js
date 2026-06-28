import plugin from './index.js';

export const componentRuleSet = {
  '@nexus/nx-class-conventions': 'error',
  '@nexus/no-render-prop-types': 'error',
  '@nexus/no-multi-statement-jsx-handler': 'error',
};

export const spacingTokenRuleSet = {
  '@nexus/canonical-spacing-steps': 'error',
};

export function nexusComponentConfig(options = {}) {
  const { files } = options;

  return {
    ...(files ? { files } : {}),
    plugins: {
      '@nexus': plugin,
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
      '@nexus': plugin,
    },
    rules: spacingTokenRuleSet,
  };
}

export default {
  plugin,
  componentRuleSet,
  spacingTokenRuleSet,
  nexusComponentConfig,
  nexusSpacingTokenConfig,
};
