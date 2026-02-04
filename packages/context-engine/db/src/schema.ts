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
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

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
    extraction: jsonb('extraction').$type<ExtractedData>().notNull(),

    /** Generation result (JSONB) - LLM-generated descriptions, patterns, guidance */
    generation: jsonb('generation').$type<ComponentMeta>().notNull(),

    /** LLM provider used for generation (e.g., 'anthropic') */
    generationProvider: varchar('generation_provider', {
      length: 50,
    }).notNull(),

    /** LLM model used for generation (e.g., 'claude-sonnet-4-20250514') */
    generationModel: varchar('generation_model', { length: 100 }).notNull(),

    /** Final manifest (JSONB) - combined output for AI consumption */
    manifest: jsonb('manifest').$type<AIManifest>().notNull(),

    // =========================================================================
    // Embedding (for semantic search)
    // =========================================================================

    /** Embedding status: pending/processing/indexed/failed */
    embeddingStatus: varchar('embedding_status', { length: 20 })
      .notNull()
      .default('pending'),

    /** Error message if embedding failed */
    embeddingError: text('embedding_error'),

    // Note: embedding vector column (pgvector) will be added in future phase

    // =========================================================================
    // Change Detection
    // =========================================================================

    /** Hash of source code for change detection */
    sourceHash: varchar('source_hash', { length: 64 }).notNull(),

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

    // Index for finding components needing embedding
    index('components_org_embedding_status_idx').on(
      table.orgId,
      table.embeddingStatus
    ),
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
