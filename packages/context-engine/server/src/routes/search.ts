/**
 * Search Routes
 *
 * Component search endpoint supporting semantic (vector), keyword (full-text),
 * and hybrid (RRF fusion) modes. Powers AI assistants to discover relevant
 * components from the component library.
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { requireScope } from '../middleware/auth.js';
import {
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
  },
});

searchRouter.openapi(searchRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');

  const componentRepo = c.var.componentRepo;
  const embeddingRepo = c.var.embeddingRepo!;
  const searchService = new SearchService(componentRepo, embeddingRepo);

  const searchOptions = {
    limit: body.limit,
    minScore: body.minScore,
    framework: body.framework,
  };

  switch (body.mode) {
    case 'keyword': {
      const results = await searchService.searchKeyword(
        orgId,
        body.query,
        searchOptions
      );

      return c.json(
        successResponse({
          results: results.map((r) => ({
            componentId: r.componentId,
            slug: r.slug,
            name: r.name,
            description: r.description,
            framework: r.framework,
            score: r.score,
          })),
          total: results.length,
          query: body.query,
          meta: { searchMode: body.mode },
        }),
        200
      );
    }

    case 'semantic': {
      const results = await searchService.searchSemantic(
        orgId,
        body.query,
        searchOptions
      );

      return c.json(
        successResponse({
          results: results.map((r) => ({
            componentId: r.componentId,
            slug: r.slug,
            name: r.name,
            description: r.description,
            framework: r.framework,
            score: r.score,
          })),
          total: results.length,
          query: body.query,
          meta: { searchMode: body.mode },
        }),
        200
      );
    }

    case 'hybrid':
    default: {
      const hybridResult = await searchService.searchHybrid(
        orgId,
        body.query,
        searchOptions
      );

      return c.json(
        successResponse({
          results: hybridResult.results.map((r) => ({
            componentId: r.componentId,
            slug: r.slug,
            name: r.name,
            description: r.description,
            framework: r.framework,
            score: r.rrfScore,
          })),
          total: hybridResult.results.length,
          query: body.query,
          meta: {
            searchMode: hybridResult.meta.searchMode,
            semanticCount: hybridResult.meta.semanticCount,
            keywordCount: hybridResult.meta.keywordCount,
          },
        }),
        200
      );
    }
  }
});
