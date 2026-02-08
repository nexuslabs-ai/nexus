/**
 * Auth Middleware
 *
 * Bridges the transport-agnostic auth core to Hono's HTTP layer.
 * Extracts credentials from the Authorization header, validates via the
 * auth module, and sets the authenticated context on `c.var.auth`.
 *
 * Must be mounted AFTER the repositories middleware (requires `c.var.apiKeyRepo`).
 */

import { createMiddleware } from 'hono/factory';

import {
  AUTH_SCOPES,
  type AuthScope,
  hasScope,
  validateApiKey,
} from '../auth/index.js';
import { getConfig } from '../config.js';
import { forbidden, unauthorized } from '../errors.js';
import type { AppEnv } from '../types.js';

// =============================================================================
// Auth Middleware
// =============================================================================

/**
 * Main authentication middleware.
 *
 * **Dev mode** (AUTH_ENABLED=false):
 * - Extracts `orgId` from the URL path param if available
 * - Grants all scopes for local development
 *
 * **Production** (AUTH_ENABLED=true):
 * - Expects `Authorization: Bearer <api_key>` header
 * - Validates the key against the database via HMAC-SHA256
 * - Sets `c.var.auth` with the authenticated context
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const config = getConfig();

  // Dev mode: bypass authentication, grant full access
  if (!config.authEnabled) {
    const orgId = c.req.param('orgId') ?? 'dev';

    c.set('auth', {
      orgId,
      apiKeyId: 'dev',
      scopes: [...AUTH_SCOPES],
    });

    await next();
    return;
  }

  // Production mode: validate Bearer token
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorized('Missing or invalid Authorization header');
  }

  const token = authHeader.slice('Bearer '.length);
  const apiKeyRepo = c.var.apiKeyRepo;

  const result = await validateApiKey(
    token,
    config.apiKeyHashSecret!,
    apiKeyRepo
  );

  if (!result.success) {
    console.warn(`[auth] Authentication failed: ${result.error}`);
    throw unauthorized(result.error);
  }

  c.set('auth', result.context);
  await next();
});

// =============================================================================
// Scope Middleware
// =============================================================================

/**
 * Middleware factory that requires a specific scope on the authenticated context.
 *
 * Must be mounted AFTER `authMiddleware` (requires `c.var.auth`).
 *
 * @param scope - The scope the request must have
 * @returns Hono middleware that throws 403 if the scope is missing
 *
 * @example
 * ```ts
 * app.post('/api/v1/organizations/:orgId/components',
 *   requireScope('component:write'),
 *   createComponentHandler
 * );
 * ```
 */
export function requireScope(scope: AuthScope) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const auth = c.get('auth');

    if (!hasScope(auth, scope)) {
      throw forbidden(`Requires '${scope}' scope`);
    }

    await next();
  });
}
