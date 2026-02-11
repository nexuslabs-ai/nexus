/**
 * @context-engine/db
 *
 * Database layer for Context Engine.
 * Provides simple CRUD repositories for PostgreSQL.
 */

// =============================================================================
// Client
// =============================================================================

export {
  checkHealth,
  closeDatabase,
  type Database,
  type DatabaseConfig,
  getDatabase,
  initializeDatabase,
} from './client.js';

// =============================================================================
// Types
// =============================================================================

export * from './types.js';

// =============================================================================
// Schema
// =============================================================================

export * from './schema.js';

// =============================================================================
// Repositories
// =============================================================================

export { ApiKeyRepository } from './repositories/api-key-repository.js';
export {
  ComponentRepository,
  type FindAllManifestsOptions,
  type FindManyOptions,
  type KeywordSearchResult,
  type ManifestResult,
} from './repositories/component-repository.js';
export { EmbeddingRepository } from './repositories/embedding-repository.js';
export {
  type FindManyOrganizationsOptions,
  OrganizationRepository,
} from './repositories/organization-repository.js';

// =============================================================================
// Embeddings
// =============================================================================

export * from './embeddings/index.js';

// =============================================================================
// Factory Functions
// =============================================================================

import { getDatabase } from './client.js';
import { ApiKeyRepository } from './repositories/api-key-repository.js';
import { ComponentRepository } from './repositories/component-repository.js';
import { EmbeddingRepository } from './repositories/embedding-repository.js';
import { OrganizationRepository } from './repositories/organization-repository.js';

/**
 * Create an ApiKeyRepository instance
 */
export function createApiKeyRepository(): ApiKeyRepository {
  return new ApiKeyRepository(getDatabase());
}

/**
 * Create an OrganizationRepository instance
 */
export function createOrganizationRepository(): OrganizationRepository {
  return new OrganizationRepository(getDatabase());
}

/**
 * Create a ComponentRepository instance
 */
export function createComponentRepository(): ComponentRepository {
  return new ComponentRepository(getDatabase());
}

/**
 * Create an EmbeddingRepository instance.
 *
 * Uses VOYAGE_API_KEY from environment variables for the embedding service.
 */
export function createEmbeddingRepository(): EmbeddingRepository {
  return new EmbeddingRepository(getDatabase());
}

// =============================================================================
// Package Info
// =============================================================================

export const DB_VERSION = '0.1.0';
