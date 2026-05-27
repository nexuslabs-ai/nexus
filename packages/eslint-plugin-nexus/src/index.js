import canonicalSpacingSteps from './rules/canonical-spacing-steps.js';
import preferRoleUtilities from './rules/prefer-role-utilities.js';

const plugin = {
  meta: {
    name: '@nexus/eslint-plugin',
    version: '0.0.1',
  },
  rules: {
    'canonical-spacing-steps': canonicalSpacingSteps,
    'prefer-role-utilities': preferRoleUtilities,
  },
};

export default plugin;
export const { rules } = plugin;
