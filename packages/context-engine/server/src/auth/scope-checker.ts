/**
 * Scope Checker
 *
 * Utilities for checking authorization scopes on an authenticated context.
 * The `admin` scope acts as a superuser — it satisfies any tenant scope check.
 *
 * Handles the `AuthContext` discriminated union:
 * - `TenantAuthContext` — org-scoped, has `orgId`, `apiKeyId`, and `AuthScope[]`
 * - `PlatformAuthContext` — cross-org admin, has `PlatformScope[]` only
 *
 * Tenant scope checks (`hasScope`, `hasAllScopes`) return `false` for platform
 * contexts. Platform authorization is handled at the middleware level, not here.
 *
 * This module is transport-agnostic: no Hono dependency.
 * Both HTTP API and MCP Streamable HTTP consume these utilities.
 */

import {
  type AuthContext,
  AuthKind,
  type AuthScope,
  type PlatformAuthContext,
  type TenantAuthContext,
} from './auth-types.js';

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Narrow an `AuthContext` to `TenantAuthContext`.
 *
 * @param context - The authenticated context to check
 * @returns `true` if the context is a tenant (org-scoped) context
 *
 * @example
 * ```ts
 * if (isTenant(auth)) {
 *   // auth.orgId and auth.apiKeyId are available here
 *   console.log(auth.orgId);
 * }
 * ```
 */
export function isTenant(context: AuthContext): context is TenantAuthContext {
  return context.kind === AuthKind.Tenant;
}

/**
 * Narrow an `AuthContext` to `PlatformAuthContext`.
 *
 * @param context - The authenticated context to check
 * @returns `true` if the context is a platform (cross-org admin) context
 *
 * @example
 * ```ts
 * if (isPlatform(auth)) {
 *   // auth has PlatformScope[], no orgId
 * }
 * ```
 */
export function isPlatform(
  context: AuthContext
): context is PlatformAuthContext {
  return context.kind === AuthKind.Platform;
}

// =============================================================================
// Context Accessors
// =============================================================================

/**
 * Safely extract the `orgId` from an auth context.
 *
 * Returns the org ID for tenant contexts, or `null` for platform contexts
 * (which are not tied to any specific organization).
 *
 * @param context - The authenticated context
 * @returns The org ID string, or `null` if the context is platform-level
 *
 * @example
 * ```ts
 * const orgId = getOrgId(auth);
 * if (orgId === null) {
 *   // Platform context — handle cross-org logic
 * }
 * ```
 */
export function getOrgId(context: AuthContext): string | null {
  return context.kind === AuthKind.Tenant ? context.orgId : null;
}

// =============================================================================
// Scope Checks
// =============================================================================

/**
 * Check if the authenticated context has a specific tenant scope.
 *
 * Returns `true` if the context is a tenant context AND has:
 * - The `admin` scope (superuser, satisfies any check), OR
 * - The specific scope requested
 *
 * Platform contexts always return `false` — platform authorization
 * is a separate permission domain handled at the middleware level.
 *
 * @param context - The authenticated context from API key validation
 * @param scope - The tenant scope to check for
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
  if (context.kind !== AuthKind.Tenant) {
    return false;
  }

  return context.scopes.includes('admin') || context.scopes.includes(scope);
}

/**
 * Check if the authenticated context has ALL specified tenant scopes.
 *
 * Returns `true` if the context is a tenant context AND has:
 * - The `admin` scope (superuser, satisfies any check), OR
 * - Every scope in the provided list
 *
 * Platform contexts always return `false` — platform authorization
 * is a separate permission domain handled at the middleware level.
 *
 * **Note on empty scopes:** When `scopes` is an empty array, this returns
 * `true` for any tenant context. This is intentional — an empty list means
 * "no required scopes", i.e. no restriction beyond being a valid tenant.
 * This follows from `Array.every()` returning `true` on empty arrays
 * (vacuous truth) and matches the semantic: "the context satisfies all
 * zero requirements."
 *
 * @param context - The authenticated context from API key validation
 * @param scopes - Array of tenant scopes that are all required
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
  if (context.kind !== AuthKind.Tenant) {
    return false;
  }

  if (context.scopes.includes('admin')) {
    return true;
  }

  return scopes.every((scope) => context.scopes.includes(scope));
}
