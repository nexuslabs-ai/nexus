/**
 * API Key Repository
 *
 * CRUD operations for API keys used in Context Engine authentication.
 * Most methods are scoped to an organization for multi-tenancy.
 *
 * Exception: findByHash is a global lookup because during authentication
 * the caller does not yet know which organization the key belongs to.
 */

import { and, desc, eq, gt, isNull, or } from 'drizzle-orm';

import type { Database } from '../client.js';
import { type ApiKey, apiKeys, type NewApiKey } from '../schema.js';

// =============================================================================
// Repository
// =============================================================================

/**
 * Repository for API key CRUD operations
 *
 * Handles creation, lookup, revocation, and usage tracking for API keys.
 */
export class ApiKeyRepository {
  constructor(private db: Database) {}

  /**
   * Create a new API key record
   *
   * @param data - API key data including orgId, keyHash, keyPrefix, name, scopes
   * @returns The created API key record
   * @throws Error if no row is returned (should not happen in practice)
   */
  async create(data: NewApiKey): Promise<ApiKey> {
    const [result] = await this.db.insert(apiKeys).values(data).returning();

    if (!result) {
      throw new Error('Failed to create API key: no row returned');
    }

    return result;
  }

  /**
   * Find an active, non-expired API key by its hash
   *
   * This is a global lookup (NOT org-scoped) because during authentication
   * we only have the raw key and need to find which organization it belongs to.
   *
   * Filters:
   * - isActive must be true
   * - expiresAt must be null (never expires) OR in the future
   *
   * @param keyHash - HMAC-SHA256 hash of the raw API key
   * @returns The matching API key, or null if not found or expired/inactive
   */
  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const [result] = await this.db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyHash, keyHash),
          eq(apiKeys.isActive, true),
          or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, new Date()))
        )
      )
      .limit(1);

    return result ?? null;
  }

  /**
   * List all API keys for an organization
   *
   * Returns keys ordered by most recently created first.
   *
   * @param orgId - Organization ID to scope the query
   * @returns Array of API keys (may be empty)
   */
  async findByOrgId(orgId: string): Promise<ApiKey[]> {
    return this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.orgId, orgId))
      .orderBy(desc(apiKeys.createdAt));
  }

  /**
   * Find a specific API key by ID within an organization
   *
   * @param orgId - Organization ID for multi-tenant scoping
   * @param keyId - The API key's UUID
   * @returns The API key, or null if not found in this organization
   */
  async findById(orgId: string, keyId: string): Promise<ApiKey | null> {
    const [result] = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.orgId, orgId), eq(apiKeys.id, keyId)))
      .limit(1);

    return result ?? null;
  }

  /**
   * Revoke an API key by setting isActive to false
   *
   * @param orgId - Organization ID for multi-tenant scoping
   * @param keyId - The API key's UUID
   * @returns The updated API key, or null if not found in this organization
   */
  async revoke(orgId: string, keyId: string): Promise<ApiKey | null> {
    const [result] = await this.db
      .update(apiKeys)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(apiKeys.orgId, orgId), eq(apiKeys.id, keyId)))
      .returning();

    return result ?? null;
  }

  /**
   * Update the lastUsedAt timestamp for a key
   *
   * Called after successful authentication to track key usage.
   * No org scope needed because this runs after auth validation.
   *
   * @param keyId - The API key's UUID
   */
  async touchLastUsed(keyId: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyId));
  }
}
