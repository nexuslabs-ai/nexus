/**
 * Embedding Types
 *
 * Tracks the lifecycle of component embeddings for vector search.
 * Includes embedding model versioning for future migrations.
 */

import { z } from 'zod';

/**
 * Embedding status enum
 *
 * Flow: pending → processing → indexed
 *                    ↓
 *                 failed → pending (retry)
 */
export const EmbeddingStatusSchema = z.enum([
  'pending', // Manifest saved, awaiting embedding
  'processing', // Embedding generation in progress
  'indexed', // Fully searchable via vector store
  'failed', // Embedding failed, can be retried
]);

export type EmbeddingStatus = z.infer<typeof EmbeddingStatusSchema>;

/**
 * Supported embedding providers
 */
export const EmbeddingProviderSchema = z.enum(['voyage', 'openai']);

export type EmbeddingProvider = z.infer<typeof EmbeddingProviderSchema>;

/**
 * Embedding model info (for future model migrations)
 *
 * @stable This is critical for handling embedding model changes.
 * Storing the model version enables gradual re-indexing when models change.
 */
export const EmbeddingModelInfoSchema = z.object({
  /** Embedding provider */
  provider: EmbeddingProviderSchema,

  /** Model identifier (e.g., "voyage-code-3") */
  model: z.string(),

  /** Model version/date (e.g., "2024-01") */
  version: z.string(),

  /** Embedding dimensions */
  dimensions: z.number().int().positive(),
});

export type EmbeddingModelInfo = z.infer<typeof EmbeddingModelInfoSchema>;

/**
 * Default embedding model configuration
 */
export const DEFAULT_EMBEDDING_MODEL: EmbeddingModelInfo = {
  provider: 'voyage',
  model: 'voyage-code-3',
  version: '2024-01',
  dimensions: 1024,
};

/**
 * Extended embedding status with metadata
 */
export const EmbeddingStatusInfoSchema = z.object({
  /** Current status */
  status: EmbeddingStatusSchema,

  /** When embedding was last attempted */
  lastAttempt: z.iso.datetime().optional(),

  /** When embedding was successfully indexed */
  indexedAt: z.iso.datetime().optional(),

  /** Number of retry attempts */
  retryCount: z.number().int().min(0).default(0),

  /** Error message if failed */
  error: z.string().optional(),

  /** Model used for this embedding */
  embeddingModel: EmbeddingModelInfoSchema.optional(),
});

export type EmbeddingStatusInfo = z.infer<typeof EmbeddingStatusInfoSchema>;

/**
 * Embedding status summary for stats
 */
export const EmbeddingStatusSummarySchema = z.object({
  pending: z.number().int().min(0),
  processing: z.number().int().min(0),
  indexed: z.number().int().min(0),
  failed: z.number().int().min(0),
  total: z.number().int().min(0),
});

export type EmbeddingStatusSummary = z.infer<
  typeof EmbeddingStatusSummarySchema
>;

/**
 * Embedding queue entry (for background processing)
 */
export const EmbeddingQueueEntrySchema = z.object({
  componentId: z.uuid(),
  orgId: z.string(),
  priority: z.number().int().min(0).max(10).default(5),
  scheduledAt: z.iso.datetime(),
  attempts: z.number().int().min(0).default(0),
});

export type EmbeddingQueueEntry = z.infer<typeof EmbeddingQueueEntrySchema>;

/**
 * Embedding chunk types for different content sections
 */
export const EmbeddingChunkTypeSchema = z.enum([
  'description', // Component description
  'props', // Props documentation
  'examples', // Usage examples
  'patterns', // Design patterns
  'guidance', // When to use / not use
]);

export type EmbeddingChunkType = z.infer<typeof EmbeddingChunkTypeSchema>;
