/**
 * HTTP Server Application
 *
 * Assembles the Hono app with all routes, middleware, and OpenAPI documentation.
 */

import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { getConfig } from './config.js';
import { ApiError } from './errors.js';
import { repositoriesMiddleware } from './middleware/index.js';
import {
  componentsRouter,
  healthRouter,
  organizationsRouter,
  searchRouter,
} from './routes/index.js';
import type { AppEnv } from './types.js';

/**
 * Create and configure the HTTP server application.
 *
 * Sets up:
 * - Global middleware (CORS, logging)
 * - Health check routes at root
 * - API v1 routes for organizations, components, and search
 * - OpenAPI documentation at /doc and /ui
 * - Error handlers for 404 and 500
 */
export function createApp() {
  const app = new OpenAPIHono<AppEnv>();

  // === Global Middleware ===
  // CORS must be registered before routes per Hono best practices
  app.use('*', cors());
  app.use('*', logger());

  // === Repository DI Middleware ===
  // Injects repositories into context for all API v1 routes
  // Access via c.var.organizationRepo, c.var.componentRepo, c.var.embeddingRepo
  app.use('/api/v1/*', repositoriesMiddleware);

  // === Health Routes (at root) ===
  // /health - liveness check
  // /ready - readiness check with database connectivity
  app.route('/', healthRouter);

  // === API v1 Routes ===

  // Organizations CRUD
  // GET/POST /api/v1/organizations
  // GET/PATCH/DELETE /api/v1/organizations/:id
  app.route('/api/v1/organizations', organizationsRouter);

  // Components CRUD (nested under organization)
  // Expects orgId in path: /api/v1/organizations/:orgId/components
  app.route('/api/v1/organizations/:orgId/components', componentsRouter);

  // Semantic search (nested under organization)
  // POST /api/v1/organizations/:orgId/search
  app.route('/api/v1/organizations/:orgId/search', searchRouter);

  // === OpenAPI Documentation ===
  app.doc('/doc', {
    openapi: '3.1.0',
    info: {
      title: 'Context Engine API',
      version: '0.1.0',
      description:
        'API for managing design system component metadata. Makes components AI-accessible through semantic search and structured metadata.',
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Organizations', description: 'Organization management' },
      { name: 'Components', description: 'Component CRUD operations' },
      { name: 'Search', description: 'Semantic component search' },
    ],
  });

  // Swagger UI at /ui, reads spec from /doc
  app.get('/ui', swaggerUI({ url: '/doc' }));

  // === Error Handlers ===

  // 404 Not Found handler
  app.notFound((c) => {
    return c.json(
      {
        success: false as const,
        error: {
          code: 'NOT_FOUND',
          message: `Route not found: ${c.req.method} ${c.req.path}`,
        },
      },
      404
    );
  });

  // Global error handler
  app.onError((err, c) => {
    // Handle our custom API errors
    if (err instanceof ApiError) {
      return c.json(
        {
          success: false as const,
          error: {
            code: err.code,
            message: err.message,
            ...(err.details !== undefined && { details: err.details }),
          },
        },
        err.status
      );
    }

    // Handle unknown errors
    console.error('[Server Error]', err);
    const config = getConfig();
    const isDevelopment = config.environment === 'development';

    return c.json(
      {
        success: false as const,
        error: {
          code: 'INTERNAL_ERROR',
          message: isDevelopment ? err.message : 'Internal server error',
        },
      },
      500
    );
  });

  return app;
}

/**
 * App type for use in tests and server entry point.
 */
export type App = ReturnType<typeof createApp>;
