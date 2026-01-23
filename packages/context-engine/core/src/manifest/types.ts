/**
 * Manifest Builder Types
 *
 * Types for combining extracted data and generated metadata
 * into a complete ComponentManifest.
 */

import type {
  ComponentManifest,
  ComponentMeta,
  ExtractedData,
  ManifestIdentity,
} from '../types/index.js';
import { OutputType } from '../types/output.js';

// Re-export ManifestIdentity for backwards compatibility
export type { ManifestIdentity } from '../types/index.js';

/**
 * Configuration for ManifestBuilder
 */
export interface ManifestBuilderConfig {
  /**
   * Default package name to use when import detection fails.
   * This is used as a fallback when no design system package
   * can be derived from the component's dependencies.
   *
   * @default '@nexus/react'
   */
  defaultPackageName?: string;
}

/**
 * Build output discriminant
 *
 * Uses shared OutputType for consistency across modules.
 */
export const ManifestBuildOutputType = OutputType;

/**
 * Input for building a manifest
 *
 * Combines:
 * - Organization context (orgId)
 * - Component identity (id, slug, name, framework)
 * - Extracted data from HybridExtractor
 * - Generated metadata from MetaGenerator
 * - Source tracking (sourceHash, version)
 */
export interface ManifestBuilderInput {
  /** Organization ID for multi-org isolation */
  orgId: string;

  /** Component identity */
  identity: ManifestIdentity;

  /** Extracted data from code analysis */
  extracted: ExtractedData;

  /** Generated metadata from LLM */
  meta: ComponentMeta;

  /** Hash of source code for change detection */
  sourceHash: string;

  /** Semantic version (defaults to "0.0.1") */
  version?: string;
}

/**
 * Successful manifest build output
 */
export interface ManifestBuilderSuccess {
  /** Discriminant for type narrowing */
  type: typeof ManifestBuildOutputType.Success;

  /** Complete component manifest */
  manifest: ComponentManifest;

  /** Build timestamp */
  builtAt: string;
}

/**
 * Failed manifest build output
 */
export interface ManifestBuilderFailure {
  /** Discriminant for type narrowing */
  type: typeof ManifestBuildOutputType.Failure;

  /** Error message */
  error: string;

  /** Field that caused the failure (if applicable) */
  field?: string;
}

/**
 * Manifest build output union
 */
export type ManifestBuilderOutput =
  | ManifestBuilderSuccess
  | ManifestBuilderFailure;

/**
 * Input for updating an existing manifest
 */
export interface ManifestUpdateInput {
  /** Fields to update from new extraction */
  extracted?: ExtractedData;

  /** Fields to update from new generation */
  meta?: ComponentMeta;

  /** New source hash */
  sourceHash?: string;

  /** New version */
  version?: string;
}

/**
 * Type guard for successful manifest build
 */
export function isManifestBuildSuccess(
  output: ManifestBuilderOutput
): output is ManifestBuilderSuccess {
  return output.type === ManifestBuildOutputType.Success;
}

/**
 * Type guard for failed manifest build
 */
export function isManifestBuildFailure(
  output: ManifestBuilderOutput
): output is ManifestBuilderFailure {
  return output.type === ManifestBuildOutputType.Failure;
}
