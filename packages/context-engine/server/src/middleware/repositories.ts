/**
 * Repository Middleware
 *
 * Injects repository instances into the Hono context for dependency injection.
 * This enables route handlers to access repositories via `c.var` instead of
 * creating them inline.
 */

import {
  createApiKeyRepository,
  createComponentRepository,
  createEmbeddingRepository,
  createOrganizationRepository,
} from '@context-engine/db';
import { createMiddleware } from 'hono/factory';

import { SessionStore } from '../mcp/sessions.js';
import type { AppEnv } from '../types.js';

// =============================================================================
// Module-level Session Store (Singleton)
// =============================================================================

/**
 * Global session store instance (always-on architecture).
 *
 * Initialized once at module load time and reused across all requests.
 * Manages stateful MCP sessions with TTL cleanup and per-org limits.
 *
 * Lifecycle:
 * - Created on server startup (module import)
 * - Injected into every request via middleware
 * - Cleaned up automatically via setInterval (60s)
 * - Destroyed on server shutdown (manual cleanup)
 */
const sessionStore = new SessionStore();

// Export for server shutdown handler
export { sessionStore };

// =============================================================================
// Middleware
// =============================================================================

/**
 * Middleware that injects repository instances and session store into the context.
 *
 * Provides:
 * - `c.var.organizationRepo` - Always available
 * - `c.var.componentRepo` - Always available
 * - `c.var.apiKeyRepo` - Always available
 * - `c.var.embeddingRepo` - Only if VOYAGE_API_KEY is configured
 * - `c.var.sessionStore` - Always available (always-on MCP sessions)
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
    // Always inject organization, component, and API key repositories
    c.set('organizationRepo', createOrganizationRepository());
    c.set('componentRepo', createComponentRepository());
    c.set('apiKeyRepo', createApiKeyRepository());

    // Always inject session store (always-on MCP architecture)
    c.set('sessionStore', sessionStore);

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
