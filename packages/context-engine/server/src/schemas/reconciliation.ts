/**
 * Reconciliation Schemas
 *
 * Request and response schemas for embedding reconciliation endpoints.
 * These endpoints provide manual control over the embedding indexing process.
 */

import { z } from '@hono/zod-openapi';

import { EmbeddingStatusEnum } from './components.js';

// =============================================================================
// Path Parameter Schemas
// =============================================================================

/**
 * Path parameters for force-reindex endpoint.
 */
export const ForceReindexParamsSchema = z
  .object({
    orgId: z
      .string()
      .uuid()
      .openapi({
        param: {
          name: 'orgId',
          in: 'path',
          required: true,
        },
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Organization UUID',
      }),
    componentId: z
      .string()
      .uuid()
      .openapi({
        param: {
          name: 'componentId',
          in: 'path',
          required: true,
        },
        example: '123e4567-e89b-12d3-a456-426614174001',
        description: 'Component UUID to force reindex',
      }),
  })
  .openapi('ForceReindexParams');

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Request body for process-pending endpoint.
 */
export const ProcessPendingRequestSchema = z
  .object({
    batchSize: z.coerce.number().int().min(1).max(100).default(10).openapi({
      example: 10,
      description: 'Maximum number of components to process (1-100)',
    }),
  })
  .openapi('ProcessPendingRequest');

/**
 * Request body for migrate-embeddings endpoint.
 */
export const MigrateEmbeddingsRequestSchema = z
  .object({
    batchSize: z.coerce.number().int().min(1).max(100).default(50).openapi({
      example: 50,
      description:
        'Maximum number of components to queue for migration (1-100)',
    }),
  })
  .openapi('MigrateEmbeddingsRequest');

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Embedding status counts response.
 * Returns counts for each embedding status.
 */
export const ReconciliationStatusSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      pending: z.number().int().openapi({
        example: 3,
        description: 'Components awaiting embedding',
      }),
      processing: z.number().int().openapi({
        example: 0,
        description: 'Components currently being embedded',
      }),
      indexed: z.number().int().openapi({
        example: 12,
        description: 'Successfully embedded components',
      }),
      failed: z.number().int().openapi({
        example: 1,
        description: 'Components that failed embedding',
      }),
      total: z.number().int().openapi({
        example: 16,
        description: 'Total components',
      }),
    }),
  })
  .openapi('ReconciliationStatus');

/**
 * Process pending components response.
 * Returns counts of processed, succeeded, and failed components.
 */
export const ProcessPendingResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      processed: z.number().int().openapi({
        example: 3,
        description: 'Number of components processed',
      }),
      succeeded: z.number().int().openapi({
        example: 2,
        description: 'Number of components successfully indexed',
      }),
      failed: z.number().int().openapi({
        example: 1,
        description: 'Number of components that failed',
      }),
    }),
  })
  .openapi('ProcessPendingResponse');

/**
 * Retry failed components response.
 * Returns count of components reset from failed to pending.
 */
export const RetryFailedResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      reset: z.number().int().openapi({
        example: 1,
        description: 'Number of failed components reset to pending',
      }),
    }),
  })
  .openapi('RetryFailedResponse');

/**
 * Force reindex component response.
 * Returns result of forcing a component to be reindexed.
 */
export const ForceReindexResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      componentId: z.string().uuid().openapi({
        example: '123e4567-e89b-12d3-a456-426614174001',
        description: 'Component UUID that was reindexed',
      }),
      chunksCreated: z.number().int().openapi({
        example: 5,
        description: 'Number of embedding chunks created',
      }),
      embeddingStatus: EmbeddingStatusEnum.openapi({
        example: 'indexed',
        description: 'Updated embedding status',
      }),
    }),
  })
  .openapi('ForceReindexResponse');

/**
 * Migrate embeddings response.
 * Returns count of components queued for re-embedding with new model.
 */
export const MigrateEmbeddingsResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      queued: z.number().int().openapi({
        example: 8,
        description: 'Number of components queued for migration',
      }),
      currentModel: z.string().openapi({
        example: 'voyage-code-3',
        description: 'Current embedding model',
      }),
      outdatedComponents: z.number().int().openapi({
        example: 8,
        description: 'Total components with outdated embeddings',
      }),
    }),
  })
  .openapi('MigrateEmbeddingsResponse');
