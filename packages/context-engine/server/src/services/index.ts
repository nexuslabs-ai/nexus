/**
 * Services
 *
 * Re-exports all service classes for convenient imports.
 */

export { ComponentResolver } from './component-resolver.js';
export {
  EmbeddingProcessor,
  type ProcessorConfig,
} from './embedding-processor.js';
export {
  ProcessingService,
  processingService,
  type ProcessingServiceConfig,
} from './processing-service.js';
export {
  type FusedSearchResult,
  type HybridSearchResult,
  type SearchOptions,
  SearchService,
  type UnifiedSearchResult,
} from './search-service.js';
