/**
 * Auth Middleware
 *
 * Bridges the transport-agnostic auth core to Hono's HTTP layer.
 * Extracts credentials from the Authorization header, detects the token kind,
 * validates via the appropriate strategy, and sets `c.var.auth`.
 *
 * Token routing:
 * - `ce_`  prefix  -> Tenant API key (HMAC-SHA256 validated against database)
 * - `cep_` prefix  -> Platform admin token (constant-time comparison)
 * - Other          -> Rejected as unknown format
 *
 * Must be mounted AFTER the repositories middleware (requires `c.var.apiKeyRepo`).
 */

import { createMiddleware } from 'hono/factory';

import {
  type AuthScope,
  detectTokenKind,
  getOrgId,
  hasScope,
  isPlatform,
  isTenant,
  TokenKind,
  validateApiKey,
  validatePlatformToken,
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
 * Expects `Authorization: Bearer <token>` on every request.
 * Detects the token kind by prefix and delegates to the appropriate validator:
 *
 * - **Tenant API key** (`ce_`): validated via HMAC-SHA256 against the database.
 *   Sets a tenant auth context with `orgId`, `apiKeyId`, and scopes.
 *   Fires a non-blocking `touchLastUsed` for usage tracking.
 *
 * - **Platform token** (`cep_`): validated via constant-time comparison against
 *   the server-configured expected token. Sets a platform auth context.
 *
 * - **Unknown**: rejects with 401 for unrecognized token formats.
 */
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const config = getConfig();

  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw unauthorized('Missing or invalid Authorization header');
  }

  const token = authHeader.slice('Bearer '.length);
  const kind = detectTokenKind(token);

  switch (kind) {
    case TokenKind.TenantApiKey: {
      const apiKeyRepo = c.var.apiKeyRepo;
      const result = await validateApiKey(
        token,
        config.apiKeyHashSecret,
        apiKeyRepo
      );

      if (!result.success) {
        c.var.logger.warn({ reason: result.error }, 'Authentication failed');
        throw unauthorized(result.error);
      }

      c.set('auth', result.context);

      // Fire-and-forget: track key usage (operational concern, not validation)
      if (isTenant(result.context)) {
        apiKeyRepo
          .touchLastUsed(result.context.apiKeyId)
          .catch((err: unknown) =>
            c.var.logger.warn(
              { err: err instanceof Error ? err.message : String(err) },
              'Failed to update lastUsedAt'
            )
          );
      }

      break;
    }

    case TokenKind.PlatformToken: {
      const result = validatePlatformToken(token, config.platformToken);

      if (!result.success) {
        c.var.logger.warn({ reason: result.error }, 'Authentication failed');
        throw unauthorized(result.error);
      }

      c.set('auth', result.context);
      break;
    }

    case TokenKind.Unknown: {
      throw unauthorized('Invalid token format');
    }
  }

  await next();
});

// =============================================================================
// Org Access Middleware
// =============================================================================

/**
 * Middleware that validates the URL's `:orgId` matches the authenticated org.
 *
 * Registered at the app level for all org-scoped routes.
 *
 * - **Platform context**: bypassed — platform tokens can access any organization.
 * - **Tenant context**: the URL's `orgId` must match the authenticated org's `orgId`.
 *
 * Must be mounted AFTER `authMiddleware` (requires `c.var.auth`).
 */
export const requireOrgAccess = createMiddleware<AppEnv>(async (c, next) => {
  const auth = c.get('auth');

  // Platform context can access any organization
  if (isPlatform(auth)) {
    await next();
    return;
  }

  // Assumes route has an :orgId param. If absent, orgId is undefined and the check is a no-op by design.
  const orgId = c.req.param('orgId');
  const authOrgId = getOrgId(auth);

  if (orgId && orgId !== authOrgId) {
    throw forbidden('Access denied: cannot access another organization');
  }

  await next();
});

// =============================================================================
// Scope Middleware
// =============================================================================

/**
 * Middleware factory that requires a specific tenant scope on the authenticated context.
 *
 * - **Platform context**: bypassed — platform operates at a higher permission level
 *   and is not subject to tenant scope checks.
 * - **Tenant context**: checks that the API key has the required scope (or `admin`).
 *
 * Must be mounted AFTER `authMiddleware` (requires `c.var.auth`).
 *
 * @param scope - The tenant scope the request must have
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

    // Platform context bypasses tenant scope checks
    if (isPlatform(auth)) {
      await next();
      return;
    }

    if (!hasScope(auth, scope)) {
      throw forbidden(`Requires '${scope}' scope`);
    }

    await next();
  });
}
