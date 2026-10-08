// @ts-check

/** The demo under `examples/{slug}/` that a component page shows as Preview and Code. */
export const PREVIEW_DEMO = 'demo';

export const DEMO_EXTENSION = '.tsx';

/** @param {string} segment */
export function isDemoName(segment) {
  return !segment.startsWith('_');
}

/** Example names every component page shows first, in this order. */
const LEADING_EXAMPLES = ['variants', 'fills', 'sizes', 'shapes', 'states'];

/** Example names every component page shows last, in this order. */
const TRAILING_EXAMPLES = ['disabled', 'invalid'];

/**
 * Leading names first, then every other name A–Z, then trailing names.
 * @param {string} name
 */
function exampleRank(name) {
  const leading = LEADING_EXAMPLES.indexOf(name);
  if (leading >= 0) return leading - LEADING_EXAMPLES.length;
  return TRAILING_EXAMPLES.indexOf(name) + 1;
}

/** @param {readonly string[]} names */
export function orderExamples(names) {
  return names.toSorted(
    (a, b) => exampleRank(a) - exampleRank(b) || a.localeCompare(b, 'en')
  );
}
