/**
 * Auth Validator
 *
 * API key generation and validation logic.
 * Uses Node.js crypto only — no framework dependencies.
 *
 * This module is transport-agnostic: no Hono dependency.
 * Both HTTP API and MCP Streamable HTTP consume this validator.
 */

import type { ApiKeyRepository } from '@context-engine/db';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import {
  AUTH_SCOPES,
  AuthKind,
  type AuthResult,
  type AuthScope,
  TokenKind,
} from './auth-types.js';

// =============================================================================
// Constants
// =============================================================================

/** Prefix for all Context Engine API keys */
const KEY_PREFIX = 'ce_';

/** Prefix for platform admin tokens */
const PLATFORM_KEY_PREFIX = 'cep_';

/** Number of random bytes used to generate the key (produces 64 hex chars) */
const KEY_RANDOM_BYTES = 32;

// =============================================================================
// Key Generation
// =============================================================================

/**
 * Generate a new API key with the format `ce_{64 hex chars}`.
 *
 * Returns both the raw key (shown once to the user) and the key prefix
 * (first 8 hex chars after `ce_`, stored for identification).
 *
 * @returns Object with `rawKey` and `keyPrefix`
 *
 * @example
 * ```ts
 * const { rawKey, keyPrefix } = generateApiKey();
 * // rawKey:    "ce_a1b2c3d4e5f6..."  (68 chars total)
 * // keyPrefix: "a1b2c3d4"            (8 chars for identification)
 * ```
 */
export function generateApiKey(): { rawKey: string; keyPrefix: string } {
  const randomPart = randomBytes(KEY_RANDOM_BYTES).toString('hex');
  return {
    rawKey: `${KEY_PREFIX}${randomPart}`,
    keyPrefix: randomPart.substring(0, 8),
  };
}

// =============================================================================
// Token Detection
// =============================================================================

/**
 * Detect the kind of token based on its prefix.
 *
 * Checks `cep_` before `ce_` because `cep_` starts with `ce_` and would
 * otherwise be misclassified as a tenant API key.
 *
 * Intentionally extensible — future JWT detection (tokens containing `.`)
 * can be added here when WorkOS integration begins.
 *
 * @param token - The raw token string to classify
 * @returns The detected token kind
 *
 * @example
 * ```ts
 * detectTokenKind('ce_abc123...');   // TokenKind.TenantApiKey
 * detectTokenKind('cep_xyz789...');  // TokenKind.PlatformToken
 * detectTokenKind('unknown');        // TokenKind.Unknown
 * ```
 */
export function detectTokenKind(token: string): TokenKind {
  // Check platform prefix first — `cep_` starts with `ce_`
  if (token.startsWith(PLATFORM_KEY_PREFIX)) {
    return TokenKind.PlatformToken;
  }

  if (token.startsWith(KEY_PREFIX)) {
    return TokenKind.TenantApiKey;
  }

  return TokenKind.Unknown;
}

// =============================================================================
// Key Hashing
// =============================================================================

/**
 * Hash an API key using HMAC-SHA256.
 *
 * The secret should be a strong, server-side secret stored in environment
 * variables. Changing the secret invalidates all existing keys.
 *
 * @param rawKey - The full raw API key (e.g., `ce_a1b2c3d4...`)
 * @param secret - Server-side HMAC secret
 * @returns Hex-encoded HMAC-SHA256 hash (64 chars)
 */
export function hashApiKey(rawKey: string, secret: string): string {
  return createHmac('sha256', secret).update(rawKey).digest('hex');
}

// =============================================================================
// Key Validation
// =============================================================================

/**
 * Validate an API key against the database.
 *
 * Flow:
 * 1. Check key format (must start with `ce_`)
 * 2. Hash the key and look up in database
 * 3. Timing-safe comparison of stored vs computed hash
 * 4. Filter scopes to known valid values
 *
 * @param token - The raw API key from the request
 * @param secret - Server-side HMAC secret for hashing
 * @param apiKeyRepo - Repository for API key database operations
 * @returns AuthResult — discriminated union with context or error
 */
export async function validateApiKey(
  token: string,
  secret: string,
  apiKeyRepo: ApiKeyRepository
): Promise<AuthResult> {
  // Step 1: Check key format
  if (!token.startsWith(KEY_PREFIX)) {
    return { success: false, error: 'Invalid or missing API key' };
  }

  // Step 2: Hash and look up
  const keyHash = hashApiKey(token, secret);
  const apiKey = await apiKeyRepo.findByHash(keyHash);

  if (!apiKey) {
    return { success: false, error: 'Invalid or missing API key' };
  }

  // Step 3: Timing-safe comparison (defense-in-depth)
  // Both hashes are HMAC-SHA256 hex digests (64 chars), so lengths match.
  // Guard against corrupted data by checking length first.
  const storedHashBuf = Buffer.from(apiKey.keyHash, 'hex');
  const computedHashBuf = Buffer.from(keyHash, 'hex');

  if (
    storedHashBuf.length !== computedHashBuf.length ||
    !timingSafeEqual(storedHashBuf, computedHashBuf)
  ) {
    return { success: false, error: 'Invalid or missing API key' };
  }

  // Step 4: Filter scopes to known valid values
  const validScopes = (apiKey.scopes as string[]).filter((s): s is AuthScope =>
    (AUTH_SCOPES as readonly string[]).includes(s)
  );

  return {
    success: true,
    context: {
      kind: AuthKind.Tenant,
      orgId: apiKey.orgId,
      apiKeyId: apiKey.id,
      scopes: validScopes,
    },
  };
}

// =============================================================================
// Constant-Time Comparison
// =============================================================================

/**
 * Compare two strings in constant time to prevent timing attacks.
 *
 * Converts both strings to UTF-8 buffers and uses `crypto.timingSafeEqual`.
 * Returns `false` immediately if lengths differ — `timingSafeEqual` requires
 * equal-length buffers. The length check itself is not timing-sensitive
 * because it only reveals that the strings differ in length, not where.
 *
 * @param a - First string
 * @param b - Second string
 * @returns `true` if the strings are equal
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

// =============================================================================
// Platform Token Validation
// =============================================================================

/**
 * Validate a platform admin token using constant-time comparison.
 *
 * Platform tokens (`cep_` prefix) are not database-backed — they are compared
 * directly against the server-configured expected token. This is suitable for
 * a single admin token; if multiple platform tokens are needed in the future,
 * this should be extended to use database-backed lookup (like tenant keys).
 *
 * @param token - The raw platform token from the request
 * @param expectedToken - The expected platform token from server configuration
 * @returns AuthResult — discriminated union with context or error
 *
 * @example
 * ```ts
 * const result = validatePlatformToken(token, process.env.PLATFORM_TOKEN);
 * if (result.success) {
 *   // result.context.kind === 'platform'
 *   // result.context.scopes === ['platform:admin']
 * }
 * ```
 */
export function validatePlatformToken(
  token: string,
  expectedToken: string
): AuthResult {
  if (!safeCompare(token, expectedToken)) {
    return { success: false, error: 'Invalid platform token' };
  }

  return {
    success: true,
    context: {
      kind: AuthKind.Platform,
      scopes: ['platform:admin'],
    },
  };
}
