/**
 * Search Routes
 *
 * Semantic search endpoint for finding components using natural language queries.
 * Powers AI assistants to discover relevant components from the component library.
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { serviceUnavailable } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import {
  ErrorSchema,
  SearchParamsSchema,
  SearchRequestSchema,
  SearchResponseSchema,
  type SearchResult,
} from '../schemas/index.js';
import type { AppEnv } from '../types.js';
import { successResponse } from '../utils/index.js';

/**
 * Search router.
 *
 * Requires repositories middleware to be applied at app level.
 * Access embedding repository via `c.var.embeddingRepo`.
 *
 * Note: embeddingRepo is undefined if VOYAGE_API_KEY is not configured.
 */
export const searchRouter = new OpenAPIHono<AppEnv>();

// =============================================================================
// POST / - Semantic Search
// =============================================================================

const searchRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Search'],
  summary: 'Search components',
  description:
    'Semantic search for components using natural language queries. Requires VOYAGE_API_KEY to be configured for embedding generation.',
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
      description: 'Search service unavailable (VOYAGE_API_KEY not configured)',
    },
  },
});

searchRouter.openapi(searchRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');

  // Get embedding repository from context
  // Note: embeddingRepo is undefined if VOYAGE_API_KEY is not configured
  const embeddingRepo = c.var.embeddingRepo;

  if (!embeddingRepo) {
    throw serviceUnavailable(
      'Search service unavailable',
      'VOYAGE_API_KEY environment variable is not configured'
    );
  }

  const results = await embeddingRepo.search(orgId, body.query, {
    limit: body.limit,
    minScore: body.minScore,
    framework: body.framework,
  });

  // Map results to response format
  const resultsWithFramework: SearchResult[] = results.map((r) => ({
    componentId: r.componentId,
    slug: r.slug,
    name: r.name,
    description: r.description,
    framework: r.framework,
    score: r.score,
  }));

  return c.json(
    successResponse({
      results: resultsWithFramework,
      total: resultsWithFramework.length,
      query: body.query,
    }),
    200
  );
});
