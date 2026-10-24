import { expect } from 'storybook/test';

/**
 * Asserts every `bg-*` / `text-*` class on a field has an `autofill-*` class of
 * the same token in the same state, so browser autofill paint never wins.
 */
export async function expectAutofillPaired(field: HTMLElement) {
  const classes = [...field.classList];
  const unpaired = classes.filter((className) => {
    const match = className.match(/^(nx:(?:[^:]+:)*)(bg|text)-(.+)$/);
    if (!match) return false;
    const [, scope = '', kind, token] = match;
    // File-button and placeholder colours are not part of the autofill paint.
    if (/(file|placeholder):/.test(scope)) return false;
    return !classes.includes(`${scope}autofill-${kind}-${token}`);
  });
  await expect(unpaired).toEqual([]);
}
