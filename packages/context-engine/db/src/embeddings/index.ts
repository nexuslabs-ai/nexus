/**
 * Embeddings Module Exports
 *
 * Re-exports chunk generation and embedding service functionality
 * for semantic search over component manifests.
 */

export { generateChunks } from './chunk-generator.js';
export {
  createEmbeddingServiceFromEnv,
  EmbeddingService,
} from './embedding-service.js';
