/**
 * @context-engine/db
 *
 * Database client, schema, and migrations for Context Engine.
 *
 * This package provides:
 * - Drizzle ORM schema definitions
 * - Database client configuration
 * - Migration utilities
 * - Query helpers
 */

// Re-export types from core for convenience
export type {
  ComponentEmbeddingRecord,
  ComponentRecord,
  EmbeddingQueueRecord,
  InsertComponent,
  InsertComponentEmbedding,
  InsertEmbeddingQueue,
  InsertOrganization,
  InsertVersionHistory,
  OrganizationRecord,
  TableName,
  UpdateComponent,
  UpdateEmbeddingQueue,
  UpdateOrganization,
  VersionHistoryRecord,
} from '@context-engine/core';
export { TABLE_NAMES } from '@context-engine/core';

// Placeholder exports - implementation in Phase 2
export const DB_VERSION = '0.1.0';
