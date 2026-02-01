/**
 * Processor Module
 *
 * Exports ComponentProcessor and related types for orchestrating
 * the full extraction-generation-build pipeline.
 */

// Main processor
export {
  ComponentProcessor,
  createComponentProcessor,
} from './component-processor.js';

// =============================================================================
// Types
// =============================================================================

export type {
  // Build phase
  BuildInput,
  BuildOutput,
  // Extraction phase
  ExtractFailure,
  ExtractOutput,
  ExtractSuccess,
  // Generation phase
  GenerateFailure,
  GenerateInput,
  GenerateOutput,
  GenerateSuccess,
} from './types.js';

// Type guards
export {
  isExtractFailure,
  isExtractSuccess,
  isGenerateFailure,
  isGenerateSuccess,
} from './types.js';

// =============================================================================
// Common Types (Shared across APIs)
// =============================================================================

export type {
  ExtractionMetadata,
  ProcessorConfig,
  ProcessorFailure,
  ProcessorInput,
  ProcessorMetrics,
  ProcessorOutput,
  ProcessorSuccess,
} from './types.js';

// Constants and common type guards
export {
  isProcessorFailure,
  isProcessorSuccess,
  ProcessorErrorCode,
  ProcessorOutputType,
} from './types.js';
