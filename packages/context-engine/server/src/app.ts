/**
 * HTTP Server Application
 *
 * Assembles the Hono app with all routes, middleware, and OpenAPI documentation.
 */

import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { pinoLogger } from 'hono-pino';

import { Environment, getConfig } from './config.js';
import { ApiError } from './errors.js';
import { createServerLogger } from './logger.js';
import { mcpRouter } from './mcp/index.js';
import {
  authMiddleware,
  createCorsMiddleware,
  preAuthRateLimitMiddleware,
  rateLimitMiddleware,
  repositoriesMiddleware,
  requireOrgAccess,
} from './middleware/index.js';
import {
  apiKeysRouter,
  componentsRouter,
  healthRouter,
  organizationsRouter,
  processingRouter,
  reconciliationRouter,
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

  // === OpenAPI Security Scheme ===
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
    description: 'API key authentication. Format: Bearer ce_{key}',
  });

  // === Global Middleware ===
  // CORS must be registered before routes per Hono best practices
  const config = getConfig();

  // CORS middleware (validates origins, sets headers)
  // Configured from environment variables via cors/ module
  app.use(
    '*',
    createCorsMiddleware({
      allowedOrigins: config.corsAllowedOrigins,
      mcpMode: config.mcpCorsMode,
      environment: config.environment,
    })
  );

  // === Structured Logging ===
  // Request-scoped logger with method, path, status, duration.
  // Access via c.var.logger in handlers and middleware.
  const rootLogger = createServerLogger(config);

  app.use(
    pinoLogger({
      pino: rootLogger,
      http: {
        onResLevel: (c) => {
          if (c.res.status >= 500) return 'error';
          if (c.res.status >= 400) return 'warn';
          return 'info';
        },
        onReqBindings: (c) => ({
          req: {
            method: c.req.method,
            url: c.req.path,
          },
        }),
        onResBindings: (c) => ({
          res: {
            status: c.res.status,
          },
        }),
        responseTime: true,
      },
    })
  );

  // === Repository DI Middleware ===
  // Injects repositories into context for all API v1 routes
  // Access via c.var.organizationRepo, c.var.componentRepo, c.var.embeddingRepo
  app.use('/api/v1/*', repositoriesMiddleware);

  // === Pre-Auth Rate Limit ===
  // IP-based rate limiter (default 1000 req/min)
  app.use('/api/v1/*', preAuthRateLimitMiddleware);

  // === Auth Middleware ===
  // Validates API key from Authorization header and sets c.var.auth.
  // Supports two token types:
  //   - Tenant API keys (ce_ prefix): org-scoped, looked up in database
  //   - Platform token (cep_ prefix): cross-org admin, compared against config
  app.use('/api/v1/*', authMiddleware);

  // === Post-Auth Rate Limit ===
  // Per-tenant rate limiter keyed on authenticated identity
  app.use('/api/v1/*', rateLimitMiddleware);

  // === Org Access Middleware ===
  // Validates URL :orgId matches authenticated org for all org-scoped routes.
  // Platform tokens (cep_) are exempt — they operate across organizations.
  app.use('/api/v1/organizations/:orgId', requireOrgAccess);
  app.use('/api/v1/organizations/:orgId/*', requireOrgAccess);

  // === Health Routes (at root) ===
  // /health - liveness check
  // /ready - readiness check with database connectivity
  app.route('/', healthRouter);

  // === API v1 Routes ===

  // Organizations CRUD
  // GET/POST /api/v1/organizations
  // GET/PATCH/DELETE /api/v1/organizations/:orgId
  app.route('/api/v1/organizations', organizationsRouter);

  // Components CRUD (nested under organization)
  // Expects orgId in path: /api/v1/organizations/:orgId/components
  app.route('/api/v1/organizations/:orgId/components', componentsRouter);

  // Processing pipeline (nested under organization)
  // POST /api/v1/organizations/:orgId/processing/extract
  // POST /api/v1/organizations/:orgId/processing/generate
  // POST /api/v1/organizations/:orgId/processing/build
  app.route('/api/v1/organizations/:orgId/processing', processingRouter);

  // Semantic search (nested under organization)
  // POST /api/v1/organizations/:orgId/search
  app.route('/api/v1/organizations/:orgId/search', searchRouter);

  // API Key management
  // GET/POST /api/v1/organizations/:orgId/api-keys
  // DELETE /api/v1/organizations/:orgId/api-keys/:keyId
  app.route('/api/v1/organizations/:orgId/api-keys', apiKeysRouter);

  // Embedding reconciliation (nested under organization)
  // GET /api/v1/organizations/:orgId/reconciliation/status
  // POST /api/v1/organizations/:orgId/reconciliation/process-pending
  // POST /api/v1/organizations/:orgId/reconciliation/retry-failed
  // POST /api/v1/organizations/:orgId/reconciliation/force-reindex/:componentId
  // POST /api/v1/organizations/:orgId/reconciliation/migrate-embeddings
  app.route(
    '/api/v1/organizations/:orgId/reconciliation',
    reconciliationRouter
  );

  // MCP Gateway
  // Model Context Protocol endpoint for AI assistants.
  // Repository middleware + MCP router (handles auth, server creation, transport)
  app.use('/mcp', repositoriesMiddleware);
  app.route('/mcp', mcpRouter);

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
      {
        name: 'Processing',
        description: 'Component processing pipeline (extract, generate, build)',
      },
      { name: 'Search', description: 'Semantic component search' },
      { name: 'API Keys', description: 'API key management' },
      {
        name: 'Reconciliation',
        description: 'Embedding reconciliation and manual control',
      },
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
    c.var.logger.error(
      {
        err:
          err instanceof Error
            ? { message: err.message, stack: err.stack }
            : err,
      },
      'Unhandled server error'
    );
    const config = getConfig();
    const isDevelopment = config.environment === Environment.Development;

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
