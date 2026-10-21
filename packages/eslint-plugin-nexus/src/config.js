import plugin from './index.js';

export const componentRuleSet = {
  '@nxds/nx-class-conventions': 'error',
  '@nxds/no-render-prop-types': 'error',
  '@nxds/no-multi-statement-jsx-handler': 'error',
};

export const spacingTokenRuleSet = {
  '@nxds/canonical-spacing-steps': 'error',
};

export function nexusComponentConfig(options = {}) {
  const { files } = options;

  return {
    ...(files ? { files } : {}),
    plugins: {
      '@nxds': plugin,
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
      '@nxds': plugin,
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
