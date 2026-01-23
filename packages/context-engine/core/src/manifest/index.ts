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
  isManifestBuildFailure,
  isManifestBuildSuccess,
  type ManifestBuilderFailure,
  type ManifestBuilderInput,
  type ManifestBuilderOutput,
  type ManifestBuilderSuccess,
  ManifestBuildOutputType,
  type ManifestIdentity,
  type ManifestUpdateInput,
} from './types.js';
