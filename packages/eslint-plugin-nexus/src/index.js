import canonicalSpacingSteps from './rules/canonical-spacing-steps.js';
import noMultiStatementJsxHandler from './rules/no-multi-statement-jsx-handler.js';
import noRenderPropTypes from './rules/no-render-prop-types.js';
import nxClassConventions from './rules/nx-class-conventions.js';
import preferRoleUtilities from './rules/prefer-role-utilities.js';

const plugin = {
  meta: {
    name: '@nexus/eslint-plugin',
    version: '0.0.1',
  },
  rules: {
    'canonical-spacing-steps': canonicalSpacingSteps,
    'prefer-role-utilities': preferRoleUtilities,
    'nx-class-conventions': nxClassConventions,
    'no-render-prop-types': noRenderPropTypes,
    'no-multi-statement-jsx-handler': noMultiStatementJsxHandler,
  },
};

export default plugin;
export const { rules } = plugin;
