/**
 * Repository Middleware
 *
 * Injects repository instances into the Hono context for dependency injection.
 * This enables route handlers to access repositories via `c.var` instead of
 * creating them inline.
 */

import {
  createComponentRepository,
  createEmbeddingRepository,
  createOrganizationRepository,
} from '@context-engine/db';
import { createMiddleware } from 'hono/factory';

import type { AppEnv } from '../types.js';

// =============================================================================
// Middleware
// =============================================================================

/**
 * Middleware that injects repository instances into the context.
 *
 * Provides:
 * - `c.var.organizationRepo` - Always available
 * - `c.var.componentRepo` - Always available
 * - `c.var.embeddingRepo` - Only if VOYAGE_API_KEY is configured
 *
 * The embedding repository is optional because it requires the VOYAGE_API_KEY
 * environment variable. Routes that need embedding functionality should check
 * for its availability and return 503 if not configured.
 *
 * @example
 * ```ts
 * app.use('/api/v1/*', repositoriesMiddleware);
 *
 * app.get('/api/v1/orgs', (c) => {
 *   const repo = c.var.organizationRepo;
 *   // ...
 * });
 * ```
 */
export const repositoriesMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    // Always inject organization and component repositories
    c.set('organizationRepo', createOrganizationRepository());
    c.set('componentRepo', createComponentRepository());

    // Conditionally inject embedding repository if VOYAGE_API_KEY is available
    // The factory function throws if the key is not set, so we catch and leave undefined
    try {
      c.set('embeddingRepo', createEmbeddingRepository());
    } catch {
      // VOYAGE_API_KEY not configured - embedding features will be unavailable
      c.set('embeddingRepo', undefined);
    }

    await next();
  }
);
