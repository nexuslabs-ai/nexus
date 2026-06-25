/*
 * component-paths.mjs — canonical layout of the subdirectories under
 * packages/react/src/components/ that hold first-party Nexus components.
 *
 * Imported by both audit-storybook-coverage.mjs (resolves component files by
 * kebab name) and generate-base-variants.mjs (validates the optional
 * `sourceDir` field in base-variants.config.json and builds import paths).
 * One source of truth — keeps the two scripts from drifting silently.
 */

export const COMPONENT_SUBDIRS = ['ui', 'primitives'];

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
  return NESTED_SUBDIRS.has(subdir) ? `${subdir}/${toKebab(name)}` : subdir;
}
