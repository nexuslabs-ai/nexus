// @ts-check

/** The demo under `examples/{slug}/` that a component page shows as Preview and Code. */
export const PREVIEW_DEMO = 'demo';

export const DEMO_EXTENSION = '.tsx';

/** @param {string} segment */
export function isDemoName(segment) {
  return !segment.startsWith('_');
}
