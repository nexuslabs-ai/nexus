/**
 * Health Routes
 *
 * Health and readiness check endpoints for the Context Engine server.
 * These endpoints are used by orchestration systems (Kubernetes, load balancers)
 * to determine server availability.
 */

import { checkHealth } from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { getConfig } from '../config.js';
import { SERVER_VERSION } from '../constants.js';
import { HealthSchema, ReadySchema } from '../schemas/index.js';

export const healthRouter = new OpenAPIHono();

// =============================================================================
// GET /health - Liveness Check
// =============================================================================

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Health check',
  description: 'Returns server health status. Use for liveness probes.',
  responses: {
    200: {
      content: { 'application/json': { schema: HealthSchema } },
      description: 'Server is healthy',
    },
  },
});

healthRouter.openapi(healthRoute, (c) => {
  const config = getConfig();
  return c.json({
    status: 'ok' as const,
    version: SERVER_VERSION,
    environment: config.environment,
  });
});

// =============================================================================
// GET /ready - Readiness Check
// =============================================================================

const readyRoute = createRoute({
  method: 'get',
  path: '/ready',
  tags: ['Health'],
  summary: 'Readiness check',
  description:
    'Returns whether server is ready to accept requests. Checks database connectivity. Use for readiness probes.',
  responses: {
    200: {
      content: { 'application/json': { schema: ReadySchema } },
      description: 'Server is ready',
    },
    503: {
      content: { 'application/json': { schema: ReadySchema } },
      description: 'Server is not ready (database unavailable)',
    },
  },
});

healthRouter.openapi(readyRoute, async (c) => {
  const dbHealthy = await checkHealth();
  const status = dbHealthy ? 200 : 503;

  return c.json(
    {
      ready: dbHealthy,
      database: dbHealthy ? 'ok' : 'error',
    },
    status
  );
});
