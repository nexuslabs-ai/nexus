/**
 * Processor Module
 *
 * Exports ComponentProcessor and related types for orchestrating
 * the full extraction-generation-build pipeline.
 *
 * All methods throw on error - no discriminated unions.
 */

// Main processor
export {
  ComponentProcessor,
  createComponentProcessor,
} from './component-processor.js';

// Re-export FileStateStore for consumers who want to use persistent storage
export { FileStateStore } from './file-state-store.js';

// =============================================================================
// Types
// =============================================================================

export type {
  // Build phase
  BuildInput,
  BuildResult,
  // Extraction phase
  ExtractResult,
  // Generation phase
  GenerateInput,
  GenerateResult,
} from './types.js';

// =============================================================================
// Common Types (Shared across APIs)
// =============================================================================

export type {
  ExtractionMetadata,
  ProcessorConfig,
  ProcessorInput,
  ProcessorResult,
} from './types.js';

// =============================================================================
// State Store Types (for persistent storage)
// =============================================================================

export type {
  StoredComponentState,
  StoredExtraction,
  StoredGeneration,
  StoredManifest,
} from './types.js';

// =============================================================================
// Manifest Builder Types (for build() return type)
// =============================================================================

export type { ManifestBuilderResult } from '../manifest/index.js';
