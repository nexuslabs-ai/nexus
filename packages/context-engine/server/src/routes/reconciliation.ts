/**
 * Reconciliation Routes
 *
 * Manual control endpoints for embedding reconciliation.
 * All routes are nested under `/api/v1/organizations/:orgId/reconciliation`.
 */

import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { notFound, serviceUnavailable, validationError } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import { ErrorSchema } from '../schemas/common.js';
import { OrgIdPathParamSchema } from '../schemas/organizations.js';
import {
  ForceReindexParamsSchema,
  ForceReindexResponseSchema,
  MigrateEmbeddingsRequestSchema,
  MigrateEmbeddingsResponseSchema,
  ProcessPendingRequestSchema,
  ProcessPendingResponseSchema,
  ReconciliationStatusSchema,
  RetryFailedResponseSchema,
} from '../schemas/reconciliation.js';
import type { AppEnv } from '../types.js';
import { successResponse } from '../utils/index.js';

// =============================================================================
// Route Definitions
// =============================================================================

/**
 * GET /status - Get embedding status counts
 */
const getStatusRoute = createRoute({
  method: 'get',
  path: '/status',
  tags: ['Reconciliation'],
  summary: 'Get embedding status counts',
  description:
    'Returns counts of components grouped by embedding status (pending, processing, indexed, failed).',
  security: [{ Bearer: [] }],
  middleware: [requireScope('embedding:manage')],
  request: {
    params: OrgIdPathParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ReconciliationStatusSchema,
        },
      },
      description: 'Embedding status counts',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

/**
 * POST /process-pending - Manually process pending components
 */
const processPendingRoute = createRoute({
  method: 'post',
  path: '/process-pending',
  tags: ['Reconciliation'],
  summary: 'Process pending components',
  description:
    'Manually trigger processing of pending components. Processes up to batchSize components with fair distribution across organizations.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('embedding:manage')],
  request: {
    params: OrgIdPathParamSchema,
    body: {
      content: {
        'application/json': {
          schema: ProcessPendingRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ProcessPendingResponseSchema,
        },
      },
      description: 'Processing results',
    },
    503: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description:
        'Embedding service unavailable (VOYAGE_API_KEY not configured)',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

/**
 * POST /retry-failed - Reset failed components to pending
 */
const retryFailedRoute = createRoute({
  method: 'post',
  path: '/retry-failed',
  tags: ['Reconciliation'],
  summary: 'Retry failed components',
  description:
    'Reset all failed components back to pending status for retry. Clears error messages and updates timestamps.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('embedding:manage')],
  request: {
    params: OrgIdPathParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: RetryFailedResponseSchema,
        },
      },
      description: 'Number of components reset',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

/**
 * POST /force-reindex/:componentId - Force reindex a specific component
 */
const forceReindexRoute = createRoute({
  method: 'post',
  path: '/force-reindex/{componentId}',
  tags: ['Reconciliation'],
  summary: 'Force reindex component',
  description:
    'Force re-indexing of a specific component, regardless of current status. Deletes existing embeddings and regenerates.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('embedding:manage')],
  request: {
    params: ForceReindexParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ForceReindexResponseSchema,
        },
      },
      description: 'Reindex results',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component has no manifest',
    },
    503: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description:
        'Embedding service unavailable (VOYAGE_API_KEY not configured)',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

/**
 * POST /migrate-embeddings - Queue components for model migration
 */
const migrateEmbeddingsRoute = createRoute({
  method: 'post',
  path: '/migrate-embeddings',
  tags: ['Reconciliation'],
  summary: 'Migrate embeddings to new model',
  description:
    'Queue components with outdated embeddings for re-indexing with the current model. Sets their status to pending.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('embedding:manage')],
  request: {
    params: OrgIdPathParamSchema,
    body: {
      content: {
        'application/json': {
          schema: MigrateEmbeddingsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MigrateEmbeddingsResponseSchema,
        },
      },
      description: 'Migration queue results',
    },
    503: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description:
        'Embedding service unavailable (VOYAGE_API_KEY not configured)',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// =============================================================================
// Router & Handlers
// =============================================================================

export const reconciliationRouter = new OpenAPIHono<AppEnv>();

/**
 * GET /status handler
 */
reconciliationRouter.openapi(getStatusRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const repository = c.var.componentRepo;

  const counts = await repository.countByEmbeddingStatus(orgId);
  const total =
    counts.pending + counts.processing + counts.indexed + counts.failed;

  return c.json(
    successResponse({
      ...counts,
      total,
    }),
    200
  );
});

/**
 * POST /process-pending handler
 */
reconciliationRouter.openapi(processPendingRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const { batchSize } = c.req.valid('json');
  const componentRepo = c.var.componentRepo;
  const embeddingRepo = c.var.embeddingRepo;

  // Check if embedding service is available
  if (!embeddingRepo) {
    throw serviceUnavailable(
      'Embedding service unavailable. VOYAGE_API_KEY not configured.'
    );
  }

  // Find pending components for this org
  const pending = await componentRepo.findPending(orgId, batchSize);

  // Filter out components without manifests before processing
  const componentsToProcess = pending.filter((c) => c.manifest);

  // Process components in parallel using Promise.allSettled
  // This reduces latency for manual reconciliation operations
  const results = await Promise.allSettled(
    componentsToProcess.map((component) =>
      embeddingRepo.index(component.orgId, component.id, component.manifest!)
    )
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return c.json(
    successResponse({
      processed: pending.length,
      succeeded,
      failed,
    }),
    200
  );
});

/**
 * POST /retry-failed handler
 */
reconciliationRouter.openapi(retryFailedRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const repository = c.var.componentRepo;

  const reset = await repository.resetFailedToPending(orgId);

  return c.json(
    successResponse({
      reset,
    }),
    200
  );
});

/**
 * POST /force-reindex/:componentId handler
 */
reconciliationRouter.openapi(forceReindexRoute, async (c) => {
  const { orgId, componentId } = c.req.valid('param');
  const componentRepo = c.var.componentRepo;
  const embeddingRepo = c.var.embeddingRepo;

  // Check if embedding service is available
  if (!embeddingRepo) {
    throw serviceUnavailable(
      'Embedding service unavailable. VOYAGE_API_KEY not configured.'
    );
  }

  // Find the component
  const component = await componentRepo.findById(orgId, componentId);
  if (!component) {
    throw notFound(`Component not found: ${componentId}`);
  }

  // Validate it has a manifest
  if (!component.manifest) {
    throw validationError('Component has no manifest. Cannot index.');
  }

  // Force reindex
  const result = await embeddingRepo.index(
    component.orgId,
    component.id,
    component.manifest
  );

  return c.json(
    successResponse({
      componentId: component.id,
      chunksCreated: result.chunksCreated,
      embeddingStatus: 'indexed' as const,
    }),
    200
  );
});

/**
 * POST /migrate-embeddings handler
 */
reconciliationRouter.openapi(migrateEmbeddingsRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const { batchSize } = c.req.valid('json');
  const componentRepo = c.var.componentRepo;
  const embeddingRepo = c.var.embeddingRepo;

  // Check if embedding service is available
  if (!embeddingRepo) {
    throw serviceUnavailable(
      'Embedding service unavailable. VOYAGE_API_KEY not configured.'
    );
  }

  // Get current model info
  const currentModel = embeddingRepo.modelInfo.model;

  // Find components with outdated embedding models
  const outdatedComponents = await componentRepo.findByOutdatedModel(
    orgId,
    currentModel,
    batchSize
  );

  // Queue outdated components for re-indexing (set to pending)
  for (const component of outdatedComponents) {
    await componentRepo.update(orgId, component.id, {
      embeddingStatus: 'pending',
      embeddingError: null,
    });
  }

  return c.json(
    successResponse({
      queued: outdatedComponents.length,
      currentModel,
      outdatedComponents: outdatedComponents.length,
    }),
    200
  );
});
