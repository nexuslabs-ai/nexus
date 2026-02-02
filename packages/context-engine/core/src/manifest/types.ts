/**
 * Manifest Builder Types
 *
 * Types for combining extracted data and generated metadata
 * into a complete ComponentManifest.
 *
 * The build() method throws ManifestBuildError on failure.
 */

import type {
  ComponentManifest,
  ComponentMeta,
  ExtractedData,
  ManifestIdentity,
  ManifestOutput,
} from '../types/index.js';

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

  /**
   * List of component names that exist in the design system.
   * Used to filter LLM-generated relatedComponents to prevent
   * hallucinated component names.
   *
   * If not provided, all relatedComponents from the LLM are kept.
   * Format: PascalCase component names (e.g., ['Button', 'Card', 'Input'])
   */
  availableComponents?: string[];
}

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
 * Manifest build result (success only - throws ManifestBuildError on failure)
 */
export interface ManifestBuilderResult {
  /** Complete manifest output with split structure */
  output: ManifestOutput;

  /** Legacy: full manifest for internal use */
  manifest: ComponentManifest;

  /** Build timestamp */
  builtAt: string;
}

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
