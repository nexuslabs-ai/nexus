import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import plugin from '../src/index.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

const rule = plugin.rules['nx-class-conventions'];

ruleTester.run('nx-class-conventions', rule, {
  valid: [
    // Correct prefix order + complete semantic paths.
    "const c = 'nx:hover:bg-primary-background';",
    "const c = 'nx:bg-primary-background nx:text-foreground';",
    "const c = 'nx:focus-visible:outline-focus-default';",
    // Template literal with an interpolation — quasis are still scanned.
    'const c = `nx:p-4 ${cond} nx:gap-2`;',
    // Non-nx classes are ignored.
    "const c = 'flex items-center gap-2';",
    // Live typography composites must not be flagged — negative guard for the
    // deadTypography check across the label / body / heading families.
    "const c = 'nx:typography-label-default';",
    "const c = 'nx:px-2 nx:py-1.5 nx:typography-body-default';",
    "const c = 'nx:typography-heading-xsmall';",
    // A typography-* substring without the nx: prefix (e.g. a filename) is ignored.
    "const path = '../tokens/typography/typography-vega.json';",
  ],
  invalid: [
    {
      code: "const c = 'hover:nx:bg-primary-background';",
      errors: [{ messageId: 'prefixOrder' }],
    },
    {
      code: "const c = 'nx:bg-accent';",
      errors: [{ messageId: 'bannedAccent' }],
    },
    {
      code: "const c = 'nx:hover:text-accent';",
      errors: [{ messageId: 'bannedAccent' }],
    },
    {
      code: "const c = 'nx:bg-primary';",
      errors: [{ messageId: 'incompletePath' }],
    },
    {
      code: "const c = 'nx:text-error';",
      errors: [{ messageId: 'incompletePath' }],
    },
    {
      code: "const c = 'nx:bg-blue-500';",
      errors: [{ messageId: 'rawPrimitive' }],
    },
    {
      code: "const c = 'nx:hover:bg-slate-100';",
      errors: [{ messageId: 'rawPrimitive' }],
    },
    // Modifiers beyond hover/active/focus must not evade the checks.
    {
      code: "const c = 'nx:disabled:bg-primary';",
      errors: [{ messageId: 'incompletePath' }],
    },
    {
      code: "const c = 'nx:group-hover:bg-accent';",
      errors: [{ messageId: 'bannedAccent' }],
    },
    {
      code: "const c = 'nx:aria-invalid:bg-blue-500';",
      errors: [{ messageId: 'rawPrimitive' }],
    },
    {
      code: 'const c = `nx:bg-blue-500 ${x}`;',
      errors: [{ messageId: 'rawPrimitive' }],
    },
    // Dead typography composites (removed by the #459 trim) render nothing.
    {
      code: "const c = 'nx:typography-label-large';",
      errors: [{ messageId: 'deadTypography' }],
    },
    {
      code: "const c = 'nx:px-2 nx:typography-body-xsmall nx:opacity-70';",
      errors: [{ messageId: 'deadTypography' }],
    },
    {
      code: "const c = 'nx:hover:typography-display-large';",
      errors: [{ messageId: 'deadTypography' }],
    },
  ],
});
