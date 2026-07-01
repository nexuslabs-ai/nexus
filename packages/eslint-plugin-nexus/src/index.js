import { createRequire } from 'node:module';

import canonicalSpacingSteps from './rules/canonical-spacing-steps.js';
import noMultiStatementJsxHandler from './rules/no-multi-statement-jsx-handler.js';
import noRenderPropTypes from './rules/no-render-prop-types.js';
import nxClassConventions from './rules/nx-class-conventions.js';

// Derive from package.json so ESLint's --cache / --print-config, which key off
// meta.version, don't desync when changesets bumps the published version.
const { name, version } = createRequire(import.meta.url)('../package.json');

const plugin = {
  meta: { name, version },
  rules: {
    'canonical-spacing-steps': canonicalSpacingSteps,
    'nx-class-conventions': nxClassConventions,
    'no-render-prop-types': noRenderPropTypes,
    'no-multi-statement-jsx-handler': noMultiStatementJsxHandler,
  },
};

export default plugin;
export const { rules } = plugin;
