/**
 * Search Routes
 *
 * Component search endpoint supporting semantic (vector), keyword (full-text),
 * and hybrid (RRF fusion) modes. Powers AI assistants to discover relevant
 * components from the component library.
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { serviceUnavailable } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import {
  ErrorSchema,
  SearchParamsSchema,
  SearchRequestSchema,
  SearchResponseSchema,
} from '../schemas/index.js';
import { SearchService } from '../services/index.js';
import type { AppEnv } from '../types.js';
import { successResponse } from '../utils/index.js';

/**
 * Search router.
 *
 * Requires repositories middleware to be applied at app level.
 * Delegates all search modes to SearchService for transport-agnostic execution.
 */
export const searchRouter = new OpenAPIHono<AppEnv>();

// =============================================================================
// POST / - Search Components
// =============================================================================

const searchRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Search'],
  summary: 'Search components',
  description:
    'Search for components using natural language queries. Supports semantic (vector), keyword (full-text), and hybrid (RRF fusion) modes.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:read')],
  request: {
    params: SearchParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: SearchRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: SearchResponseSchema } },
      description: 'Search results ordered by relevance',
    },
    503: {
      content: { 'application/json': { schema: ErrorSchema } },
      description:
        'Embedding service not configured (required for semantic/hybrid modes)',
    },
  },
});

searchRouter.openapi(searchRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');

  // Embedding repo is only required for semantic and hybrid search modes.
  // Keyword search uses PostgreSQL full-text search and does not need embeddings.
  if (
    !c.var.embeddingRepo &&
    (body.mode === 'semantic' || body.mode === 'hybrid')
  ) {
    throw serviceUnavailable(
      'Embedding service not configured',
      'VOYAGE_API_KEY is required for semantic and hybrid search. Use mode=keyword as fallback.'
    );
  }

  // Create search service and delegate to unified search method
  const searchService = new SearchService(
    c.var.componentRepo,
    c.var.embeddingRepo!
  );

  const result = await searchService.search(orgId, body.query, {
    mode: body.mode,
    limit: body.limit,
    minScore: body.minScore,
    framework: body.framework,
  });

  // Format for HTTP response
  return c.json(
    successResponse({
      results: result.results,
      total: result.results.length,
      query: body.query,
      meta: result.meta,
    }),
    200
  );
});
