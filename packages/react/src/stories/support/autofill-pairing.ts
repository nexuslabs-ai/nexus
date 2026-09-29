/**
 * The `bg-*` / `text-*` classes on a field that have no `autofill-*` class of
 * the same token in the same state, so browser autofill paint would win there.
 */
export function unpairedAutofillClasses(field: HTMLElement) {
  const classes = [...field.classList];
  return classes.filter((className) => {
    const match = className.match(/^(nx:(?:[^:]+:)*)(bg|text)-(.+)$/);
    if (!match) return false;
    const [, scope = '', kind, token] = match;
    // File-button and placeholder colours are not part of the autofill paint.
    if (/(file|placeholder):/.test(scope)) return false;
    return !classes.includes(`${scope}autofill-${kind}-${token}`);
  });
}
