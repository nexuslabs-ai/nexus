/**
 * API Request/Response Types
 *
 * Types for Context Engine API endpoints.
 * Follows REST conventions with consistent response envelopes.
 */

import { z } from 'zod';

import {
  EmbeddingStatusSchema,
  EmbeddingStatusSummarySchema,
} from './embedding.js';
import {
  FrameworkSchema,
  TierSchema,
  VersionSchema,
  VisibilitySchema,
} from './identity.js';
import {
  ComponentManifestSchema,
  CreateManifestInputSchema,
  ManifestSummarySchema,
  UpdateManifestInputSchema,
} from './manifest.js';

/**
 * Pagination parameters
 */
export const PaginationParamsSchema = z.object({
  /** Page number (1-indexed) */
  page: z.coerce.number().int().min(1).default(1),

  /** Items per page */
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

/**
 * Pagination metadata in responses
 */
export const PaginationMetaSchema = z.object({
  /** Current page */
  page: z.number().int().min(1),

  /** Items per page */
  limit: z.number().int().min(1),

  /** Total items */
  total: z.number().int().min(0),

  /** Total pages */
  totalPages: z.number().int().min(0),

  /** Has next page */
  hasNext: z.boolean(),

  /** Has previous page */
  hasPrev: z.boolean(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Standard success response envelope
 */
export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.string(), z.unknown()).optional(),
  });

/**
 * Paginated response envelope
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: PaginationMetaSchema,
  });

// ============================================
// Component Endpoints
// ============================================

/**
 * GET /components - List components
 */
export const ListComponentsQuerySchema = PaginationParamsSchema.extend({
  /** Filter by framework */
  framework: FrameworkSchema.optional(),

  /** Filter by tier */
  tier: TierSchema.optional(),

  /** Filter by visibility */
  visibility: VisibilitySchema.optional(),

  /** Filter by embedding status */
  embeddingStatus: EmbeddingStatusSchema.optional(),

  /** Search by name */
  search: z.string().optional(),

  /** Sort field */
  sortBy: z.enum(['name', 'updatedAt', 'createdAt']).default('updatedAt'),

  /** Sort direction */
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListComponentsQuery = z.infer<typeof ListComponentsQuerySchema>;

export const ListComponentsResponseSchema = PaginatedResponseSchema(
  ManifestSummarySchema
);

export type ListComponentsResponse = z.infer<
  typeof ListComponentsResponseSchema
>;

/**
 * GET /components/:identifier - Get single component
 */
export const GetComponentParamsSchema = z.object({
  /** Component identifier (UUID, slug, or name) */
  identifier: z.string(),
});

export type GetComponentParams = z.infer<typeof GetComponentParamsSchema>;

export const GetComponentQuerySchema = z.object({
  /** Version to retrieve (defaults to latest) */
  version: VersionSchema.optional(),
});

export type GetComponentQuery = z.infer<typeof GetComponentQuerySchema>;

export const GetComponentResponseSchema = SuccessResponseSchema(
  ComponentManifestSchema
);

export type GetComponentResponse = z.infer<typeof GetComponentResponseSchema>;

/**
 * POST /components - Create component
 */
export const CreateComponentBodySchema = CreateManifestInputSchema;

export type CreateComponentBody = z.infer<typeof CreateComponentBodySchema>;

export const CreateComponentResponseSchema = SuccessResponseSchema(
  ComponentManifestSchema
);

export type CreateComponentResponse = z.infer<
  typeof CreateComponentResponseSchema
>;

/**
 * PATCH /components/:identifier - Update component
 */
export const UpdateComponentParamsSchema = z.object({
  identifier: z.string(),
});

export type UpdateComponentParams = z.infer<typeof UpdateComponentParamsSchema>;

export const UpdateComponentBodySchema = UpdateManifestInputSchema;

export type UpdateComponentBody = z.infer<typeof UpdateComponentBodySchema>;

export const UpdateComponentResponseSchema = SuccessResponseSchema(
  ComponentManifestSchema
);

export type UpdateComponentResponse = z.infer<
  typeof UpdateComponentResponseSchema
>;

/**
 * DELETE /components/:identifier - Delete component
 */
export const DeleteComponentParamsSchema = z.object({
  identifier: z.string(),
});

export type DeleteComponentParams = z.infer<typeof DeleteComponentParamsSchema>;

export const DeleteComponentResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    deleted: z.boolean(),
    id: z.uuid(),
  }),
});

export type DeleteComponentResponse = z.infer<
  typeof DeleteComponentResponseSchema
>;

// ============================================
// Search Endpoints
// ============================================

/**
 * POST /search - Semantic search
 */
export const SearchBodySchema = z.object({
  /** Natural language query */
  query: z.string().min(1).max(1000),

  /** Maximum results to return */
  limit: z.number().int().min(1).max(50).default(10),

  /** Filter by framework */
  framework: FrameworkSchema.optional(),

  /** Filter by tier */
  tier: TierSchema.optional(),

  /** Filter by patterns */
  patterns: z.array(z.string()).optional(),

  /** Minimum similarity score (0-1) */
  minScore: z.number().min(0).max(1).default(0.5),
});

export type SearchBody = z.infer<typeof SearchBodySchema>;

/**
 * Search result item
 */
export const SearchResultItemSchema = ManifestSummarySchema.extend({
  /** Similarity score (0-1) */
  score: z.number().min(0).max(1),

  /** Matched chunk type */
  matchedChunk: z.string().optional(),

  /** Highlight snippet */
  highlight: z.string().optional(),
});

export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

export const SearchResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(SearchResultItemSchema),
  meta: z.object({
    query: z.string(),
    totalResults: z.number().int().min(0),
  }),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ============================================
// Context Bundle Endpoints
// ============================================

/**
 * POST /context - Get context bundle for AI
 */
export const GetContextBodySchema = z.object({
  /** Component identifiers to include */
  components: z.array(z.string()).min(1).max(20),

  /** Include related components */
  includeRelated: z.boolean().default(true),

  /** Maximum context size in tokens (approximate) */
  maxTokens: z.number().int().min(100).max(100000).default(8000),

  /** Output format */
  format: z.enum(['markdown', 'json', 'xml']).default('markdown'),
});

export type GetContextBody = z.infer<typeof GetContextBodySchema>;

export const GetContextResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    /** Formatted context for AI */
    context: z.string(),

    /** Components included */
    components: z.array(z.string()),

    /** Approximate token count */
    tokenCount: z.number().int().min(0),

    /** Format used */
    format: z.enum(['markdown', 'json', 'xml']),
  }),
});

export type GetContextResponse = z.infer<typeof GetContextResponseSchema>;

// ============================================
// Stats Endpoints
// ============================================

/**
 * GET /stats - Get organization stats
 */
export const GetStatsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    /** Total component count */
    totalComponents: z.number().int().min(0),

    /** Components by framework */
    byFramework: z.record(FrameworkSchema, z.number().int().min(0)),

    /** Components by tier */
    byTier: z.record(TierSchema, z.number().int().min(0)),

    /** Embedding status summary */
    embeddingStatus: EmbeddingStatusSummarySchema,

    /** Storage usage in bytes */
    storageBytes: z.number().int().min(0),
  }),
});

export type GetStatsResponse = z.infer<typeof GetStatsResponseSchema>;

// ============================================
// Webhook Types (for async operations)
// ============================================

/**
 * Webhook event types
 */
export const WebhookEventTypeSchema = z.enum([
  'component.created',
  'component.updated',
  'component.deleted',
  'embedding.completed',
  'embedding.failed',
]);

export type WebhookEventType = z.infer<typeof WebhookEventTypeSchema>;

/**
 * Webhook payload
 */
export const WebhookPayloadSchema = z.object({
  /** Event type */
  event: WebhookEventTypeSchema,

  /** Event timestamp */
  timestamp: z.string(),

  /** Organization ID */
  orgId: z.uuid(),

  /** Event data */
  data: z.record(z.string(), z.unknown()),
});

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
