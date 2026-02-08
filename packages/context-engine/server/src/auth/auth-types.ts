/**
 * Auth Types
 *
 * Type definitions and constants for the auth module.
 * Zero runtime imports — types only.
 *
 * This module is transport-agnostic: no Hono dependency.
 * Both HTTP API and MCP Streamable HTTP consume these types.
 */

// =============================================================================
// Constants
// =============================================================================

/** Sentinel API key ID used in dev mode (AUTH_ENABLED=false) */
export const DEV_API_KEY_ID = 'dev';

// =============================================================================
// Scopes
// =============================================================================

/** Permission scopes for API key authorization */
export type AuthScope =
  | 'component:read'
  | 'component:write'
  | 'component:delete'
  | 'embedding:manage'
  | 'admin';

/** All valid scopes (for runtime validation) */
export const AUTH_SCOPES = [
  'component:read',
  'component:write',
  'component:delete',
  'embedding:manage',
  'admin',
] as const satisfies readonly AuthScope[];

// =============================================================================
// Auth Context
// =============================================================================

/**
 * Authenticated context attached to a request.
 *
 * Populated after successful API key validation.
 * Contains the org scope and permissions for the current request.
 */
export interface AuthContext {
  /** Organization ID the API key belongs to */
  orgId: string;

  /** The API key record ID (for audit/tracking) */
  apiKeyId: string;

  /** Validated permission scopes granted to this key */
  scopes: AuthScope[];
}

// =============================================================================
// Auth Result
// =============================================================================

/**
 * Discriminated union result of API key validation.
 *
 * On success, contains the authenticated context.
 * On failure, contains a human/AI-readable error message.
 */
export type AuthResult =
  | { success: true; context: AuthContext }
  | { success: false; error: string };
