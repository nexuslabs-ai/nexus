import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import plugin from '../src/index.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser },
});

const rule = plugin.rules['no-render-prop-types'];

ruleTester.run('no-render-prop-types', rule, {
  valid: [
    'interface P { children: React.ReactNode }',
    'interface P { onClick: () => void }',
    // Event-handler-named props are exempt even if they return JSX.
    'interface P { onRender: () => ReactNode }',
    'type P = { title: string; count: number }',
    // A third-party API mandates the shape.
    `type P = {
      /** @thirdPartyShape react-day-picker renders each day. */
      renderDay: () => ReactNode;
    }`,
  ],
  invalid: [
    {
      code: 'interface P { renderItem: () => ReactNode }',
      errors: [{ messageId: 'renderCallback' }],
    },
    // The tag needs a reason.
    {
      code: `type P = {
        /** @thirdPartyShape */
        renderDay: () => ReactNode;
      }`,
      errors: [{ messageId: 'renderCallback' }],
    },
    {
      code: 'interface P { item: () => JSX.Element }',
      errors: [{ messageId: 'renderCallback' }],
    },
    {
      code: 'interface P { as: React.ComponentType }',
      errors: [{ messageId: 'componentAsProp' }],
    },
    {
      code: 'type P = { icon: FC }',
      errors: [{ messageId: 'componentAsProp' }],
    },
    {
      // A plain doc comment without the tag doesn't exempt the prop.
      code: 'type P = { /** Renders the day. */ renderDay: () => ReactNode }',
      errors: [{ messageId: 'renderCallback' }],
    },
    {
      code: 'interface P { thing: ComponentType | undefined }',
      errors: [{ messageId: 'componentAsProp' }],
    },
  ],
});
