/**
 * Scope Checker
 *
 * Utilities for checking authorization scopes on an authenticated context.
 * The `admin` scope acts as a superuser — it satisfies any scope check.
 *
 * This module is transport-agnostic: no Hono dependency.
 * Both HTTP API and MCP Streamable HTTP consume these utilities.
 */

import type { AuthContext, AuthScope } from './auth-types.js';

// =============================================================================
// Scope Checks
// =============================================================================

/**
 * Check if the authenticated context has a specific scope.
 *
 * Returns `true` if the context has:
 * - The `admin` scope (superuser, satisfies any check), OR
 * - The specific scope requested
 *
 * @param context - The authenticated context from API key validation
 * @param scope - The scope to check for
 * @returns `true` if the context has the required scope
 *
 * @example
 * ```ts
 * if (!hasScope(authContext, 'component:write')) {
 *   return { success: false, error: 'Insufficient permissions' };
 * }
 * ```
 */
export function hasScope(context: AuthContext, scope: AuthScope): boolean {
  return context.scopes.includes('admin') || context.scopes.includes(scope);
}

/**
 * Check if the authenticated context has ALL specified scopes.
 *
 * Returns `true` if the context has:
 * - The `admin` scope (superuser, satisfies any check), OR
 * - Every scope in the provided list
 *
 * @param context - The authenticated context from API key validation
 * @param scopes - Array of scopes that are all required
 * @returns `true` if the context has all required scopes
 *
 * @example
 * ```ts
 * if (!hasAllScopes(authContext, ['component:read', 'component:write'])) {
 *   return { success: false, error: 'Insufficient permissions' };
 * }
 * ```
 */
export function hasAllScopes(
  context: AuthContext,
  scopes: AuthScope[]
): boolean {
  if (context.scopes.includes('admin')) {
    return true;
  }

  return scopes.every((scope) => context.scopes.includes(scope));
}
