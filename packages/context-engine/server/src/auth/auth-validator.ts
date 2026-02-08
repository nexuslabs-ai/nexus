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

import { AUTH_SCOPES, type AuthResult, type AuthScope } from './auth-types.js';

// =============================================================================
// Constants
// =============================================================================

/** Prefix for all Context Engine API keys */
const KEY_PREFIX = 'ce_';

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
      orgId: apiKey.orgId,
      apiKeyId: apiKey.id,
      scopes: validScopes,
    },
  };
}
