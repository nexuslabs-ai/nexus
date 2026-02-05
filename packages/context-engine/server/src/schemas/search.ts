/**
 * Search Schemas
 *
 * Request and response schemas for semantic component search.
 * These power the natural language search capabilities for AI assistants.
 */

import { z } from '@hono/zod-openapi';

import { FrameworkEnum } from './components.js';
import { OrgIdPathParamSchema } from './organizations.js';

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Semantic search request body.
 * Used by AI assistants to find relevant components.
 */
export const SearchRequestSchema = z
  .object({
    query: z
      .string()
      .min(1, 'Search query is required')
      .max(500, 'Search query must be 500 characters or less')
      .openapi({
        example: 'button with loading state',
        description: 'Natural language search query',
      }),
    limit: z.number().int().min(1).max(50).default(10).openapi({
      example: 10,
      description: 'Maximum number of results to return (1-50)',
    }),
    minScore: z.number().min(0).max(1).optional().openapi({
      example: 0.7,
      description: 'Minimum similarity score threshold (0-1)',
    }),
    framework: FrameworkEnum.optional().openapi({
      description: 'Filter results by framework',
    }),
  })
  .openapi('SearchRequest');

/**
 * Search query parameters (for GET requests).
 * Alternative to POST body for simple searches.
 */
export const SearchQuerySchema = z
  .object({
    q: z
      .string()
      .min(1, 'Search query is required')
      .max(500, 'Search query must be 500 characters or less')
      .openapi({
        example: 'modal dialog',
        description: 'Natural language search query',
      }),
    limit: z.coerce.number().int().min(1).max(50).default(10).openapi({
      example: 10,
      description: 'Maximum number of results',
    }),
    minScore: z.coerce.number().min(0).max(1).optional().openapi({
      example: 0.7,
      description: 'Minimum similarity score',
    }),
    framework: FrameworkEnum.optional().openapi({
      description: 'Filter by framework',
    }),
  })
  .openapi('SearchQuery');

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Individual search result.
 * Provides enough context for AI to evaluate relevance.
 */
export const SearchResultSchema = z
  .object({
    componentId: z.string().uuid().openapi({
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Component UUID',
    }),
    slug: z.string().openapi({
      example: 'button',
      description: 'URL-friendly identifier',
    }),
    name: z.string().openapi({
      example: 'Button',
      description: 'Human-readable component name',
    }),
    description: z.string().nullable().openapi({
      example: 'A clickable button component for user interactions',
      description: 'Component description (from manifest)',
    }),
    framework: z.string().openapi({
      example: 'react',
      description: 'Component framework',
    }),
    score: z.number().openapi({
      example: 0.92,
      description: 'Similarity score (0-1, higher is more relevant)',
    }),
  })
  .openapi('SearchResult');

/**
 * Search response with results and metadata.
 */
export const SearchResponseSchema = z
  .object({
    success: z.literal(true).openapi({ example: true }),
    data: z.object({
      results: z.array(SearchResultSchema).openapi({
        description: 'Matching components ranked by relevance',
      }),
      total: z.number().int().openapi({
        example: 5,
        description: 'Number of results returned',
      }),
      query: z.string().openapi({
        example: 'button with loading state',
        description: 'The query that was searched',
      }),
    }),
  })
  .openapi('SearchResponse');

// =============================================================================
// Parameter Schemas
// =============================================================================

/**
 * Search endpoint path parameters.
 * Search is scoped to an organization.
 */
export const SearchParamsSchema = OrgIdPathParamSchema;

// =============================================================================
// Type Exports
// =============================================================================

export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
