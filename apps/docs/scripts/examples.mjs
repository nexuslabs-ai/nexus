// @ts-check

/** The demo under `examples/{slug}/` that a component page shows as Preview and Code. */
export const PREVIEW_DEMO = 'demo';

export const DEMO_EXTENSION = '.tsx';

/** @param {string} segment */
export function isDemoName(segment) {
  return !segment.startsWith('_');
}

/** Packages every React app already has, so no install block lists them. */
export const ALWAYS_INSTALLED = new Set(['react', 'react-dom']);

/** Local imports a pasted demo resolves to files the install block copies. */
export const COPIED_PREFIX = '@/';

const IMPORT_PATTERNS = [
  /^\s*(?:import|export)\s+(?:[^'";()]*?\s+from\s+)?['"]([^'"]+)['"]/gm,
  /\bimport\(\s*['"]([^'"]+)['"]/g,
];

/** @param {string} source */
export function importSpecifiers(source) {
  return IMPORT_PATTERNS.flatMap((pattern) =>
    [...source.matchAll(pattern)].map(([, specifier]) => specifier)
  );
}

/** @param {string} specifier */
export function packageName(specifier) {
  const segments = specifier.split('/');
  if (specifier.startsWith('@')) return segments.slice(0, 2).join('/');
  return segments[0];
}
