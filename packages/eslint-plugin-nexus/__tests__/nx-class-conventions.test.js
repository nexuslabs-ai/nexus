import { RuleTester } from 'eslint';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

import plugin from '../src/index.js';
import { LIVE_TYPOGRAPHY } from '../src/rules/nx-class-conventions.js';

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
    // A modifier-prefixed live tier passes — the `(?:[\\w-]+:)*` branch must exempt
    // a valid composite, not just flag dead ones (cf. the invalid hover case below).
    "const c = 'nx:focus:typography-label-default';",
    // The code-* family is live too.
    "const c = 'nx:typography-code-block';",
    // Shortcut hint typography is a live one-level composite.
    "const c = 'nx:ml-auto nx:typography-shortcut nx:text-muted-foreground';",
    // Text alignment, wrapping, arbitrary values, and colours are not font-size
    // utilities and must stay legal.
    "const c = 'nx:text-center';",
    "const c = 'nx:text-wrap';",
    "const c = 'nx:text-balance';",
    "const c = 'nx:text-ellipsis';",
    "const c = 'nx:text-[clamp(1rem,2vw,3rem)]';",
    "const c = 'nx:text-muted-foreground';",
    "const c = 'nx:text-foreground';",
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
    {
      code: "const c = 'nx:text-sm nx:text-muted-foreground';",
      errors: [{ messageId: 'rawFontSize' }],
    },
    {
      code: "const c = 'nx:group-hover:text-2xl';",
      errors: [{ messageId: 'rawFontSize' }],
    },
    {
      code: "const c = 'nx:text-sm nx:bg-primary';",
      errors: [{ messageId: 'incompletePath' }, { messageId: 'rawFontSize' }],
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

// Drift guard: assert the rule's hardcoded LIVE_TYPOGRAPHY stays 1:1 with the
// emitted `@utility typography-*` set, so a dropped tier can't go un-flagged.
// Reads the committed CSS — safe at test time, unlike the rule, which must not
// read it at lint time (it may be unbuilt then).
describe('LIVE_TYPOGRAPHY drift guard', () => {
  it('stays 1:1 with the emitted @utility typography-* set', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const css = fs.readFileSync(
      path.resolve(dir, '../../tailwind/typography-utilities.css'),
      'utf8'
    );
    const emitted = [...css.matchAll(/@utility typography-([a-z-]+) \{/g)].map(
      (m) => m[1]
    );

    expect([...emitted].sort()).toEqual([...LIVE_TYPOGRAPHY].sort());
  });
});
