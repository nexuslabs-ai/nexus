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

// =============================================================================
// Chunk Types
// =============================================================================

/**
 * Types of chunks a component manifest is split into for embedding.
 * Each chunk type represents a semantic section of component metadata.
 *
 * @remarks
 * - `description` - Name, description, base library information
 * - `import` - How to import the component (import statements, package path)
 * - `props` - Props with valueDescriptions for understanding configuration options
 * - `composition` - SubComponents for compound components (e.g., Dialog.Title, Dialog.Content)
 * - `examples` - Usage examples showing the component in action
 * - `patterns` - Common patterns, related components, and component relationships
 * - `guidance` - When to use, accessibility considerations, best practices
 */
export type ChunkType =
  | 'description'
  | 'import'
  | 'props'
  | 'composition'
  | 'examples'
  | 'patterns'
  | 'guidance';

/**
 * A chunk of component content for embedding.
 * Components are split into semantic chunks for better retrieval accuracy.
 */
export interface Chunk {
  /** The type of content this chunk represents */
  type: ChunkType;
  /** The text content of the chunk */
  content: string;
  /** Sequence index within the chunk type (for ordering) */
  index: number;
}

// =============================================================================
// Search Types
// =============================================================================

/**
 * Search result from semantic search.
 * Represents a component that matched a search query.
 */
export interface SearchResult {
  /** Component UUID */
  componentId: string;
  /** URL-friendly identifier */
  slug: string;
  /** Human-readable component name */
  name: string;
  /** Component description (may be null) */
  description: string | null;
  /** Target framework (e.g., 'react', 'vue') */
  framework: string;
  /** Similarity score (0-1, higher is more relevant) */
  score: number;
}

/**
 * Options for semantic search queries.
 */
export interface SearchOptions {
  /** Maximum results to return (default: 10) */
  limit?: number;
  /** Minimum similarity score threshold (0-1, default: 0) */
  minScore?: number;
  /** Filter results by framework (e.g., 'react', 'vue') */
  framework?: string;
}

// =============================================================================
// Index Types
// =============================================================================

/**
 * Result of indexing a component for semantic search.
 * Returned after generating chunks and embeddings for a component.
 */
export interface IndexResult {
  /** Whether indexing completed successfully */
  success: boolean;
  /** The component that was indexed */
  componentId: string;
  /** Number of chunks created for this component */
  chunksCreated: number;
  /** Error message if indexing failed */
  error?: string;
}
