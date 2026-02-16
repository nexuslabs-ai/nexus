/**
 * Database Schema
 *
 * Drizzle ORM schema definitions for Context Engine.
 * Uses PostgreSQL with JSONB for pipeline outputs.
 *
 * Pipeline outputs stored:
 * - extraction: Raw extracted data (props, variants, dependencies)
 * - generation: LLM-generated metadata (descriptions, patterns, guidance)
 * - manifest: Final combined output for AI consumption
 */

import type {
  AIManifest,
  ComponentMeta,
  ExtractedData,
} from '@context-engine/core';
import { sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  vector,
} from 'drizzle-orm/pg-core';

import type {
  ChunkType,
  EmbeddingModelInfo,
  EmbeddingStatus,
} from './types.js';

// =============================================================================
// Custom Types
// =============================================================================

/**
 * PostgreSQL tsvector type for full-text search.
 * Drizzle doesn't have built-in support for tsvector.
 * Used with generatedAlwaysAs() for automatic computation on INSERT/UPDATE.
 */
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

// =============================================================================
// Organizations
// =============================================================================

/**
 * Organizations table - multi-tenant scoping
 *
 * Simple organization table for multi-tenancy. All component queries
 * must be scoped to an organization to prevent data leakage.
 */
export const organizations = pgTable('organizations', {
  /** Organization ID (UUID) */
  id: uuid('id').primaryKey().defaultRandom(),

  /** Organization name */
  name: varchar('name', { length: 255 }).notNull(),

  /** Creation timestamp */
  createdAt: timestamp('created_at').defaultNow().notNull(),

  /** Last update timestamp */
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// Components
// =============================================================================

/**
 * Components table - pipeline output storage
 *
 * Stores all three pipeline outputs for flexibility:
 * - extraction: For re-generation without re-extracting
 * - generation: For re-building without re-generating
 * - manifest: For API responses and embedding generation
 *
 * Denormalized fields (slug, name, framework) enable efficient queries.
 */
export const components = pgTable(
  'components',
  {
    /** Component ID (UUID) */
    id: uuid('id').primaryKey().defaultRandom(),

    /** Organization ID (FK) - all queries must filter by this */
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id),

    /** URL-friendly identifier (unique per org) */
    slug: varchar('slug', { length: 255 }).notNull(),

    /** Component display name */
    name: varchar('name', { length: 255 }).notNull(),

    /** Target framework: react/vue/svelte/angular */
    framework: varchar('framework', { length: 20 }).notNull(),

    /** Semantic version */
    version: varchar('version', { length: 50 }).notNull(),

    /** Visibility: private/org/public */
    visibility: varchar('visibility', { length: 20 })
      .notNull()
      .default('private'),

    // =========================================================================
    // Pipeline Outputs (JSONB)
    // =========================================================================

    /** Extraction result (JSONB) - props, variants, dependencies, stories */
    extraction: jsonb('extraction').$type<ExtractedData | null>(),

    /** Generation result (JSONB) - LLM-generated descriptions, patterns, guidance */
    generation: jsonb('generation').$type<ComponentMeta | null>(),

    /** LLM provider used for generation (e.g., 'anthropic') */
    generationProvider: varchar('generation_provider', {
      length: 50,
    }),

    /** LLM model used for generation (e.g., 'claude-sonnet-4-20250514') */
    generationModel: varchar('generation_model', { length: 100 }),

    /** Final manifest (JSONB) - combined output for AI consumption */
    manifest: jsonb('manifest').$type<AIManifest | null>(),

    // =========================================================================
    // Embedding (for semantic search)
    // =========================================================================

    /** Embedding status: pending/processing/indexed/failed */
    embeddingStatus: varchar('embedding_status', { length: 20 })
      .$type<EmbeddingStatus>()
      .notNull()
      .default('pending'),

    /** Error message if embedding failed */
    embeddingError: text('embedding_error'),

    /** Embedding model info (provider, model name, dimensions) */
    embeddingModel: jsonb('embedding_model').$type<EmbeddingModelInfo>(),

    /**
     * Full-text search vector (generated column).
     * Auto-computed on INSERT/UPDATE from name and manifest description.
     * Weight A = component name (highest priority)
     * Weight B = manifest description
     */
    searchVector: tsvector('search_vector').generatedAlwaysAs(
      sql`
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(manifest->>'description', '')), 'B')
      `
    ),

    // =========================================================================
    // Change Detection
    // =========================================================================

    /** Hash of source code for change detection */
    sourceHash: varchar('source_hash', { length: 64 }),

    // =========================================================================
    // Timestamps
    // =========================================================================

    /** Creation timestamp */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /** Last update timestamp */
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Unique constraint: one component per slug per organization
    uniqueIndex('components_org_slug_idx').on(table.orgId, table.slug),

    // Index for filtering by organization (all queries use this)
    index('components_org_id_idx').on(table.orgId),

    // Index for filtering by organization and framework
    index('components_org_framework_idx').on(table.orgId, table.framework),

    // Index for finding components needing embedding (org-scoped)
    index('components_org_embedding_status_idx').on(
      table.orgId,
      table.embeddingStatus
    ),

    // Index for background processor global pending queries
    index('components_embedding_status_updated_idx').on(
      table.embeddingStatus,
      table.updatedAt
    ),

    // GIN index for full-text search on search_vector
    index('components_search_vector_idx').using('gin', table.searchVector),
  ]
);

// =============================================================================
// Embedding Chunks
// =============================================================================

/**
 * Embedding chunks table
 *
 * Components are split into semantic chunks for better retrieval.
 * Each chunk gets its own embedding vector for semantic search.
 *
 * Multi-tenant: orgId required for all queries to prevent data leakage.
 */
export const embeddingChunks = pgTable(
  'embedding_chunks',
  {
    /** Auto-increment ID */
    id: serial('id').primaryKey(),

    /** Organization ID (for multi-tenant isolation) */
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id),

    /** Reference to component (cascade delete when component is removed) */
    componentId: uuid('component_id')
      .notNull()
      .references(() => components.id, { onDelete: 'cascade' }),

    /** Chunk type: description | props | examples | patterns | guidance */
    chunkType: varchar('chunk_type', { length: 50 })
      .$type<ChunkType>()
      .notNull(),

    /** Chunk text content */
    content: text('content').notNull(),

    /** Chunk sequence within type (for ordering multiple chunks of same type) */
    chunkIndex: integer('chunk_index').notNull().default(0),

    /** Vector embedding for semantic search (1024 dimensions for Voyage AI) */
    embedding: vector('embedding', { dimensions: 1024 }),

    /** Creation timestamp */
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Index for filtering by organization (all queries use this)
    index('embedding_chunks_org_id_idx').on(table.orgId),

    // Index for filtering by component
    index('embedding_chunks_component_id_idx').on(table.componentId),

    // Composite index for org+component queries (most common pattern)
    index('embedding_chunks_org_component_idx').on(
      table.orgId,
      table.componentId
    ),

    // HNSW index for fast approximate nearest neighbor search
    // Using cosine distance ops for semantic similarity
    index('embedding_chunks_embedding_hnsw_idx')
      .using('hnsw', table.embedding.op('vector_cosine_ops'))
      .with({ m: 16, ef_construction: 64 }),
  ]
);

// =============================================================================
// API Keys
// =============================================================================

/**
 * API keys table - authentication for Context Engine API
 *
 * Stores hashed API keys for authenticating requests.
 * Raw keys are never stored; only the HMAC-SHA256 hash is persisted.
 * The keyPrefix (first 8 chars after 'ce_') enables key identification
 * without exposing the full key.
 *
 * Multi-tenant: orgId scopes keys to an organization.
 */
export const apiKeys = pgTable(
  'api_keys',
  {
    /** API key ID (UUID) */
    id: uuid('id').defaultRandom().primaryKey(),

    /** Organization ID (FK) - cascade delete when org is removed */
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    /** Human-readable label for identifying the key */
    name: varchar('name', { length: 255 }).notNull(),

    /** HMAC-SHA256 hash of the raw API key */
    keyHash: varchar('key_hash', { length: 128 }).notNull(),

    /** First 8 characters after 'ce_' prefix for key identification */
    keyPrefix: varchar('key_prefix', { length: 8 }).notNull(),

    /** Array of permission scopes granted to this key */
    scopes: jsonb('scopes').$type<string[]>().notNull(),

    /** Hash algorithm version for future migration support */
    hashVersion: integer('hash_version').notNull().default(1),

    /** Whether this key is currently active */
    isActive: boolean('is_active').notNull().default(true),

    /** Timestamp of last API call using this key */
    lastUsedAt: timestamp('last_used_at'),

    /** Expiration timestamp (null = never expires) */
    expiresAt: timestamp('expires_at'),

    /** Creation timestamp */
    createdAt: timestamp('created_at').defaultNow().notNull(),

    /** Last update timestamp */
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    // Unique index on keyHash for fast lookup and uniqueness enforcement
    uniqueIndex('api_keys_key_hash_unique_idx').on(table.keyHash),

    // Index for filtering by organization (all queries use this)
    index('api_keys_org_id_idx').on(table.orgId),
  ]
);

// =============================================================================
// Type Exports (inferred from schema)
// =============================================================================

/** Organization select type */
export type Organization = typeof organizations.$inferSelect;

/** Organization insert type */
export type NewOrganization = typeof organizations.$inferInsert;

/** Component select type */
export type Component = typeof components.$inferSelect;

/** Component insert type */
export type NewComponent = typeof components.$inferInsert;

/** Embedding chunk select type */
export type EmbeddingChunk = typeof embeddingChunks.$inferSelect;

/** Embedding chunk insert type */
export type NewEmbeddingChunk = typeof embeddingChunks.$inferInsert;

/** API key select type */
export type ApiKey = typeof apiKeys.$inferSelect;

/** API key insert type */
export type NewApiKey = typeof apiKeys.$inferInsert;
