/**
 * Search Routes
 *
 * Semantic search endpoint for finding components using natural language queries.
 * Powers AI assistants to discover relevant components from the component library.
 */

import {
  ComponentRepository,
  createEmbeddingRepository,
  getDatabase,
} from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { ServiceUnavailable } from '../errors.js';
import {
  ErrorSchema,
  SearchParamsSchema,
  SearchRequestSchema,
  SearchResponseSchema,
  type SearchResult,
} from '../schemas/index.js';

export const searchRouter = new OpenAPIHono();

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
  request: {
    params: SearchParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: SearchRequestSchema,
        },
      },
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

  // Perform semantic search using embedding repository
  // Note: createEmbeddingRepository() will throw if VOYAGE_API_KEY is not set
  let embeddingRepo;
  try {
    embeddingRepo = createEmbeddingRepository();
  } catch (error) {
    // VOYAGE_API_KEY not configured
    throw ServiceUnavailable(
      'Search service unavailable',
      error instanceof Error ? error.message : undefined
    );
  }

  const results = await embeddingRepo.search(orgId, body.query, {
    limit: body.limit,
    minScore: body.minScore,
    framework: body.framework,
  });

  // Build response with framework information
  // Note: The db SearchResult type doesn't include framework, but the schema requires it.
  // When a framework filter is provided, all results have that framework.
  // Otherwise, we fetch each component's framework (bounded by search limit).
  let resultsWithFramework: SearchResult[];

  if (body.framework) {
    // If filtered by framework, all results have that framework
    const framework = body.framework; // Capture to avoid type narrowing issues
    resultsWithFramework = results.map((r) => ({
      componentId: r.componentId,
      slug: r.slug,
      name: r.name,
      description: r.description,
      framework,
      score: r.score,
    }));
  } else if (results.length > 0) {
    // Fetch component frameworks individually
    // This is bounded by the search limit (max 50), so acceptable for now.
    // TODO: Optimize by updating db SearchResult to include framework.
    const componentRepo = new ComponentRepository(getDatabase());
    resultsWithFramework = await Promise.all(
      results.map(async (r) => {
        const component = await componentRepo.findById(orgId, r.componentId);
        return {
          componentId: r.componentId,
          slug: r.slug,
          name: r.name,
          description: r.description,
          framework: component?.framework ?? 'react',
          score: r.score,
        };
      })
    );
  } else {
    resultsWithFramework = [];
  }

  return c.json(
    {
      success: true as const,
      data: {
        results: resultsWithFramework,
        total: resultsWithFramework.length,
        query: body.query,
      },
    },
    200 as const
  );
});
