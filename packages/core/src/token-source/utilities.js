// @ts-check

/** @typedef {import('./format.js').CssDeclaration} CssDeclaration */

/**
 * One generated `@utility` rule.
 * @typedef {object} UtilityRule
 * @property {string} name - The utility name without the `nx:` prefix
 * @property {CssDeclaration[]} declarations - The rule body, in order
 */

const BORDER_WIDTH_SIDES = /** @type {const} */ ([
  ['', 'border-style', 'border-width'],
  ['x-', 'border-inline-style', 'border-inline-width'],
  ['y-', 'border-block-style', 'border-block-width'],
  ['t-', 'border-top-style', 'border-top-width'],
  ['r-', 'border-right-style', 'border-right-width'],
  ['b-', 'border-bottom-style', 'border-bottom-width'],
  ['l-', 'border-left-style', 'border-left-width'],
  ['s-', 'border-inline-start-style', 'border-inline-start-width'],
  ['e-', 'border-inline-end-style', 'border-inline-end-width'],
  ['bs-', 'border-block-start-style', 'border-block-start-width'],
  ['be-', 'border-block-end-style', 'border-block-end-width'],
]);

/**
 * The per-side `border-width-*` alias utilities one border width emits:
 * `border-width-default`, `border-width-x-default`, … `border-width-be-default`.
 * The `border-{side?}-{key}` spellings are Tailwind's own utilities, built from
 * the `--border-width-{key}` theme key.
 *
 * @param {string} key - The border width key, e.g. `default`
 * @returns {UtilityRule[]}
 */
export function borderWidthAliasUtilities(key) {
  const value = `var(--nx-borderwidth-${key})`;
  return BORDER_WIDTH_SIDES.map(([side, styleProperty, widthProperty]) => ({
    name: `border-width-${side}${key}`,
    declarations: [
      { property: styleProperty, value: 'var(--tw-border-style, solid)' },
      { property: widthProperty, value },
    ],
  }));
}

/**
 * The utility a motion duration emits. Tailwind v4 does not codegen named
 * `duration-*` utilities from theme variables, so each is explicit.
 *
 * @param {string} key - The duration key, e.g. `fast`
 * @returns {UtilityRule}
 */
export function durationUtility(key) {
  const value = `var(--nx-motion-duration-${key})`;
  return {
    name: `duration-${key}`,
    declarations: [
      { property: '--tw-duration', value },
      { property: 'transition-duration', value },
    ],
  };
}

/**
 * The motion tokens emitted as Tailwind's `--default-transition-duration` and
 * `--default-transition-timing-function`.
 */
export const DEFAULT_TRANSITION = /** @type {const} */ ({
  duration: 'default',
  ease: 'enter',
});

/** Registry `border-*` colours that get a `border-color-*` utility, in emit order. */
export const BORDER_COLOR_ALIAS_NAMES = /** @type {const} */ ([
  'default',
  'default-alpha',
  'active',
  'disabled',
  'warning',
  'warning-active',
  'success',
  'success-active',
  'error',
  'error-active',
  'information',
  'information-active',
  'primary',
  'primary-active',
]);
