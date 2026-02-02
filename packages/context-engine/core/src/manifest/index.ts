/**
 * Manifest Module
 *
 * Exports ManifestBuilder and related types for combining
 * extracted data and generated metadata into complete manifests.
 */

export {
  derivePackageName,
  generateImportStatement,
  type ImportGeneratorOptions,
} from './import-generator.js';
export { ManifestBuilder } from './manifest-builder.js';
export {
  type ManifestBuilderConfig,
  type ManifestBuilderInput,
  type ManifestBuilderResult,
  type ManifestIdentity,
  type ManifestUpdateInput,
} from './types.js';
