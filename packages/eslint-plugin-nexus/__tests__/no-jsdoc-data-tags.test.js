import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import plugin from '../src/index.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { parser: tseslint.parser },
});

const rule = plugin.rules['no-jsdoc-data-tags'];

ruleTester.run('no-jsdoc-data-tags', rule, {
  valid: [
    `interface ButtonProps {
      /** Shows a spinner and disables the button. */
      loading?: boolean;
    }`,
    // Only JSDoc blocks carry tags; line and plain block comments are prose.
    '// @default is read from code now\nconst size = "default";',
    '/* @example is not a JSDoc block */\nconst x = 1;',
    // A tag name inside prose is not a tag.
    `/** Defaults come from code, so no @defaults tag is needed. */
    const y = 1;`,
    '/** Write to support@default.dev for help. */\nconst z = 1;',
  ],
  invalid: [
    {
      code: `interface TabsListProps {
        /**
         * Visual style of every trigger in the list.
         * @default "default"
         */
        variant?: 'default' | 'underline';
      }`,
      errors: [{ messageId: 'default', line: 4, column: 12 }],
    },
    {
      code: `/**
 * Joins buttons into one cluster.
 * @example
 * <ButtonGroup><Button>One</Button></ButtonGroup>
 */
function ButtonGroup() {}`,
      errors: [{ messageId: 'example', line: 3, column: 4 }],
    },
    {
      code: '/** @default false */\nconst inset = undefined;',
      errors: [{ messageId: 'default', line: 1, column: 5 }],
    },
    {
      code: '/** Size of the trigger. @default "md" */\nconst size = "md";',
      errors: [{ messageId: 'default', line: 1, column: 26 }],
    },
    {
      code: '/**@example <Badge /> */\nfunction Badge() {}',
      errors: [{ messageId: 'example', line: 1, column: 4 }],
    },
    {
      code: `/**
 * @default 'start'
 * @example
 * <Message align="end" />
 */
const align = 'start';`,
      errors: [{ messageId: 'default' }, { messageId: 'example' }],
    },
  ],
});
