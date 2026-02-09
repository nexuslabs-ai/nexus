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

/** Auth context kind discriminator values */
export const AuthKind = {
  Tenant: 'tenant',
  Platform: 'platform',
} as const;

export type AuthKind = (typeof AuthKind)[keyof typeof AuthKind];

/** Token kind discriminator values for prefix-based detection */
export const TokenKind = {
  TenantApiKey: 'tenant-api-key',
  PlatformToken: 'platform-token',
  Unknown: 'unknown',
} as const;

export type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];

// =============================================================================
// Scopes
// =============================================================================

/** Permission scopes for API key authorization (tenant-level) */
export type AuthScope =
  | 'component:read'
  | 'component:write'
  | 'component:delete'
  | 'embedding:manage'
  | 'admin';

/** All valid tenant scopes (for runtime validation) */
export const AUTH_SCOPES = [
  'component:read',
  'component:write',
  'component:delete',
  'embedding:manage',
  'admin',
] as const satisfies readonly AuthScope[];

/** Permission scopes for platform-level operations */
export type PlatformScope = 'platform:admin';

// =============================================================================
// Auth Context
// =============================================================================

/**
 * Authenticated context for a tenant API key (`ce_` prefix).
 *
 * Populated after successful API key validation.
 * Contains the org scope and permissions for the current request.
 */
export interface TenantAuthContext {
  /** Discriminator for the auth context union */
  kind: typeof AuthKind.Tenant;

  /** Organization ID the API key belongs to */
  orgId: string;

  /** The API key record ID (for audit/tracking) */
  apiKeyId: string;

  /** Validated permission scopes granted to this key */
  scopes: AuthScope[];
}

/**
 * Authenticated context for the platform admin token (`cep_` prefix).
 *
 * Not tied to any specific organization.
 * Used for cross-org administrative operations.
 */
export interface PlatformAuthContext {
  /** Discriminator for the auth context union */
  kind: typeof AuthKind.Platform;

  /** Platform-level permission scopes */
  scopes: PlatformScope[];
}

/**
 * Discriminated union of all auth context types.
 *
 * Use the `kind` field (see `AuthKind`) to narrow the type:
 * - `AuthKind.Tenant`   — org-scoped, has `orgId` and `apiKeyId`
 * - `AuthKind.Platform` — cross-org admin, no `orgId`
 */
export type AuthContext = TenantAuthContext | PlatformAuthContext;

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
