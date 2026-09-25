// @ts-check

/** The demo under `examples/{slug}/` that a component page shows as Preview and Code. */
export const PREVIEW_DEMO = 'demo';

/** Extension of a demo file under `examples/`. */
export const DEMO_EXTENSION = '.tsx';

/**
 * Whether a path segment under `examples/` can be part of a demo id; `_`-prefixed ones are skipped.
 *
 * @param {string} segment
 */
export function isDemoName(segment) {
  return !segment.startsWith('_');
}
