/**
 * Database Types
 *
 * Type definitions for database-specific structures.
 * These types are used in JSONB columns and repository interfaces.
 */

// =============================================================================
// Embedding Types
// =============================================================================

/**
 * Information about the embedding model used for a component.
 * Stored as JSONB to allow flexibility for different providers.
 */
export interface EmbeddingModelInfo {
  /** Embedding provider (e.g., 'voyage', 'openai') */
  provider: string;

  /** Model identifier (e.g., 'voyage-3', 'text-embedding-3-small') */
  model: string;

  /** Model dimensions (e.g., 1024 for voyage-3) */
  dimensions?: number;
}

// =============================================================================
// Embedding Status
// =============================================================================

/**
 * Possible embedding statuses for a component
 */
export type EmbeddingStatus = 'pending' | 'processing' | 'indexed' | 'failed';
