/**
 * Search Schemas
 *
 * Request and response schemas for component search.
 * These power the natural language search capabilities for AI assistants.
 * Supports semantic (vector), keyword (full-text), and hybrid (both with RRF fusion) modes.
 */

import { z } from '@hono/zod-openapi';

import { FrameworkEnum } from './components.js';
import { OrgIdPathParamSchema } from './organizations.js';

// =============================================================================
// Enums / Constants
// =============================================================================

/**
 * Search mode selection.
 * Controls how the search query is processed:
 * - semantic: Vector similarity search using embeddings
 * - keyword: Full-text search using PostgreSQL tsvector
 * - hybrid: Combines both with Reciprocal Rank Fusion (RRF)
 */
export const SearchModeEnum = z
  .enum(['semantic', 'keyword', 'hybrid'])
  .openapi({
    example: 'hybrid',
    description:
      'Search mode: semantic (vector), keyword (full-text), or hybrid (both with RRF fusion)',
  });

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * Search request body.
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
    mode: SearchModeEnum.default('hybrid').openapi({
      description: 'Search mode selection (default: hybrid)',
    }),
  })
  .openapi('SearchRequest');

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
 * Includes search execution metadata for AI consumers to understand
 * how results were retrieved.
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
      meta: z
        .object({
          searchMode: SearchModeEnum.openapi({
            description: 'The search mode that was used',
          }),
          semanticCount: z.number().int().optional().openapi({
            description: 'Number of semantic results (hybrid mode only)',
          }),
          keywordCount: z.number().int().optional().openapi({
            description: 'Number of keyword results (hybrid mode only)',
          }),
        })
        .openapi({
          description: 'Search execution metadata',
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

export type SearchMode = z.infer<typeof SearchModeEnum>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
