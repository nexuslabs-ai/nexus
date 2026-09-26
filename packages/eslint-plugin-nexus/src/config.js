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

export default {
  plugin,
  componentRuleSet,
  spacingTokenRuleSet,
  nexusComponentConfig,
  nexusSpacingTokenConfig,
};
