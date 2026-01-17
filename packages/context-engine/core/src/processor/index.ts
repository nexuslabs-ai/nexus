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

// Types
export type {
  ExtractionMetadata,
  ExtractOnlyFailure,
  ExtractOnlyOutput,
  ExtractOnlySuccess,
  GenerateOnlyInput,
  ProcessorConfig,
  ProcessorFailure,
  ProcessorInput,
  ProcessorMetrics,
  ProcessorOutput,
  ProcessorSuccess,
} from './types.js';

// Constants and type guards
export {
  isExtractOnlyFailure,
  isExtractOnlySuccess,
  isProcessorFailure,
  isProcessorSuccess,
  ProcessorErrorCode,
  ProcessorOutputType,
} from './types.js';
