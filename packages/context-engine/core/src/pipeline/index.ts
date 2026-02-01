/**
 * Pipeline Module
 *
 * High-level API for the extraction-generation-build pipeline
 * with optional persistent state storage.
 *
 * @example
 * ```typescript
 * import {
 *   Pipeline,
 *   FileStateStore,
 *   type PipelineConfig,
 * } from '@context-engine/core/pipeline';
 *
 * // In-memory mode
 * const pipeline = Pipeline.create();
 * const result = await pipeline.process(input);
 *
 * // Persistent mode
 * const store = new FileStateStore('./state');
 * const pipeline = Pipeline.createWithStore(config, store);
 * await pipeline.extractAndSave(input);
 * ```
 */

// State store implementation
export { FileStateStore } from './file-state-store.js';

// Main Pipeline class
export { Pipeline } from './pipeline.js';

// State store interface
export type { IPipelineStateStore } from './state-store.js';

// Types
export type {
  PipelineConfig,
  StoredExtraction,
  StoredGeneration,
  StoredManifest,
} from './types.js';
