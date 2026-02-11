/**
 * Manifest Builder Types
 *
 * Types for combining extracted data and generated metadata
 * into a complete manifest.
 *
 * The build() method throws ManifestBuildError on failure.
 */

import type {
  AIManifest,
  ComponentMeta,
  ExtractedData,
  ManifestIdentity,
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
}

/**
 * Input for building a manifest
 *
 * Combines:
 * - Organization context (orgId)
 * - Component identity (id, slug, name, framework)
 * - Extracted data from HybridExtractor
 * - Generated metadata from MetaGenerator
 * - Source tracking (sourceHash)
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

  /** Component names in the design system for filtering relatedComponents */
  availableComponents?: string[];
}

/**
 * Manifest build result (success only - throws ManifestBuildError on failure)
 *
 * Flat structure matching ManifestOutput. DB layer adds its own fields
 * (timestamps, versioning, embedding status) separately.
 */
export interface ManifestBuilderResult {
  /** Component name (PascalCase) */
  componentName: string;

  /** Component identity (id, slug, name, framework) */
  identity: ManifestIdentity;

  /** AI-focused manifest (optimized for consumption) */
  manifest: AIManifest;

  /** Hash of source code for change detection */
  sourceHash: string;

  /** Source files used for extraction */
  files: string[];

  /** Build timestamp */
  builtAt: string;
}
