/**
 * Database Schema Types
 *
 * Types representing database tables and records.
 * These map to Drizzle ORM schemas in @context-engine/db.
 */

import { z } from 'zod';

import {
  EmbeddingModelInfoSchema,
  EmbeddingStatusSchema,
} from './embedding.js';
import {
  ComponentIdSchema,
  FrameworkSchema,
  TierSchema,
  VersionSchema,
  VisibilitySchema,
} from './identity.js';

/**
 * Organization record schema
 */
export const OrganizationRecordSchema = z.object({
  /** Organization ID (UUID) */
  id: z.uuid(),

  /** Organization name */
  name: z.string().min(1).max(255),

  /** Organization slug (URL-friendly) */
  slug: z.string().min(1).max(255),

  /** Created timestamp */
  createdAt: z.date(),

  /** Updated timestamp */
  updatedAt: z.date(),
});

export type OrganizationRecord = z.infer<typeof OrganizationRecordSchema>;

/**
 * Component record schema (database row)
 */
export const ComponentRecordSchema = z.object({
  /** Primary identifier (UUID v4) */
  id: ComponentIdSchema,

  /** Organization that owns this component */
  orgId: z.uuid(),

  /** Derived slug for URLs */
  slug: z.string(),

  /** Human-readable display name */
  name: z.string(),

  /** Semantic version */
  version: VersionSchema,

  /** Target framework */
  framework: FrameworkSchema,

  /** Component visibility */
  visibility: VisibilitySchema,

  /** Component tier */
  tier: TierSchema,

  /** One-line description */
  description: z.string(),

  /** Full manifest JSON (JSONB in PostgreSQL) */
  manifest: z.record(z.string(), z.unknown()),

  /** Current embedding status */
  embeddingStatus: EmbeddingStatusSchema,

  /** Error message if embedding failed */
  embeddingError: z.string().nullable(),

  /** Embedding model info (JSONB) */
  embeddingModel: EmbeddingModelInfoSchema.nullable(),

  /** Hash of source code */
  sourceHash: z.string().length(64),

  /** Hash of meta content */
  metaHash: z.string().length(64),

  /** Created timestamp */
  createdAt: z.date(),

  /** Updated timestamp */
  updatedAt: z.date(),
});

export type ComponentRecord = z.infer<typeof ComponentRecordSchema>;

/**
 * Component embedding record schema
 * Stores vector embeddings for semantic search
 */
export const ComponentEmbeddingRecordSchema = z.object({
  /** Embedding ID */
  id: z.uuid(),

  /** Component this embedding belongs to */
  componentId: ComponentIdSchema,

  /** Organization ID (for RLS) */
  orgId: z.uuid(),

  /** Chunk type (description, props, examples, etc.) */
  chunkType: z.string(),

  /** Text content that was embedded */
  content: z.string(),

  /** Vector embedding (stored as pgvector) */
  embedding: z.array(z.number()),

  /** Embedding model used */
  embeddingModel: EmbeddingModelInfoSchema,

  /** Created timestamp */
  createdAt: z.date(),
});

export type ComponentEmbeddingRecord = z.infer<
  typeof ComponentEmbeddingRecordSchema
>;

/**
 * Version history record schema
 */
export const VersionHistoryRecordSchema = z.object({
  /** History entry ID */
  id: z.uuid(),

  /** Component ID */
  componentId: ComponentIdSchema,

  /** Organization ID */
  orgId: z.uuid(),

  /** Version number */
  version: VersionSchema,

  /** Source hash at this version */
  sourceHash: z.string().length(64),

  /** Meta hash at this version */
  metaHash: z.string().length(64),

  /** When this version was created */
  createdAt: z.date(),
});

export type VersionHistoryRecord = z.infer<typeof VersionHistoryRecordSchema>;

/**
 * Embedding queue record schema
 * For background processing of embeddings
 */
export const EmbeddingQueueRecordSchema = z.object({
  /** Queue entry ID */
  id: z.uuid(),

  /** Component to embed */
  componentId: ComponentIdSchema,

  /** Organization ID */
  orgId: z.uuid(),

  /** Priority (0-10, higher = more urgent) */
  priority: z.number().int().min(0).max(10),

  /** When to process this entry */
  scheduledAt: z.date(),

  /** Number of attempts so far */
  attempts: z.number().int().min(0),

  /** Last error message if failed */
  lastError: z.string().nullable(),

  /** Created timestamp */
  createdAt: z.date(),

  /** Updated timestamp */
  updatedAt: z.date(),
});

export type EmbeddingQueueRecord = z.infer<typeof EmbeddingQueueRecordSchema>;

/**
 * Database table names (for consistency)
 */
export const TABLE_NAMES = {
  organizations: 'organizations',
  components: 'components',
  componentEmbeddings: 'component_embeddings',
  versionHistory: 'version_history',
  embeddingQueue: 'embedding_queue',
} as const;

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES];

/**
 * Insert types (omit auto-generated fields)
 */
export type InsertOrganization = Omit<
  OrganizationRecord,
  'id' | 'createdAt' | 'updatedAt'
>;
export type InsertComponent = Omit<
  ComponentRecord,
  'id' | 'createdAt' | 'updatedAt'
>;
export type InsertComponentEmbedding = Omit<
  ComponentEmbeddingRecord,
  'id' | 'createdAt'
>;
export type InsertVersionHistory = Omit<
  VersionHistoryRecord,
  'id' | 'createdAt'
>;
export type InsertEmbeddingQueue = Omit<
  EmbeddingQueueRecord,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Update types (all fields optional except id)
 */
export type UpdateOrganization = Partial<
  Omit<OrganizationRecord, 'id' | 'createdAt'>
> & {
  id: string;
};
export type UpdateComponent = Partial<
  Omit<ComponentRecord, 'id' | 'createdAt'>
> & {
  id: string;
};
export type UpdateEmbeddingQueue = Partial<
  Omit<EmbeddingQueueRecord, 'id' | 'createdAt'>
> & {
  id: string;
};
