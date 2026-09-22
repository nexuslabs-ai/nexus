import { RuleTester } from 'eslint';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

import plugin from '../src/index.js';
import {
  LIVE_TYPOGRAPHY,
  RAW_FONT_WEIGHTS,
  RAW_LETTER_SPACINGS,
} from '../src/rules/nx-class-conventions.js';

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
    "const path = '../tokens/typography/typography-default.json';",
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
    // Font families are still legal; the raw typography guard targets weight,
    // line-height, and tracking utilities that bypass the composite scale.
    "const c = 'nx:font-mono nx:tabular-nums';",
    // The raw typography guard is runtime-scoped. Stories and docs remain useful
    // demo surfaces, but are not part of this hard gate.
    {
      code: "const c = 'nx:font-medium nx:leading-none nx:tracking-wide';",
      filename: '/repo/packages/react/src/components/table/Table.stories.tsx',
    },
    {
      code: "const c = 'nx:font-semibold nx:tracking-wider';",
      filename: '/repo/apps/docs/app/page.tsx',
    },
    // Avatar initials inherit diameter-driven text size from the root variant;
    // this stays a narrow exception until there is an Avatar-specific typography
    // token that preserves that relationship.
    {
      code: "const c = 'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none';",
      filename: '/repo/packages/react/src/components/avatar/avatar.tsx',
    },
    {
      code: "const c = 'nx:text-foreground nx:font-mono nx:font-medium nx:tabular-nums';",
      filename: '/repo/packages/react/src/components/chart/chart.tsx',
    },
    // `transition-colors` is legal on a surface that paints no ring — menu rows
    // take the popover tint instead.
    "const c = 'nx:transition-colors nx:focus:bg-popover-hover';",
    // A ring surface on one of the two ring-safe utilities is the fixed shape.
    "const c = 'nx:transition-control nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';",
    "const c = cva(['nx:transition-field', 'nx:focus-visible:outline-default']);",
    // The pair must actually share a scope — two unrelated class strings do not.
    "const a = 'nx:transition-colors'; const b = 'nx:focus-visible:outline-2';",
    // A bare array is a list of per-item class strings, not one attribute.
    "const c = ['nx:transition-colors', 'nx:focus-visible:outline-2'];",
    // `outline-none` / `outline-hidden` / `outline-offset-*` paint no ring, so
    // there is nothing for `transition-colors` to fade — InputGroup's inner
    // control ships exactly this suppression.
    "const c = cn('nx:transition-colors nx:bg-transparent', 'nx:focus-visible:outline-none');",
    "const c = 'nx:transition-colors nx:focus-visible:outline-hidden';",
    "const c = 'nx:transition-colors nx:focus-visible:outline-offset-2';",
    // Stories and docs quote utilities as specimens, like the other checks.
    {
      code: "const c = 'nx:transition-colors nx:focus-visible:outline-2';",
      filename: '/repo/packages/react/src/components/input/Input.stories.tsx',
    },
    {
      code: "const c = 'nx:transition-colors nx:focus-visible:outline-2';",
      filename: '/repo/apps/docs/app/_pages/foundations/focus.tsx',
    },
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
    {
      code: "const c = 'nx:font-medium';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:data-[today=true]:font-semibold';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:**:font-medium';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:**:[[cmdk-group-heading]]:font-semibold';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:[&[data-state=open]]:font-bold';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:has-[[role=checkbox]]:font-medium';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:group-has-[[role=checkbox]]:font-semibold';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:@md/field-group:font-medium';",
      errors: [{ messageId: 'rawFontWeight' }],
    },
    {
      code: "const c = 'nx:leading-none';",
      errors: [{ messageId: 'rawLineHeight' }],
    },
    {
      code: "const c = 'nx:group-hover:leading-[1.1]';",
      errors: [{ messageId: 'rawLineHeight' }],
    },
    {
      code: "const c = 'nx:not-has-[>[data-align^=block]]:leading-tight';",
      errors: [{ messageId: 'rawLineHeight' }],
    },
    {
      code: "const c = 'nx:tracking-wide';",
      errors: [{ messageId: 'rawLetterSpacing' }],
    },
    {
      code: 'const c = `nx:tracking-[0.14em] ${x}`;',
      errors: [{ messageId: 'rawLetterSpacing' }],
    },
    {
      code: "const c = 'nx:has-[[data-slot=input-group-control]:focus-visible]:tracking-wide';",
      errors: [{ messageId: 'rawLetterSpacing' }],
    },
    {
      code: "const c = 'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none nx:tracking-wide';",
      filename: '/repo/packages/react/src/components/avatar/avatar.tsx',
      errors: [
        { messageId: 'rawFontWeight' },
        { messageId: 'rawLineHeight' },
        { messageId: 'rawLetterSpacing' },
      ],
    },
    {
      code: "const c = 'nx:text-foreground nx:font-mono nx:font-medium nx:tabular-nums nx:tracking-wide';",
      filename: '/repo/packages/react/src/components/chart/chart.tsx',
      errors: [
        { messageId: 'rawFontWeight' },
        { messageId: 'rawLetterSpacing' },
      ],
    },
    {
      code: "const c = 'nx:text-sm nx:font-medium nx:leading-tight';",
      errors: [
        { messageId: 'rawFontSize' },
        { messageId: 'rawFontWeight' },
        { messageId: 'rawLineHeight' },
      ],
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
    // `transition-colors` carries `outline-color`, so it fades the ring in.
    {
      code: "const c = 'nx:transition-colors nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';",
      errors: [{ messageId: 'ringFadingTransition' }],
    },
    // A `cva([...])` array is one class string, so the pair is caught across
    // elements — which is the shape every field surface is written in.
    {
      code: "const c = cva(['nx:rounded-md nx:transition-colors', 'nx:focus-visible:outline-default nx:focus-visible:border-focus-default']);",
      errors: [{ messageId: 'ringFadingTransition' }],
    },
    // A `cva()` base and a `variants` value land on the same element too.
    {
      code: "const c = cva('nx:transition-colors', { variants: { variant: { solid: 'nx:focus-visible:outline-2' } } });",
      errors: [{ messageId: 'ringFadingTransition' }],
    },
    // So do two `cn()` arguments.
    {
      code: "const c = cn('nx:transition-colors', 'nx:focus-visible:outline-2');",
      errors: [{ messageId: 'ringFadingTransition' }],
    },
    {
      code: 'const c = `nx:transition-colors ${x} nx:focus-visible:outline-2`;',
      errors: [{ messageId: 'ringFadingTransition' }],
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

describe('raw typography guard drift checks', () => {
  it('keeps raw font-weight names aligned with the typography primitive tokens', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const tokens = JSON.parse(
      fs.readFileSync(
        path.resolve(
          dir,
          '../../core/tokens/primitives/typography/typography-default.json'
        ),
        'utf8'
      )
    );

    expect([...Object.keys(tokens.weight)].sort()).toEqual(
      [...RAW_FONT_WEIGHTS].sort()
    );
  });

  it('keeps raw letter-spacing names aligned with the typography primitive tokens', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const tokens = JSON.parse(
      fs.readFileSync(
        path.resolve(
          dir,
          '../../core/tokens/primitives/typography/typography-default.json'
        ),
        'utf8'
      )
    );

    expect([...Object.keys(tokens.letterspacing)].sort()).toEqual(
      [...RAW_LETTER_SPACINGS].sort()
    );
  });
});
