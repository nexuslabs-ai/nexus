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
// Schema
// =============================================================================

export * from './schema.js';

// =============================================================================
// Repositories
// =============================================================================

export {
  ComponentRepository,
  type FindManyOptions,
} from './repositories/component-repository.js';
export { OrganizationRepository } from './repositories/organization-repository.js';

// =============================================================================
// Factory Functions
// =============================================================================

import { getDatabase } from './client.js';
import { ComponentRepository } from './repositories/component-repository.js';
import { OrganizationRepository } from './repositories/organization-repository.js';

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

// =============================================================================
// Package Info
// =============================================================================

export const DB_VERSION = '0.1.0';
