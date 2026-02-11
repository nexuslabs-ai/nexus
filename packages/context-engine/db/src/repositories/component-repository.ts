/**
 * Component Repository
 *
 * Simple CRUD operations for components.
 * All methods are scoped to an organization for multi-tenancy.
 */

import type { AIManifest } from '@context-engine/core';
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  sql,
} from 'drizzle-orm';

import type { Database } from '../client.js';
import { type Component, components, type NewComponent } from '../schema.js';
import type { EmbeddingStatus } from '../types.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a keyword (full-text) search against the components table.
 *
 * Uses PostgreSQL's tsvector/tsquery for ranking by term relevance.
 * Score is computed by ts_rank and reflects how well the component's
 * searchVector matches the query (higher is more relevant).
 */
export interface KeywordSearchResult {
  /** Component UUID */
  componentId: string;
  /** URL-friendly identifier */
  slug: string;
  /** Human-readable component name */
  name: string;
  /** Component description extracted from manifest (may be null) */
  description: string | null;
  /** Target framework (e.g., 'react', 'vue') */
  framework: string;
  /** Full-text search rank score (higher is more relevant) */
  score: number;
}

/**
 * Options for finding components with manifests
 */
export interface FindAllManifestsOptions {
  /** Filter to specific slugs */
  slugs?: string[];
  /** Filter by framework */
  framework?: string;
  /** Maximum number of results (default: 100) */
  limit?: number;
}

/**
 * Result from findAllManifests containing component with manifest
 */
export interface ManifestResult {
  /** Component ID */
  id: string;
  /** URL-friendly identifier */
  slug: string;
  /** Component display name */
  name: string;
  /** Target framework */
  framework: string;
  /** Semantic version */
  version: string;
  /** AI manifest (always present due to isNotNull filter) */
  manifest: AIManifest;
}

/**
 * Options for finding multiple components
 */
export interface FindManyOptions {
  /** Filter conditions */
  where?: {
    framework?: string;
    visibility?: string;
    embeddingStatus?: EmbeddingStatus;
  };

  /** Maximum number of results */
  limit?: number;

  /** Number of results to skip */
  offset?: number;

  /** Field to order by */
  orderBy?: 'name' | 'updatedAt' | 'createdAt';

  /** Order direction */
  orderDir?: 'asc' | 'desc';
}

// =============================================================================
// Repository
// =============================================================================

/**
 * Repository for component CRUD operations
 *
 * All operations are scoped to an organization for multi-tenancy.
 */
export class ComponentRepository {
  constructor(private db: Database) {}

  /**
   * Create a new component
   */
  async create(
    orgId: string,
    data: Omit<NewComponent, 'orgId'>
  ): Promise<Component> {
    const [result] = await this.db
      .insert(components)
      .values({ ...data, orgId })
      .returning();

    if (!result) {
      throw new Error('Failed to create component: no row returned');
    }

    return result;
  }

  /**
   * Find component by ID
   */
  async findById(orgId: string, id: string): Promise<Component | null> {
    const [result] = await this.db
      .select()
      .from(components)
      .where(and(eq(components.orgId, orgId), eq(components.id, id)))
      .limit(1);

    return result ?? null;
  }

  /**
   * Find component by name (case-insensitive)
   */
  async findByName(orgId: string, name: string): Promise<Component | null> {
    const [result] = await this.db
      .select()
      .from(components)
      .where(
        and(
          eq(components.orgId, orgId),
          sql`lower(${components.name}) = lower(${name})`
        )
      )
      .limit(1);

    return result ?? null;
  }

  /**
   * Find component by slug
   */
  async findBySlug(orgId: string, slug: string): Promise<Component | null> {
    const [result] = await this.db
      .select()
      .from(components)
      .where(and(eq(components.orgId, orgId), eq(components.slug, slug)))
      .limit(1);

    return result ?? null;
  }

  /**
   * Find multiple components with optional filters
   *
   * @returns Object containing the paginated components and total count
   */
  async findMany(
    orgId: string,
    options: FindManyOptions = {}
  ): Promise<{ components: Component[]; total: number }> {
    const {
      where = {},
      limit = 50,
      offset = 0,
      orderBy = 'updatedAt',
      orderDir = 'desc',
    } = options;

    // Build conditions
    const conditions = [eq(components.orgId, orgId)];

    if (where.framework) {
      conditions.push(eq(components.framework, where.framework));
    }
    if (where.visibility) {
      conditions.push(eq(components.visibility, where.visibility));
    }
    if (where.embeddingStatus) {
      conditions.push(eq(components.embeddingStatus, where.embeddingStatus));
    }

    // Count total matching records (without pagination)
    const [countResult] = await this.db
      .select({ count: count() })
      .from(components)
      .where(and(...conditions));

    const total = countResult?.count ?? 0;

    // Order column
    const orderColumn = {
      name: components.name,
      updatedAt: components.updatedAt,
      createdAt: components.createdAt,
    }[orderBy];

    const orderFn = orderDir === 'desc' ? desc : asc;

    // Fetch paginated results
    const componentsList = await this.db
      .select()
      .from(components)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);

    return { components: componentsList, total };
  }

  /**
   * Find all components that have manifests for an organization.
   * Used for bundle resolution and bulk manifest retrieval.
   *
   * @param orgId - Organization ID for multi-tenant isolation
   * @param options - Optional filters and pagination
   * @returns Components with their manifests
   */
  async findAllManifests(
    orgId: string,
    options: FindAllManifestsOptions = {}
  ): Promise<ManifestResult[]> {
    const { slugs, framework, limit = 100 } = options;

    // Build conditions
    const conditions = [
      eq(components.orgId, orgId),
      isNotNull(components.manifest),
    ];

    if (slugs && slugs.length > 0) {
      conditions.push(inArray(components.slug, slugs));
    }

    if (framework) {
      conditions.push(eq(components.framework, framework));
    }

    const rows = await this.db
      .select({
        id: components.id,
        slug: components.slug,
        name: components.name,
        framework: components.framework,
        version: components.version,
        manifest: components.manifest,
      })
      .from(components)
      .where(and(...conditions))
      .orderBy(asc(components.name))
      .limit(limit);

    return rows as ManifestResult[];
  }

  /**
   * Update a component
   */
  async update(
    orgId: string,
    id: string,
    data: Partial<Omit<NewComponent, 'id' | 'orgId'>>
  ): Promise<Component | null> {
    const [result] = await this.db
      .update(components)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(components.orgId, orgId), eq(components.id, id)))
      .returning();

    return result ?? null;
  }

  /**
   * Upsert a component (insert or update by slug)
   */
  async upsert(
    orgId: string,
    data: Omit<NewComponent, 'orgId'>
  ): Promise<Component> {
    const [result] = await this.db
      .insert(components)
      .values({ ...data, orgId })
      .onConflictDoUpdate({
        target: [components.orgId, components.slug],
        set: {
          name: data.name,
          version: data.version,
          framework: data.framework,
          visibility: data.visibility,
          extraction: data.extraction,
          generation: data.generation,
          generationProvider: data.generationProvider,
          generationModel: data.generationModel,
          manifest: data.manifest,
          embeddingStatus: data.embeddingStatus,
          embeddingError: data.embeddingError,
          embeddingModel: data.embeddingModel,
          sourceHash: data.sourceHash,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error('Failed to upsert component: no row returned');
    }

    return result;
  }

  /**
   * Delete a component
   *
   * @returns The deleted component, or null if not found
   */
  async delete(orgId: string, id: string): Promise<Component | null> {
    const [result] = await this.db
      .delete(components)
      .where(and(eq(components.orgId, orgId), eq(components.id, id)))
      .returning();

    return result ?? null;
  }

  /**
   * Count components for an organization
   */
  async count(orgId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(components)
      .where(eq(components.orgId, orgId));

    return result?.count ?? 0;
  }

  /**
   * Count components grouped by embedding status.
   *
   * Returns a record with all possible statuses, defaulting to 0
   * for any status that has no matching components.
   */
  async countByEmbeddingStatus(
    orgId: string
  ): Promise<Record<EmbeddingStatus, number>> {
    const results = await this.db
      .select({
        status: components.embeddingStatus,
        count: count(),
      })
      .from(components)
      .where(eq(components.orgId, orgId))
      .groupBy(components.embeddingStatus);

    // Initialize all statuses to 0
    const counts: Record<EmbeddingStatus, number> = {
      pending: 0,
      processing: 0,
      indexed: 0,
      failed: 0,
    };

    for (const row of results) {
      if (row.status) {
        counts[row.status] = Number(row.count);
      }
    }

    return counts;
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  /**
   * Full-text keyword search using the pre-computed searchVector (tsvector) column.
   *
   * Uses PostgreSQL's websearch_to_tsquery for user-friendly query parsing
   * (supports natural syntax like "button loading", "dialog OR modal").
   * Results are ranked by ts_rank, which scores based on term frequency
   * and weight (component name = weight A, description = weight B).
   *
   * Only returns components with embeddingStatus = 'indexed' (fully searchable).
   *
   * @param orgId - Organization ID (for multi-tenant isolation)
   * @param query - User search query (parsed by websearch_to_tsquery)
   * @param options - Optional filters: limit (maximum, fewer may be returned if
   *   scores fall below minScore), minScore, framework
   * @returns Components matching the query, ordered by relevance score descending
   */
  async searchKeyword(
    orgId: string,
    query: string,
    options: { limit?: number; minScore?: number; framework?: string } = {}
  ): Promise<KeywordSearchResult[]> {
    const { limit = 10, minScore = 0, framework } = options;

    // FTS query — must use sql (no Drizzle built-in for websearch_to_tsquery)
    const tsquery = sql`websearch_to_tsquery('english', ${query})`;

    // Build WHERE conditions: Drizzle built-ins for equality, sql for FTS match
    const conditions = [
      eq(components.orgId, orgId),
      eq(components.embeddingStatus, 'indexed'),
      sql`${components.searchVector} @@ ${tsquery}`,
    ];

    if (framework) {
      conditions.push(eq(components.framework, framework));
    }

    // Query with ts_rank scoring
    const results = await this.db
      .select({
        componentId: components.id,
        slug: components.slug,
        name: components.name,
        description: sql<string | null>`${components.manifest}->>'description'`,
        framework: components.framework,
        score: sql<number>`ts_rank(${components.searchVector}, ${tsquery}, 32)`,
      })
      .from(components)
      .where(and(...conditions))
      .orderBy(sql`ts_rank(${components.searchVector}, ${tsquery}, 32) DESC`)
      .limit(limit);

    // Normalize score to number and apply minimum score threshold
    return results
      .map((r) => ({ ...r, score: Number(r.score) }))
      .filter((r) => r.score >= minScore);
  }
}
