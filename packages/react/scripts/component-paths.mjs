/*
 * component-paths.mjs — canonical layout of the source directories that hold
 * first-party Nexus components.
 *
 * Imported by audit-storybook-coverage.mjs to resolve component files by
 * kebab name and honor the optional `sourceDir` field in
 * storybook-coverage.config.json.
 * One source of truth — keeps the two scripts from drifting silently.
 */

export const COMPONENT_SUBDIRS = ['ui', 'primitives'];
export const APPEARANCE_SOURCE_DIR = 'appearance';
export const COMPONENT_SOURCE_DIRS = [
  ...COMPONENT_SUBDIRS,
  APPEARANCE_SOURCE_DIR,
];

/*
 * Subdirs using the per-component folder layout: each component lives in
 * `{subdir}/{kebab}/` alongside its stories and an index.ts barrel. Subdirs
 * not listed here stay flat (`{subdir}/{kebab}.tsx`). `primitives` is flat
 * because Show/Hide share `responsive-visibility.ts` at the subdir root.
 */
export const NESTED_SUBDIRS = new Set(['ui']);

/** PascalCase or kebab-case → kebab-case (idempotent on kebab input). */
export function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Directory segment (relative to a components root) that holds a component's
 * files, honouring the subdir's layout. `name` may be Pascal or kebab.
 * Nested: `{subdir}/{kebab}`. Flat: `{subdir}`.
 */
export function componentDirSegment(subdir, name) {
  if (subdir === APPEARANCE_SOURCE_DIR) return '';
  return NESTED_SUBDIRS.has(subdir) ? `${subdir}/${toKebab(name)}` : subdir;
}

export function sourceRootSegment(sourceDir) {
  return sourceDir === APPEARANCE_SOURCE_DIR ? 'appearance' : 'components';
}
