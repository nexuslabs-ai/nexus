/*
 * component-paths.mjs — canonical list of subdirectories under
 * packages/react/src/components/ that hold first-party Nexus components.
 *
 * Imported by both audit-storybook-coverage.mjs (resolves component files by
 * kebab name) and generate-base-variants.mjs (validates the optional
 * `sourceDir` field in base-variants.config.json). One list, one source of
 * truth — keeps the two scripts from drifting silently.
 */

export const COMPONENT_SUBDIRS = ['ui', 'primitives'];
