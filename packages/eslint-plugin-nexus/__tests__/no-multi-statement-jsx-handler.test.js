import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import plugin from '../src/index.js';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const rule = plugin.rules['no-multi-statement-jsx-handler'];

ruleTester.run('no-multi-statement-jsx-handler', rule, {
  valid: [
    'const x = <button onClick={() => doThing()} />;',
    'const x = <button onClick={() => setOpen(true)} />;',
    'const x = <button onClick={handleClick} />;',
    // Two statements is within the inline budget.
    'const x = <button onClick={() => { a(); b(); }} />;',
    // Expression body calling a mutation with a callback object is fine inline.
    'const x = <button onClick={() => mutate(input)} />;',
  ],
  invalid: [
    {
      code: 'const x = <button onClick={() => { a(); b(); c(); }} />;',
      errors: [{ messageId: 'tooManyStatements' }],
    },
    {
      code: 'const x = <button onClick={() => { mutate(input, { onSuccess: () => {} }); }} />;',
      errors: [{ messageId: 'nestedCallback' }],
    },
  ],
});
