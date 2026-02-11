/**
 * Processing Routes
 *
 * API endpoints for the component processing pipeline.
 * Exposes atomic extract, generate, and build operations that persist
 * results to the database via ComponentRepository.
 *
 * All routes are nested under `/api/v1/organizations/:orgId/processing`.
 *
 * Pipeline flow:
 * 1. Extract: source code → extraction data (props, variants, dependencies)
 * 2. Generate: extraction → LLM-generated semantic metadata
 * 3. Build: extraction + generation → complete AI manifest
 */

import type { Framework } from '@context-engine/core';
import type { NewComponent } from '@context-engine/db';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { notFound, processingError, validationError } from '../errors.js';
import { requireScope } from '../middleware/auth.js';
import { ErrorSchema } from '../schemas/common.js';
import {
  BuildRequestSchema,
  BuildResponseSchema,
  ExtractRequestSchema,
  ExtractResponseSchema,
  GenerateRequestSchema,
  GenerateResponseSchema,
  ProcessingParamsSchema,
} from '../schemas/processing.js';
import { processingService } from '../services/index.js';
import type { AppEnv } from '../types.js';
import { successResponse } from '../utils/index.js';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Build a ManifestIdentity from a database component record.
 *
 * The DB stores `framework` as `string` (varchar), but the processor types
 * require the `Framework` union type. This helper centralizes the cast so
 * route handlers don't repeat it.
 */
function buildIdentity(component: {
  id: string;
  slug: string;
  name: string;
  framework: string;
}) {
  return {
    id: component.id,
    slug: component.slug,
    name: component.name,
    framework: component.framework as Framework,
  };
}

// =============================================================================
// Route Definitions
// =============================================================================

/**
 * POST /extract - Extract component metadata from source code
 *
 * Phase 1: Parses component source code to extract props, variants,
 * dependencies, and other structural metadata. Creates or updates
 * the component in the database with extraction data.
 */
const extractRoute = createRoute({
  method: 'post',
  path: '/extract',
  tags: ['Processing'],
  summary: 'Extract component metadata',
  description:
    'Parse component source code to extract props, variants, and dependencies. ' +
    'Creates a new component or updates an existing one with extraction data.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:write')],
  request: {
    params: ProcessingParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: ExtractRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ExtractResponseSchema,
        },
      },
      description: 'Component extracted and persisted',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request body',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Extraction failed',
    },
  },
});

/**
 * POST /generate - Generate semantic metadata via LLM
 *
 * Phase 2: Uses LLM to produce semantic descriptions, usage patterns,
 * and guidance from a prior extraction. The component must already
 * have extraction data stored in the database.
 */
const generateRoute = createRoute({
  method: 'post',
  path: '/generate',
  tags: ['Processing'],
  summary: 'Generate semantic metadata',
  description:
    'Generate LLM-based semantic metadata (descriptions, patterns, guidance) ' +
    'from a previously extracted component. Requires prior extraction.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:write')],
  request: {
    params: ProcessingParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: GenerateRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GenerateResponseSchema,
        },
      },
      description: 'Semantic metadata generated and persisted',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request or missing extraction data',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Generation failed',
    },
  },
});

/**
 * POST /build - Build manifest from extraction and generation
 *
 * Phase 3: Combines extraction and generation data into a complete
 * AI manifest. The component must already have both extraction and
 * generation data stored in the database.
 */
const buildRoute = createRoute({
  method: 'post',
  path: '/build',
  tags: ['Processing'],
  summary: 'Build AI manifest',
  description:
    'Build a complete AI manifest from existing extraction and generation data. ' +
    'Requires both prior extraction and generation.',
  security: [{ Bearer: [] }],
  middleware: [requireScope('component:write')],
  request: {
    params: ProcessingParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: BuildRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: BuildResponseSchema,
        },
      },
      description: 'Manifest built and persisted',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Invalid request or missing extraction/generation data',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Component not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
      description: 'Build failed',
    },
  },
});

// =============================================================================
// Router
// =============================================================================

/**
 * Processing router.
 * Mount at `/api/v1/organizations/:orgId/processing`.
 *
 * Requires repositories middleware to be applied at app level.
 * Access component repository via `c.var.componentRepo`.
 */
export const processingRouter = new OpenAPIHono<AppEnv>();

// -----------------------------------------------------------------------------
// POST /extract - Extract component metadata
// -----------------------------------------------------------------------------

processingRouter.openapi(extractRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepo;

  // Run extraction via processing service
  const extractResult = await processingService
    .extract({
      orgId,
      name: body.name,
      sourceCode: body.sourceCode,
      framework: body.framework,
      filePath: body.filePath,
      version: body.version,
      existingId: body.existingId,
      storiesCode: body.storiesCode,
      storiesFilePath: body.storiesFilePath,
    })
    .catch((err: unknown) => {
      throw processingError(
        'Extraction failed',
        err instanceof Error ? err.message : String(err)
      );
    });

  // Persist extraction to database (create or update)
  const componentData: Omit<NewComponent, 'orgId'> = {
    slug: extractResult.slug,
    name: body.name,
    framework: body.framework ?? 'react',
    version: body.version ?? '0.0.1',
    sourceHash: extractResult.sourceHash,
    extraction: extractResult.extracted as NewComponent['extraction'],
  };

  let component;
  if (body.existingId) {
    // Update existing component
    component = await repository.update(orgId, body.existingId, {
      sourceHash: extractResult.sourceHash,
      extraction: extractResult.extracted as NewComponent['extraction'],
    });

    if (!component) {
      throw notFound('Component', body.existingId);
    }
  } else {
    // Upsert by slug (create if new, update if existing)
    component = await repository.upsert(orgId, componentData);
  }

  return c.json(
    successResponse({
      componentId: component.id,
      slug: extractResult.slug,
      name: body.name,
      framework: body.framework ?? 'react',
      sourceHash: extractResult.sourceHash,
      extraction: extractResult.extracted,
      metadata: extractResult.metadata,
    }),
    200
  );
});

// -----------------------------------------------------------------------------
// POST /generate - Generate semantic metadata
// -----------------------------------------------------------------------------

processingRouter.openapi(generateRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepo;

  // Load component from database
  const component = await repository.findById(orgId, body.componentId);

  if (!component) {
    throw notFound('Component', body.componentId);
  }

  // Validate that extraction data exists
  if (!component.extraction) {
    throw validationError(
      'Component has no extraction data',
      'Run the extract endpoint first before generating metadata'
    );
  }

  // Build identity from stored component data
  const identity = buildIdentity(component);

  // Run generation via processing service
  const genResult = await processingService
    .generate({
      orgId,
      identity,
      extracted: component.extraction,
      sourceHash: component.sourceHash ?? '',
      hints: body.hints,
    })
    .catch((err: unknown) => {
      throw processingError(
        'Generation failed',
        err instanceof Error ? err.message : String(err)
      );
    });

  // Persist generation data to database
  const updated = await repository.update(orgId, component.id, {
    generation: genResult.meta as NewComponent['generation'],
    generationProvider: genResult.provider,
    generationModel: genResult.model,
  });

  if (!updated) {
    throw notFound('Component', component.id);
  }

  return c.json(
    successResponse({
      componentId: component.id,
      generation: genResult.meta,
      provider: genResult.provider,
      model: genResult.model,
    }),
    200
  );
});

// -----------------------------------------------------------------------------
// POST /build - Build AI manifest
// -----------------------------------------------------------------------------

processingRouter.openapi(buildRoute, async (c) => {
  const { orgId } = c.req.valid('param');
  const body = c.req.valid('json');
  const repository = c.var.componentRepo;

  // Load component from database
  const component = await repository.findById(orgId, body.componentId);

  if (!component) {
    throw notFound('Component', body.componentId);
  }

  // Validate that extraction data exists
  if (!component.extraction) {
    throw validationError(
      'Component has no extraction data',
      'Run the extract endpoint first'
    );
  }

  // Validate that generation data exists
  if (!component.generation) {
    throw validationError(
      'Component has no generation data',
      'Run the generate endpoint after extraction'
    );
  }

  // Build identity from stored component data
  const identity = buildIdentity(component);

  // Query available component names for related-component filtering
  const availableComponents = await repository.findAllNames(orgId);

  // Run build via processing service
  let buildResult;
  try {
    buildResult = processingService.build({
      orgId,
      identity,
      extracted: component.extraction,
      meta: component.generation,
      sourceHash: component.sourceHash ?? '',
      availableComponents,
    });
  } catch (err: unknown) {
    throw processingError(
      'Build failed',
      err instanceof Error ? err.message : String(err)
    );
  }

  // Persist manifest to database
  const updated = await repository.update(orgId, component.id, {
    manifest: buildResult.manifest as NewComponent['manifest'],
  });

  if (!updated) {
    throw notFound('Component', component.id);
  }

  return c.json(
    successResponse({
      componentId: component.id,
      name: buildResult.componentName,
      manifest: buildResult.manifest,
      sourceHash: buildResult.sourceHash,
      builtAt: buildResult.builtAt,
    }),
    200
  );
});
